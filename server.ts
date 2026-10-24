import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import crypto from "crypto";

dotenv.config();

const app = express();

// Trust proxy for rate limiting behind reverse proxies (like Cloud Run or Nginx)
app.set("trust proxy", 1);

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // In development with Vite, strict CSP might block HMR/eval. Can be tailored for prod.
}));

app.use(express.json({ limit: "500kb" })); // Ruime limiet voor folders en voortgangsync

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { success: false, error: "Te veel verzoeken. Probeer het later opnieuw." },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuten
  max: 30, // 30 inlogpogingen per 15 minuten
  message: { success: false, error: "Te veel mislukte inlogpogingen. Probeer het over een kwartier opnieuw." },
  validate: { xForwardedForHeader: false },
});

// Apply general rate limiting to all API routes
app.use("/api/", apiLimiter);

const PORT = 3000;

// Helper to compute SHA-256 buffer
function hashPasswordToBuffer(pwd: string): Buffer {
  return crypto.createHash('sha256').update(pwd).digest();
}

// API endpoint for admin password verification
app.post("/api/admin/verify", authLimiter, async (req, res) => {
  try {
    // 1. Artificial delay to throttle brute-force attempts
    await new Promise(resolve => setTimeout(resolve, 300));

    // 2. Server-side Referer & Origin validation
    const referer = (req.headers.referer || req.headers.origin || "").toString();
    const host = (req.headers.host || "").toString();

    if (referer && host && !referer.includes(host) && process.env.NODE_ENV === "production") {
      return res.status(403).json({ success: false, error: "Toegang geweigerd: Ongeldige herkomst van verzoek." });
    }

    const { password } = req.body;
    
    if (!password || typeof password !== "string") {
      return res.status(400).json({ success: false, error: "Voer een wachtwoord in." });
    }

    const inputTrimmed = password.trim();
    const inputHash = hashPasswordToBuffer(inputTrimmed);

    // 3. Verzamel alle geldige hashes uit omgevingsvariabelen
    const validTargetHashes: Buffer[] = [];

    // Controleer ADMIN_PASSWORD
    if (process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.trim().length > 0) {
      validTargetHashes.push(hashPasswordToBuffer(process.env.ADMIN_PASSWORD.trim()));
    }

    // Controleer ADMIN_PASSWORD_HASH (zowel als directe 64-karakter SHA-256 hash als gewone tekst)
    if (process.env.ADMIN_PASSWORD_HASH && process.env.ADMIN_PASSWORD_HASH.trim().length > 0) {
      const hashTrim = process.env.ADMIN_PASSWORD_HASH.trim();
      if (/^[a-fA-F0-9]{64}$/.test(hashTrim)) {
        validTargetHashes.push(Buffer.from(hashTrim.toLowerCase(), 'hex'));
      } else {
        validTargetHashes.push(hashPasswordToBuffer(hashTrim));
      }
    }

    // Controleer fallback voor lokale ontwikkeling indien niets ingesteld
    if (validTargetHashes.length === 0) {
      if (process.env.NODE_ENV === "production") {
        return res.status(403).json({ 
          success: false, 
          error: "Toegang geweigerd: Beheerderswachtwoord is niet geconfigureerd in de omgevingsvariabelen." 
        });
      }
      // Lokale ontwikkelmodus fallback met console waarschuwing
      console.warn("⚠️ LET OP: Geen ADMIN_PASSWORD ingesteld. Fallback-wachtwoord 'admin' actief voor lokaal testen.");
      validTargetHashes.push(hashPasswordToBuffer('admin'));
    }

    // 4. Constant-time SHA-256 vergelijking tegen alle geconfigureerde hashes
    let isMatch = false;
    for (const targetHash of validTargetHashes) {
      if (inputHash.length === targetHash.length && crypto.timingSafeEqual(inputHash, targetHash)) {
        isMatch = true;
        break;
      }
    }

    if (isMatch) {
      return res.json({ success: true });
    }
    
    return res.status(401).json({ success: false, error: "Onjuist wachtwoord!" });
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(500).json({ success: false, error: "Interne serverfout." });
  }
});

// In-memory data store met server-side synchronisatie voor gebruikersmappen en voortgang
interface UserSyncRecord {
  userId: string;
  folders: any[];
  progress?: any;
  stats?: any;
  preferences?: any;
  syncedAt: string;
  ip?: string;
}

const userSyncStore = new Map<string, UserSyncRecord>();

// API endpoint om leermapjes en voortgang automatisch van localStorage naar de backend te sturen
app.post("/api/user/sync", (req, res) => {
  try {
    const { userId, folders, progress, stats, preferences } = req.body;

    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ success: false, error: "Geldig userId is vereist voor synchronisatie." });
    }

    if (folders && !Array.isArray(folders)) {
      return res.status(400).json({ success: false, error: "Folders moeten een lijst (array) zijn." });
    }

    const now = new Date().toISOString();
    const record: UserSyncRecord = {
      userId,
      folders: folders || [],
      progress: progress || {},
      stats: stats || {},
      preferences: preferences || {},
      syncedAt: now,
      ip: (req.ip || "").toString()
    };

    userSyncStore.set(userId, record);

    return res.json({
      success: true,
      lastSynced: now,
      folderCount: (record.folders || []).length,
      message: "Data succesvol gesynchroniseerd met de backend service."
    });
  } catch (error) {
    console.error("Sync error:", error);
    return res.status(500).json({ success: false, error: "Interne fout bij synchroniseren." });
  }
});

// API endpoint om gesynchroniseerde data op te halen voor een account
app.get("/api/user/sync/:userId", (req, res) => {
  const { userId } = req.params;
  const data = userSyncStore.get(userId);

  if (!data) {
    return res.json({ success: true, data: null, message: "Nog geen backend synchronisatie geregistreerd voor dit account." });
  }

  return res.json({ success: true, data });
});

// Security.txt endpoint according to RFC 9116
app.get(["/.well-known/security.txt", "/security.txt"], (_req, res) => {
  res.type("text/plain").send(
    `Contact: mailto:security@geotrainer.app\n` +
    `Expires: 2027-12-31T23:59:59.000Z\n` +
    `Preferred-Languages: nl, en\n` +
    `Canonical: /.well-known/security.txt\n`
  );
});

// Configure Vite or Static Serve
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
