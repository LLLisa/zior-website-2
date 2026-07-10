import { Router } from "express";
import { db, type UserRow } from "../db";
import { requireAuth, type AuthRequest } from "../auth";

export const usersRouter = Router();

function dto(u: UserRow) {
  return {
    id: u.id,
    email: u.email,
    isAdmin: !!u.is_admin,
    createdAt: u.created_at,
  };
}

function getUser(id: number | string): UserRow | undefined {
  return db.prepare(`SELECT * FROM users WHERE id = ?`).get(id) as
    | UserRow
    | undefined;
}

function adminCount(): number {
  return (
    db.prepare(`SELECT COUNT(*) AS c FROM users WHERE is_admin = 1`).get() as {
      c: number;
    }
  ).c;
}

// Non-admins may only act on non-admin users.
function canManage(actor: UserRow, target: UserRow): boolean {
  return actor.is_admin ? true : !target.is_admin;
}

usersRouter.use(requireAuth);

usersRouter.get("/", (_req, res) => {
  const users = db.prepare(`SELECT * FROM users ORDER BY email`).all() as UserRow[];
  res.json(users.map(dto));
});

usersRouter.post("/", (req: AuthRequest, res) => {
  const actor = req.user!;
  const email = String(req.body?.email || "").trim().toLowerCase();
  const isAdmin = !!req.body?.isAdmin;
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    res.status(400).json({ error: "A valid email is required." });
    return;
  }
  if (isAdmin && !actor.is_admin) {
    res.status(403).json({ error: "Only admins can create admin users." });
    return;
  }
  const exists = db.prepare(`SELECT 1 FROM users WHERE email = ?`).get(email);
  if (exists) {
    res.status(409).json({ error: "A user with that email already exists." });
    return;
  }
  const info = db
    .prepare(`INSERT INTO users (email, is_admin) VALUES (?, ?)`)
    .run(email, isAdmin ? 1 : 0);
  res.status(201).json(dto(getUser(Number(info.lastInsertRowid))!));
});

usersRouter.patch("/:id", (req: AuthRequest, res) => {
  const actor = req.user!;
  const target = getUser(req.params.id);
  if (!target) {
    res.status(404).json({ error: "User not found." });
    return;
  }
  if (!canManage(actor, target)) {
    res.status(403).json({ error: "You can only manage non-admin users." });
    return;
  }
  if ("isAdmin" in (req.body ?? {})) {
    const isAdmin = !!req.body.isAdmin;
    if (!actor.is_admin) {
      res.status(403).json({ error: "Only admins can change admin status." });
      return;
    }
    if (target.is_admin && !isAdmin && adminCount() <= 1) {
      res.status(400).json({ error: "You can't remove the last admin." });
      return;
    }
    db.prepare(`UPDATE users SET is_admin = ? WHERE id = ?`).run(
      isAdmin ? 1 : 0,
      target.id,
    );
  }
  res.json(dto(getUser(target.id)!));
});

usersRouter.delete("/:id", (req: AuthRequest, res) => {
  const actor = req.user!;
  const target = getUser(req.params.id);
  if (!target) {
    res.status(404).json({ error: "User not found." });
    return;
  }
  if (!canManage(actor, target)) {
    res.status(403).json({ error: "You can only manage non-admin users." });
    return;
  }
  if (target.is_admin && adminCount() <= 1) {
    res.status(400).json({ error: "You can't delete the last admin." });
    return;
  }
  db.prepare(`DELETE FROM users WHERE id = ?`).run(target.id);
  res.json({ ok: true });
});
