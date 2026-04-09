import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { getDb } from "../config/db.js";
import { fail } from "../utils/httpError.js";

export const registerAdmin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return fail(res, 400, "البريد وكلمة المرور مطلوبان.", "VALIDATION");
  }

  const db = getDb();
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await db.query("SELECT id FROM admins WHERE email = $1 LIMIT 1", [normalizedEmail]);
  if (existing.rows[0]) {
    return fail(res, 409, "هذا البريد مسجّل مسبقاً.", "EMAIL_TAKEN");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const role = "user";
  const inserted = await db.query(
    "INSERT INTO admins (email, password_hash, role, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id, email, role",
    [normalizedEmail, passwordHash, role]
  );

  const admin = inserted.rows[0];
  const token = jwt.sign(
    { id: String(admin.id), email: admin.email, role: admin.role },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return res.status(201).json({
    token,
    admin: { id: String(admin.id), email: admin.email, role: admin.role },
  });
};

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return fail(res, 400, "البريد وكلمة المرور مطلوبان.", "VALIDATION");
  }

  const db = getDb();
  const normalizedEmail = email.toLowerCase().trim();
  const result = await db.query(
    "SELECT id, email, password_hash, COALESCE(role, 'user') AS role FROM admins WHERE email = $1 LIMIT 1",
    [normalizedEmail]
  );
  const admin = result.rows[0];

  if (!admin) {
    return fail(res, 401, "البريد أو كلمة المرور غير صحيحة.", "INVALID_CREDENTIALS");
  }

  const matched = await bcrypt.compare(password, admin.password_hash);
  if (!matched) {
    return fail(res, 401, "البريد أو كلمة المرور غير صحيحة.", "INVALID_CREDENTIALS");
  }

  const token = jwt.sign(
    { id: String(admin.id), email: admin.email, role: admin.role },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return res.json({
    token,
    admin: { id: String(admin.id), email: admin.email, role: admin.role },
  });
};
