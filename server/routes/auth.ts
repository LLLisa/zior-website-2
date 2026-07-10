import { Router } from "express";
import { parse } from "cookie";
import { db, type UserRow } from "../db";
import { config } from "../config";
import {
  createLoginToken,
  consumeLoginToken,
  createSession,
  destroySession,
  sessionCookie,
  clearCookie,
  type AuthRequest,
} from "../auth";
import { sendMagicLink } from "../mailer";

export const authRouter = Router();

function publicUser(u: UserRow) {
  return { id: u.id, email: u.email, isAdmin: !!u.is_admin };
}

// Request a magic link. Always responds the same way to avoid leaking which
// emails have accounts. Accounts are admin-created, so unknown emails no-op.
authRouter.post("/login", async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  if (ok) {
    const user = db
      .prepare(`SELECT id FROM users WHERE email = ?`)
      .get(email);
    if (user) {
      const token = createLoginToken(email);
      const url = `${config.appUrl}/auth/verify?token=${token}`;
      try {
        await sendMagicLink(email, url);
      } catch (err) {
        console.error("Magic link send failed:", err);
        res.status(502).json({ error: "Could not send email. Try again later." });
        return;
      }
    }
  }
  res.json({ ok: true });
});

// Consume the magic link, start a session, and bounce back into the app.
authRouter.get("/verify", (req, res) => {
  const token = String(req.query.token || "");
  const email = token ? consumeLoginToken(token) : null;
  if (!email) {
    res.redirect(`${config.appUrl}/login?error=expired`);
    return;
  }
  const user = db
    .prepare(`SELECT * FROM users WHERE email = ?`)
    .get(email) as UserRow | undefined;
  if (!user) {
    res.redirect(`${config.appUrl}/login?error=expired`);
    return;
  }
  const session = createSession(user.id);
  res.setHeader("Set-Cookie", sessionCookie(session));
  res.redirect(`${config.appUrl}/`);
});

authRouter.post("/logout", (req: AuthRequest, res) => {
  const raw = req.headers.cookie
    ? parse(req.headers.cookie)[config.cookieName]
    : undefined;
  destroySession(raw);
  res.setHeader("Set-Cookie", clearCookie());
  res.json({ ok: true });
});

authRouter.get("/me", (req: AuthRequest, res) => {
  res.json({ user: req.user ? publicUser(req.user) : null });
});
