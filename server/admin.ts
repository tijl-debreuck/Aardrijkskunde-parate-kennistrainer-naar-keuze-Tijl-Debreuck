import express, { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { pool } from "./db";
import { hashToken, readCookie } from "./auth";

const ADMIN_COOKIE = "geo_admin";
const ADMIN_SESSION_HOURS = 12;
const startedAt = Date.now();

// ----------------------------------------------------
// Beheerderswachtwoord (ADMIN_PASSWORD of ADMIN_PASSWORD_HASH)
// ----------------------------------------------------

function hashPasswordToBuffer(pwd: string): Buffer {
  return crypto.createHash('sha256').update(pwd).digest();
}

function getValidAdminHashes(): Buffer[] {
  const hashes: Buffer[] = [];

  if (process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.trim().length > 0) {
    hashes.push(hashPasswordToBuffer(process.env.ADMIN_PASSWORD.trim()));
  }

  // Zowel als directe 64-karakter SHA-256 hash als gewone tekst
  if (process.env.ADMIN_PASSWORD_HASH && process.env.ADMIN_PASSWORD_HASH.trim().length > 0) {
    const hashTrim = process.env.ADMIN_PASSWORD_HASH.trim();
    if (/^[a-fA-F0-9]{64}$/.test(hashTrim)) {
      hashes.push(Buffer.from(hashTrim.toLowerCase(), 'hex'));
    } else {
      hashes.push(hashPasswordToBuffer(hashTrim));
    }
  }

  return hashes;
}

function isPasswordConfigured(): boolean {
  return getValidAdminHashes().length > 0;
}

// ----------------------------------------------------
// Admin-sessies (los van gewone accounts)
// ----------------------------------------------------

async function isAdminRequest(req: Request): Promise<boolean> {
  const token = readCookie(req, ADMIN_COOKIE);
  if (!token) return false;
  const { rows } = await pool.query(
    "SELECT 1 FROM admin_sessions WHERE token_hash = $1 AND expires_at > now()",
    [hashToken(token)]
  );
  return rows.length > 0;
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    if (!(await isAdminRequest(req))) {
      return res.status(401).json({ success: false, error: "Beheerderstoegang vereist." });
    }
    next();
  } catch (err) {
    next(err);
  }
}

async function createAdminSession(res: Response): Promise<void> {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_HOURS * 60 * 60 * 1000);
  await pool.query(
    "INSERT INTO admin_sessions (token_hash, expires_at) VALUES ($1, $2)",
    [hashToken(token), expiresAt]
  );
  res.cookie(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: expiresAt,
    path: "/",
  });
}

// ----------------------------------------------------
// Validatie quizitems
// ----------------------------------------------------

interface CustomItem {
  id: string;
  name: string;
  capital?: string | null;
  region: string;
  category: string;
}

function parseCustomItem(raw: any): CustomItem | null {
  if (!raw || typeof raw !== "object") return null;
  const str = (v: any, max: number) => (typeof v === "string" && v.trim().length > 0 && v.length <= max ? v.trim() : null);
  const name = str(raw.name, 200);
  const region = str(raw.region, 50);
  const category = str(raw.category, 50);
  if (!name || !region || !category) return null;
  return {
    id: str(raw.id, 200) || `custom-${region}-${category}-${crypto.randomBytes(6).toString("hex")}`,
    name,
    capital: str(raw.capital, 200),
    region,
    category,
  };
}

// ----------------------------------------------------
// Routes
// ----------------------------------------------------

