import express, { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { promisify } from "util";
import { pool } from "./db";

const scrypt = promisify(crypto.scrypt) as (pwd: string, salt: Buffer, keylen: number) => Promise<Buffer>;

const SESSION_COOKIE = "geo_session";
const SESSION_DAYS = 30;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 200;

// ----------------------------------------------------
// Wachtwoorden (scrypt met willekeurige salt per gebruiker)
// ----------------------------------------------------

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  const key = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltHex, keyHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !keyHex) return false;
  const expected = Buffer.from(keyHex, "hex");
  const actual = await scrypt(password, Buffer.from(saltHex, "hex"), expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

// Gebruikt bij onbekend e-mailadres zodat de responstijd niet verraadt of een account bestaat
const DUMMY_HASH_PROMISE = hashPassword(crypto.randomBytes(16).toString("hex"));

// ----------------------------------------------------
// Sessies (willekeurig token in cookie, enkel de SHA-256 ervan in de database)
// ----------------------------------------------------

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function readCookie(req: Request, cookieName: string): string | null {
  const header = req.headers.cookie;
  if (!header) return null;
  for (const part of header.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === cookieName) return decodeURIComponent(rest.join("="));
  }
  return null;
}

function readSessionToken(req: Request): string | null {
  return readCookie(req, SESSION_COOKIE);
}

async function createSession(res: Response, userId: string): Promise<void> {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await pool.query(
    "INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)",
    [hashToken(token), userId, expiresAt]
  );
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE, { path: "/" });
}

interface PublicUser {
  uid: string;
  email: string;
  displayName: string | null;
}

function toPublicUser(row: { id: string; email: string; display_name: string | null }): PublicUser {
  return { uid: row.id, email: row.email, displayName: row.display_name };
}

async function getSessionUser(req: Request): Promise<PublicUser | null> {
  const token = readSessionToken(req);
  if (!token) return null;
  const { rows } = await pool.query(
    `SELECT u.id, u.email, u.display_name
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = $1 AND s.expires_at > now()`,
    [hashToken(token)]
  );
  return rows[0] ? toPublicUser(rows[0]) : null;
}

export interface AuthedRequest extends Request {
  user?: PublicUser;
}

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: "Je bent niet ingelogd." });
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

// ----------------------------------------------------
// Routes
// ----------------------------------------------------

