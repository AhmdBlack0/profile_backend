import pg from "pg";

const { Pool } = pg;

let pool;

export const getDb = () => {
  if (!pool) {
    throw new Error("Database connection is not initialized.");
  }
  return pool;
};

export const connectDb = async () => {
  if (pool) {
    return; // Reuse existing connection pool for serverless environments
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("Missing DATABASE_URL in environment variables.");
  }

  pool = new Pool({
    connectionString: databaseUrl,
    ssl:
      process.env.PG_SSL === "true"
        ? {
            rejectUnauthorized: false,
          }
        : false,
  });

  await pool.query("SELECT 1");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  const roleCol = await pool.query(`
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'admins' AND column_name = 'role'
    LIMIT 1
  `);
  if (roleCol.rows.length === 0) {
    await pool.query(`
      ALTER TABLE admins ADD COLUMN role TEXT NOT NULL DEFAULT 'user'
    `);
    await pool.query(`
      UPDATE admins SET role = 'admin'
    `);
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS singleton_content (
      resource TEXT PRIMARY KEY,
      data JSONB NOT NULL DEFAULT '{}'::jsonb,
      is_published BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS list_content (
      id SERIAL PRIMARY KEY,
      resource TEXT NOT NULL,
      data JSONB NOT NULL DEFAULT '{}'::jsonb,
      item_order INTEGER NOT NULL DEFAULT 0,
      is_published BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_list_content_resource_order
    ON list_content(resource, item_order, updated_at DESC);
  `);

  // eslint-disable-next-line no-console
  console.log("PostgreSQL connected");
};
