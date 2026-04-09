import app from '../src/app.js';
import { connectDb } from '../src/config/db.js';

export default async function handler(req, res) {
  try {
    await connectDb();
  } catch (error) {
    console.error("Database connection failed", error);
    return res.status(500).json({ error: "Database connection failed" });
  }

  return app(req, res);
}
