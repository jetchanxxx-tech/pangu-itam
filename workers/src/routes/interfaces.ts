import type { Context } from 'hono';
import { createInterfaceSchema, updateInterfaceSchema } from '../utils/validators';
import { ok, okPaginated, notFound, err } from '../utils/response';
import { getPagination } from '../middleware/pagination';

export async function list(c: Context): Promise<Response> {
  const { page, limit, offset, sort, order, search } = getPagination(c);
  const db = c.env.DB;

  let whereClause = '';
  const params: unknown[] = [];

  if (search) {
    whereClause = 'WHERE (name LIKE ? OR url LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s);
  }

  const countRow = await db.prepare(
    `SELECT COUNT(*) as total FROM system_interfaces ${whereClause}`
  ).bind(...params).first() as { total: number } | null;

  const total = countRow?.total ?? 0;

  const { results } = await db.prepare(
    `SELECT * FROM system_interfaces ${whereClause} ORDER BY ${sort} ${order} LIMIT ? OFFSET ?`
  ).bind(...params, limit, offset).all();

  return okPaginated(c, (results ?? []) as Record<string, unknown>[], { page, limit, total });
}

export async function get(c: Context): Promise<Response> {
  const id = parseInt(c.req.param('id') ?? '', 10);
  if (isNaN(id)) return err(c, 'VALIDATION_ERROR', 'Invalid ID');

  const db = c.env.DB;
  const item = await db.prepare('SELECT * FROM system_interfaces WHERE id = ?').bind(id).first();
  if (!item) return notFound(c, 'Interface');

  return ok(c, item);
}

export async function create(c: Context): Promise<Response> {
  const body = await c.req.json();
  const parsed = createInterfaceSchema.safeParse(body);
  if (!parsed.success) throw parsed.error;

  const d = parsed.data;
  const db = c.env.DB;

  const result = await db.prepare(
    `INSERT INTO system_interfaces (name, method, url, description, status)
     VALUES (?, ?, ?, ?, ?)`
  ).bind(d.name, d.method, d.url, d.description, d.status).run();

  const id = result.meta.last_row_id;
  const item = await db.prepare('SELECT * FROM system_interfaces WHERE id = ?').bind(id).first();

  return ok(c, item, 201);
}

export async function update(c: Context): Promise<Response> {
  const id = parseInt(c.req.param('id') ?? '', 10);
  if (isNaN(id)) return err(c, 'VALIDATION_ERROR', 'Invalid ID');

  const body = await c.req.json();
  const parsed = updateInterfaceSchema.safeParse(body);
  if (!parsed.success) throw parsed.error;

  const d = parsed.data;
  const db = c.env.DB;

  const existing = await db.prepare('SELECT id FROM system_interfaces WHERE id = ?').bind(id).first();
  if (!existing) return notFound(c, 'Interface');

  const updates: string[] = [];
  const params: unknown[] = [];

  for (const [key, value] of Object.entries(d)) {
    if (value !== undefined) {
      updates.push(`${key} = ?`);
      params.push(value);
    }
  }

  if (updates.length > 0) {
    updates.push("updated_at = datetime('now')");
    params.push(id);
    await db.prepare(`UPDATE system_interfaces SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run();
  }

  const updated = await db.prepare('SELECT * FROM system_interfaces WHERE id = ?').bind(id).first();
  return ok(c, updated);
}

export async function remove(c: Context): Promise<Response> {
  const id = parseInt(c.req.param('id') ?? '', 10);
  if (isNaN(id)) return err(c, 'VALIDATION_ERROR', 'Invalid ID');

  const db = c.env.DB;

  const existing = await db.prepare('SELECT id FROM system_interfaces WHERE id = ?').bind(id).first();
  if (!existing) return notFound(c, 'Interface');

  await db.prepare('DELETE FROM system_interfaces WHERE id = ?').bind(id).run();

  return ok(c, { message: 'Interface deleted' });
}
