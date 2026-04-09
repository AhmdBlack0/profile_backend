import { getDb } from "../config/db.js";
import { fail } from "../utils/httpError.js";

const singletonResources = new Set(["hero", "about", "contact", "settings"]);
const listResources = new Set(["services", "projects", "experiences"]);

const normalizeListItem = (row) => ({
  _id: String(row.id),
  id: String(row.id),
  ...(row.data || {}),
  order: row.item_order,
  isPublished: row.is_published,
  updatedAt: row.updated_at,
  createdAt: row.created_at,
});

const normalizeSingleton = (row) => {
  if (!row) return null;
  return {
    ...(row.data || {}),
    isPublished: row.is_published,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
  };
};

export const getPublicContent = async (req, res) => {
  const db = getDb();

  const [singletonsRes, servicesRes, projectsRes, experiencesRes] = await Promise.all([
    db.query("SELECT resource, data, is_published, created_at, updated_at FROM singleton_content WHERE is_published = TRUE"),
    db.query(
      "SELECT id, data, item_order, is_published, created_at, updated_at FROM list_content WHERE resource = $1 AND is_published = TRUE ORDER BY item_order ASC, updated_at DESC",
      ["services"]
    ),
    db.query(
      "SELECT id, data, item_order, is_published, created_at, updated_at FROM list_content WHERE resource = $1 AND is_published = TRUE ORDER BY item_order ASC, updated_at DESC",
      ["projects"]
    ),
    db.query(
      "SELECT id, data, item_order, is_published, created_at, updated_at FROM list_content WHERE resource = $1 AND is_published = TRUE ORDER BY item_order ASC, updated_at DESC",
      ["experiences"]
    ),
  ]);

  const singletons = Object.fromEntries(
    singletonsRes.rows.map((row) => [row.resource, normalizeSingleton(row)])
  );

  res.json({
    hero: singletons.hero || null,
    about: singletons.about || null,
    contact: singletons.contact || null,
    settings: singletons.settings || null,
    services: servicesRes.rows.map(normalizeListItem),
    projects: projectsRes.rows.map(normalizeListItem),
    experiences: experiencesRes.rows.map(normalizeListItem),
  });
};

export const getSingleton = async (req, res) => {
  const resource = req.params.resource;
  if (!singletonResources.has(resource)) {
    return fail(res, 404, "المورد غير معروف.", "NOT_FOUND");
  }

  const db = getDb();
  const result = await db.query(
    "SELECT data, is_published, created_at, updated_at FROM singleton_content WHERE resource = $1 LIMIT 1",
    [resource]
  );

  return res.json(normalizeSingleton(result.rows[0]));
};

export const upsertSingleton = async (req, res) => {
  const resource = req.params.resource;
  if (!singletonResources.has(resource)) {
    return fail(res, 404, "المورد غير معروف.", "NOT_FOUND");
  }

  const db = getDb();
  const { isPublished = true, ...data } = req.body || {};
  const result = await db.query(
    `
      INSERT INTO singleton_content (resource, data, is_published, created_at, updated_at)
      VALUES ($1, $2::jsonb, $3, NOW(), NOW())
      ON CONFLICT (resource)
      DO UPDATE SET
        data = EXCLUDED.data,
        is_published = EXCLUDED.is_published,
        updated_at = NOW()
      RETURNING data, is_published, created_at, updated_at;
    `,
    [resource, JSON.stringify(data || {}), Boolean(isPublished)]
  );

  return res.json(normalizeSingleton(result.rows[0]));
};

export const listItems = async (req, res) => {
  const resource = req.params.resource;
  if (!listResources.has(resource)) {
    return fail(res, 404, "المورد غير معروف.", "NOT_FOUND");
  }

  const db = getDb();
  const result = await db.query(
    `
      SELECT id, data, item_order, is_published, created_at, updated_at
      FROM list_content
      WHERE resource = $1
      ORDER BY item_order ASC, updated_at DESC;
    `,
    [resource]
  );
  return res.json(result.rows.map(normalizeListItem));
};

export const createItem = async (req, res) => {
  const resource = req.params.resource;
  if (!listResources.has(resource)) {
    return fail(res, 404, "المورد غير معروف.", "NOT_FOUND");
  }

  const db = getDb();
  const { order = 0, isPublished = true, ...data } = req.body || {};
  const result = await db.query(
    `
      INSERT INTO list_content (resource, data, item_order, is_published, created_at, updated_at)
      VALUES ($1, $2::jsonb, $3, $4, NOW(), NOW())
      RETURNING id, data, item_order, is_published, created_at, updated_at;
    `,
    [resource, JSON.stringify(data || {}), Number(order) || 0, Boolean(isPublished)]
  );
  return res.status(201).json(normalizeListItem(result.rows[0]));
};

export const updateItem = async (req, res) => {
  const resource = req.params.resource;
  if (!listResources.has(resource)) {
    return fail(res, 404, "المورد غير معروف.", "NOT_FOUND");
  }

  const db = getDb();
  const { order = 0, isPublished = true, ...data } = req.body || {};
  const result = await db.query(
    `
      UPDATE list_content
      SET data = $1::jsonb, item_order = $2, is_published = $3, updated_at = NOW()
      WHERE id = $4 AND resource = $5
      RETURNING id, data, item_order, is_published, created_at, updated_at;
    `,
    [JSON.stringify(data || {}), Number(order) || 0, Boolean(isPublished), Number(req.params.id), resource]
  );

  if (!result.rows[0]) {
    return fail(res, 404, "العنصر غير موجود.", "NOT_FOUND");
  }

  return res.json(normalizeListItem(result.rows[0]));
};

export const deleteItem = async (req, res) => {
  const resource = req.params.resource;
  if (!listResources.has(resource)) {
    return fail(res, 404, "المورد غير معروف.", "NOT_FOUND");
  }

  const db = getDb();
  const result = await db.query("DELETE FROM list_content WHERE id = $1 AND resource = $2 RETURNING id", [
    Number(req.params.id),
    resource,
  ]);

  if (!result.rows[0]) {
    return fail(res, 404, "العنصر غير موجود.", "NOT_FOUND");
  }

  return res.json({ ok: true });
};
