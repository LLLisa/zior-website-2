import { initDb, run, pool } from "../db";

// Usage: npm run seed:admin -- someone@example.com
const email = (process.argv[2] || "").trim().toLowerCase();
if (!email) {
  console.error("Usage: npm run seed:admin -- <email>");
  process.exit(1);
}

await initDb();
await run(
  `INSERT INTO users (email, is_admin) VALUES ($1, TRUE)
   ON CONFLICT (email) DO UPDATE SET is_admin = TRUE`,
  [email],
);
console.log(`${email} is now an admin.`);
await pool.end();
