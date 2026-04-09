import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import { connectDb } from "../config/db.js";
import { getDb } from "../config/db.js";

dotenv.config();

const run = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("Missing ADMIN_EMAIL or ADMIN_PASSWORD.");
  }

  await connectDb();
  const db = getDb();
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await db.query("SELECT id FROM admins WHERE email = $1 LIMIT 1", [normalizedEmail]);
  if (existing.rows[0]) {
    // eslint-disable-next-line no-console
    console.log("Admin already exists.");
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.query(
    "INSERT INTO admins (email, password_hash, role, created_at, updated_at) VALUES ($1, $2, 'admin', NOW(), NOW())",
    [normalizedEmail, passwordHash]
  );
  // eslint-disable-next-line no-console
  console.log("Admin created.");
  process.exit(0);
};

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
