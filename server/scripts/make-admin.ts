import { db } from "../db";

// Usage: npm run seed:admin -- someone@example.com
const email = (process.argv[2] || "").trim().toLowerCase();
if (!email) {
  console.error("Usage: npm run seed:admin -- <email>");
  process.exit(1);
}

db.prepare(
  `INSERT INTO users (email, is_admin) VALUES (?, 1)
   ON CONFLICT(email) DO UPDATE SET is_admin = 1`,
).run(email);

console.log(`${email} is now an admin.`);