function parseCredentials(body: any): { email: string; password: string } | string {
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return "Voer een geldig e-mailadres in.";
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Je wachtwoord moet minstens ${MIN_PASSWORD_LENGTH} tekens lang zijn.`;
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return "Je wachtwoord is te lang.";
  }
  return { email, password };
}

export function createAuthRouter(authLimiter: express.RequestHandler) {
  const router = express.Router();

  router.post("/register", authLimiter, async (req, res, next) => {
    try {
      const creds = parseCredentials(req.body);
      if (typeof creds === "string") {
        return res.status(400).json({ success: false, error: creds });
      }

      const namePart = creds.email.split("@")[0] || "Gebruiker";
      const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      const passwordHash = await hashPassword(creds.password);

      const { rows } = await pool.query(
        `INSERT INTO users (email, password_hash, display_name) VALUES ($1, $2, $3)
         ON CONFLICT (email) DO NOTHING
         RETURNING id, email, display_name`,
        [creds.email, passwordHash, displayName]
      );
      if (!rows[0]) {
        return res.status(409).json({ success: false, error: "Er bestaat al een account met dit e-mailadres." });
      }

      await createSession(res, rows[0].id);
      return res.json({ success: true, user: toPublicUser(rows[0]) });
    } catch (err) {
      next(err);
    }
  });

  router.post("/login", authLimiter, async (req, res, next) => {
    try {
      const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
      const password = typeof req.body?.password === "string" ? req.body.password : "";
      if (!email || !password || password.length > MAX_PASSWORD_LENGTH) {
        return res.status(400).json({ success: false, error: "Voer je e-mailadres en wachtwoord in." });
      }

      const { rows } = await pool.query(
        "SELECT id, email, display_name, password_hash FROM users WHERE email = $1",
        [email]
      );
      const row = rows[0];
      const valid = await verifyPassword(password, row ? row.password_hash : await DUMMY_HASH_PROMISE);
      if (!row || !valid) {
        return res.status(401).json({ success: false, error: "Onjuist e-mailadres of wachtwoord." });
      }

      await createSession(res, row.id);
      return res.json({ success: true, user: toPublicUser(row) });
    } catch (err) {
      next(err);
    }
  });

  router.post("/logout", async (req, res, next) => {
    try {
      const token = readSessionToken(req);
      if (token) {
        await pool.query("DELETE FROM sessions WHERE token_hash = $1", [hashToken(token)]);
      }
      clearSessionCookie(res);
      return res.json({ success: true });
    } catch (err) {
      next(err);
    }
  });

  router.get("/me", async (req, res, next) => {
    try {
      const user = await getSessionUser(req);
      return res.json({ success: true, user });
    } catch (err) {
      next(err);
    }
  });

  // Recht op vergetelheid: verwijdert account, sessies en alle data (ON DELETE CASCADE)
  router.delete("/account", requireAuth, async (req: AuthedRequest, res, next) => {
    try {
      await pool.query("DELETE FROM users WHERE id = $1", [req.user!.uid]);
      clearSessionCookie(res);
      return res.json({ success: true });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

// ----------------------------------------------------
// Gebruikersdata (voorkeuren, statistieken, voortgang, leermapjes)
// ----------------------------------------------------

function isPlainObject(v: unknown): boolean {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function createUserDataRouter() {
  const router = express.Router();
  router.use(requireAuth);

  router.get("/", async (req: AuthedRequest, res, next) => {
    try {
      const { rows } = await pool.query(
        `SELECT preferences, geo_stats, geo_progress, folders, settings, consent, updated_at
           FROM user_data WHERE user_id = $1`,
        [req.user!.uid]
      );
      const row = rows[0];
      return res.json({
        success: true,
        data: row
          ? {
              preferences: row.preferences,
              geoStats: row.geo_stats,
              geoProgress: row.geo_progress,
              folders: row.folders,
              settings: row.settings,
              consent: row.consent,
              updatedAt: row.updated_at,
            }
          : null,
      });
    } catch (err) {
      next(err);
    }
  });

  // Werkt enkel de meegestuurde velden bij; maakt de rij aan als die nog niet bestaat
  router.put("/", async (req: AuthedRequest, res, next) => {
    try {
      const { preferences, geoStats, geoProgress, folders, settings, consent } = req.body || {};

      for (const [name, val] of Object.entries({ preferences, geoStats, geoProgress, settings, consent })) {
        if (val !== undefined && !isPlainObject(val)) {
          return res.status(400).json({ success: false, error: `Ongeldig veld: ${name}.` });
        }
      }
      if (folders !== undefined && !Array.isArray(folders)) {
        return res.status(400).json({ success: false, error: "Folders moeten een lijst (array) zijn." });
      }

      const json = (v: unknown) => (v === undefined ? null : JSON.stringify(v));
      const { rows } = await pool.query(
        `INSERT INTO user_data (user_id, preferences, geo_stats, geo_progress, folders, settings, consent)
         VALUES ($1, COALESCE($2::jsonb, '{}'::jsonb), COALESCE($3::jsonb, '{}'::jsonb), COALESCE($4::jsonb, '{}'::jsonb), $5::jsonb,
                 COALESCE($6::jsonb, '{}'::jsonb), $7::jsonb)
         ON CONFLICT (user_id) DO UPDATE SET
           preferences  = COALESCE($2::jsonb, user_data.preferences),
           geo_stats    = COALESCE($3::jsonb, user_data.geo_stats),
           geo_progress = COALESCE($4::jsonb, user_data.geo_progress),
           folders      = COALESCE($5::jsonb, user_data.folders),
           settings     = COALESCE($6::jsonb, user_data.settings),
           consent      = COALESCE($7::jsonb, user_data.consent),
           updated_at   = now()
         RETURNING updated_at`,
        [req.user!.uid, json(preferences), json(geoStats), json(geoProgress), json(folders), json(settings), json(consent)]
      );

      return res.json({ success: true, updatedAt: rows[0].updated_at });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
