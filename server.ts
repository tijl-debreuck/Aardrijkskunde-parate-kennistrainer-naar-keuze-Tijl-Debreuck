import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { initDatabase } from "./server/db";
import { createAuthRouter, createUserDataRouter } from "./server/auth";
import { createAdminRouter, createContentRouter } from "./server/admin";

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
  max: 1000, // Ruim genoeg voor een klas achter één IP-adres (school-NAT)
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

const PORT = Number(process.env.PORT) || 3000;

// Accounts en gebruikersdata (PostgreSQL)
app.use("/api/auth", createAuthRouter(authLimiter));
app.use("/api/user/data", createUserDataRouter());
app.use("/api/admin", createAdminRouter(authLimiter));
app.use("/api/content", createContentRouter());

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
  await initDatabase();

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

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("Serverfout:", err);
    res.status(500).json({ success: false, error: "Interne serverfout." });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Server kon niet starten:", err);
  process.exit(1);
});