export function createAdminRouter(authLimiter: express.RequestHandler) {
  const router = express.Router();

  router.post("/verify", authLimiter, async (req, res, next) => {
    try {
      // Kunstmatige vertraging tegen brute-force
      await new Promise(resolve => setTimeout(resolve, 300));

      const referer = (req.headers.referer || req.headers.origin || "").toString();
      const host = (req.headers.host || "").toString();
      if (referer && host && !referer.includes(host) && process.env.NODE_ENV === "production") {
        return res.status(403).json({ success: false, error: "Toegang geweigerd: Ongeldige herkomst van verzoek." });
      }

      const { password } = req.body || {};
      if (!password || typeof password !== "string") {
        return res.status(400).json({ success: false, error: "Voer een wachtwoord in." });
      }

      const validTargetHashes = getValidAdminHashes();
      if (validTargetHashes.length === 0) {
        if (process.env.NODE_ENV === "production") {
          return res.status(403).json({
            success: false,
            error: "Toegang geweigerd: Beheerderswachtwoord is niet geconfigureerd in de omgevingsvariabelen."
          });
        }
        console.warn("⚠️ LET OP: Geen ADMIN_PASSWORD ingesteld. Fallback-wachtwoord 'admin' actief voor lokaal testen.");
        validTargetHashes.push(hashPasswordToBuffer('admin'));
      }

      const inputHash = hashPasswordToBuffer(password.trim());
      const isMatch = validTargetHashes.some(
        target => inputHash.length === target.length && crypto.timingSafeEqual(inputHash, target)
      );
      if (!isMatch) {
        return res.status(401).json({ success: false, error: "Onjuist wachtwoord!" });
      }

      await createAdminSession(res);
      return res.json({ success: true });
    } catch (err) {
      next(err);
    }
  });

  router.get("/session", async (req, res, next) => {
    try {
      return res.json({ success: true, isAdmin: await isAdminRequest(req) });
    } catch (err) {
      next(err);
    }
  });

  router.post("/logout", async (req, res, next) => {
    try {
      const token = readCookie(req, ADMIN_COOKIE);
      if (token) {
        await pool.query("DELETE FROM admin_sessions WHERE token_hash = $1", [hashToken(token)]);
      }
      res.clearCookie(ADMIN_COOKIE, { path: "/" });
      return res.json({ success: true });
    } catch (err) {
      next(err);
    }
  });

  router.get("/status", requireAdmin, async (_req, res, next) => {
    try {
      let databaseOk = true;
      let counts = { users: 0, activeSessions: 0, customItems: 0 };
      try {
        const { rows } = await pool.query(`
          SELECT (SELECT count(*) FROM users)::int AS users,
                 (SELECT count(*) FROM sessions WHERE expires_at > now())::int AS "activeSessions",
                 (SELECT count(*) FROM custom_items)::int AS "customItems"
        `);
        counts = rows[0];
      } catch (err) {
        console.error("Database niet bereikbaar:", err);
        databaseOk = false;
      }
      return res.json({
        isPasswordConfigured: isPasswordConfigured(),
        uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
        timestamp: new Date().toISOString(),
        databaseOk,
        ...counts,
      });
    } catch (err) {
      next(err);
    }
  });

  // Overzicht van alle accounts (zonder wachtwoorden of inhoud van leermapjes)
  router.get("/users", requireAdmin, async (_req, res, next) => {
    try {
      const { rows } = await pool.query(`
        SELECT u.id, u.email, u.display_name, u.created_at,
               d.updated_at,
               CASE WHEN jsonb_typeof(d.geo_stats->'totalAnswered') = 'number'
                    THEN LEAST(GREATEST((d.geo_stats->>'totalAnswered')::numeric, 0), 2147483647)::int
                    ELSE 0 END AS total_answered,
               COALESCE(jsonb_array_length(d.folders), 0) AS folder_count
          FROM users u LEFT JOIN user_data d ON d.user_id = u.id
         ORDER BY u.created_at DESC
         LIMIT 500
      `);
      return res.json({
        success: true,
        users: rows.map(r => ({
          uid: r.id,
          email: r.email,
          displayName: r.display_name,
          createdAt: r.created_at,
          lastActive: r.updated_at,
          totalAnswered: r.total_answered,
          folderCount: r.folder_count,
        })),
      });
    } catch (err) {
      next(err);
    }
  });

  // Voegt items toe of overschrijft ze op id (gebruikt bij importeren van een backup)
  router.post("/custom-items", requireAdmin, async (req, res, next) => {
    try {
      const list = Array.isArray(req.body?.items) ? req.body.items : null;
      if (!list) {
        return res.status(400).json({ success: false, error: "Verwacht een lijst items." });
      }
      const items = list.map(parseCustomItem).filter((it: CustomItem | null): it is CustomItem => it !== null);

      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        for (const it of items) {
          await client.query(
            `INSERT INTO custom_items (id, name, capital, region, category) VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (id) DO UPDATE SET name = $2, capital = $3, region = $4, category = $5`,
            [it.id, it.name, it.capital, it.region, it.category]
          );
        }
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }

      return res.json({ success: true, imported: items.length, skipped: list.length - items.length });
    } catch (err) {
      next(err);
    }
  });

  router.delete("/custom-items/:id", requireAdmin, async (req, res, next) => {
    try {
      await pool.query("DELETE FROM custom_items WHERE id = $1", [req.params.id]);
      return res.json({ success: true });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

// Publiek: de quiz haalt hier de extra items op
export function createContentRouter() {
  const router = express.Router();

  router.get("/custom-items", async (_req, res, next) => {
    try {
      const { rows } = await pool.query(
        "SELECT id, name, capital, region, category FROM custom_items ORDER BY created_at DESC"
      );
      return res.json({ success: true, items: rows });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
