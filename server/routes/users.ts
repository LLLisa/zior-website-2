import { Router } from "express";
import { all, one, run, type UserRow } from "../db";
import { requireAuth, type AuthRequest } from "../auth";

export const usersRouter = Router();

function dto(u: UserRow) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    isAdmin: !!u.is_admin,
    createdAt: u.created_at,
  };
}

function getUser(id: number | string) {
  return one<UserRow>(`SELECT * FROM users WHERE id = $1`, [id]);
}

async function adminCount(): Promise<number> {
  const row = await one<{ count: string }>(
    `SELECT COUNT(*) FROM users WHERE is_admin = TRUE`,
  );
  return Number(row?.count ?? 0);
}

// Non-admins may only act on non-admin users.
function canManage(actor: UserRow, target: UserRow): boolean {
  return actor.is_admin ? true : !target.is_admin;
}

usersRouter.use(requireAuth);

usersRouter.get("/", async (_req, res) => {
  const users = await all<UserRow>(`SELECT * FROM users ORDER BY email`);
  res.json(users.map(dto));
});

usersRouter.post("/", async (req: AuthRequest, res) => {
  const actor = req.user!;
  const email = String(req.body?.email || "").trim().toLowerCase();
  const name = String(req.body?.name ?? "").trim();
  const isAdmin = !!req.body?.isAdmin;
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    res.status(400).json({ error: "A valid email is required." });
    return;
  }
  if (isAdmin && !actor.is_admin) {
    res.status(403).json({ error: "Only admins can create admin users." });
    return;
  }
  const exists = await one(`SELECT 1 FROM users WHERE email = $1`, [email]);
  if (exists) {
    res.status(409).json({ error: "A user with that email already exists." });
    return;
  }
  const user = await one<UserRow>(
    `INSERT INTO users (email, name, is_admin) VALUES ($1, $2, $3) RETURNING *`,
    [email, name, isAdmin],
  );
  res.status(201).json(dto(user!));
});

usersRouter.patch("/:id", async (req: AuthRequest, res) => {
  const actor = req.user!;
  const target = await getUser(req.params.id);
  if (!target) {
    res.status(404).json({ error: "User not found." });
    return;
  }
  if (!canManage(actor, target)) {
    res.status(403).json({ error: "You can only manage non-admin users." });
    return;
  }
  if ("name" in (req.body ?? {})) {
    const name = String(req.body.name ?? "").trim();
    await run(`UPDATE users SET name = $1 WHERE id = $2`, [name, target.id]);
  }
  if ("isAdmin" in (req.body ?? {})) {
    const isAdmin = !!req.body.isAdmin;
    if (!actor.is_admin) {
      res.status(403).json({ error: "Only admins can change admin status." });
      return;
    }
    if (target.is_admin && !isAdmin && (await adminCount()) <= 1) {
      res.status(400).json({ error: "You can't remove the last admin." });
      return;
    }
    await run(`UPDATE users SET is_admin = $1 WHERE id = $2`, [isAdmin, target.id]);
  }
  res.json(dto((await getUser(target.id))!));
});

usersRouter.delete("/:id", async (req: AuthRequest, res) => {
  const actor = req.user!;
  const target = await getUser(req.params.id);
  if (!target) {
    res.status(404).json({ error: "User not found." });
    return;
  }
  if (!canManage(actor, target)) {
    res.status(403).json({ error: "You can only manage non-admin users." });
    return;
  }
  if (target.is_admin && (await adminCount()) <= 1) {
    res.status(400).json({ error: "You can't delete the last admin." });
    return;
  }
  await run(`DELETE FROM users WHERE id = $1`, [target.id]);
  res.json({ ok: true });
});
