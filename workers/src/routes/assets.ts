import type { Context } from 'hono';
import { createAssetSchema, updateAssetSchema } from '../utils/validators';
import { ok, okPaginated, notFound, err } from '../utils/response';
import { getPagination } from '../middleware/pagination';
import { createNotificationService } from '../services/notification';

export async function list(c: Context): Promise<Response> {
  const { page, limit, offset, sort, order, search } = getPagination(c);
  const db = c.env.DB;

  let whereClause = '';
  const params: unknown[] = [];

  if (search) {
    whereClause = 'WHERE (name LIKE ? OR ip LIKE ? OR owner LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  const countRow = await db.prepare(
    `SELECT COUNT(*) as total FROM assets ${whereClause}`
  ).bind(...params).first() as { total: number } | null;

  const total = countRow?.total ?? 0;

  const { results } = await db.prepare(
    `SELECT * FROM assets ${whereClause} ORDER BY ${sort} ${order} LIMIT ? OFFSET ?`
  ).bind(...params, limit, offset).all();

  return okPaginated(c, (results ?? []) as Record<string, unknown>[], { page, limit, total });
}

export async function create(c: Context): Promise<Response> {
  const body = await c.req.json();
  const parsed = createAssetSchema.safeParse(body);
  if (!parsed.success) throw parsed.error;

  const d = parsed.data;
  const db = c.env.DB;

  const result = await db.prepare(
    `INSERT INTO assets (name, type, platform, ip, status, region, owner, description, specs)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(d.name, d.type, d.platform, d.ip, d.status, d.region, d.owner, d.description, d.specs).run();

  const id = result.meta.last_row_id;

  const notifier = createNotificationService(c.env);
  c.executionCtx.waitUntil(
    notifier.sendAlert('Asset Created', `Asset "${d.name}" (ID: ${id}) has been created.`)
  );

  return ok(c, { id, ...d }, 201);
}

export async function update(c: Context): Promise<Response> {
  const id = parseInt(c.req.param('id') ?? '', 10);
  if (isNaN(id)) return err(c, 'VALIDATION_ERROR', 'Invalid ID');

  const body = await c.req.json();
  const parsed = updateAssetSchema.safeParse(body);
  if (!parsed.success) throw parsed.error;

  const d = parsed.data;
  const db = c.env.DB;

  const existing = await db.prepare('SELECT id FROM assets WHERE id = ?').bind(id).first();
  if (!existing) return notFound(c, 'Asset');

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
    await db.prepare(`UPDATE assets SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run();
  }

  const updated = await db.prepare('SELECT * FROM assets WHERE id = ?').bind(id).first();
  return ok(c, updated);
}

export async function remove(c: Context): Promise<Response> {
  const id = parseInt(c.req.param('id') ?? '', 10);
  if (isNaN(id)) return err(c, 'VALIDATION_ERROR', 'Invalid ID');

  const db = c.env.DB;

  const existing = await db.prepare('SELECT id, name FROM assets WHERE id = ?')
    .bind(id).first() as { id: number; name: string } | null;
  if (!existing) return notFound(c, 'Asset');

  await db.prepare('DELETE FROM assets WHERE id = ?').bind(id).run();

  const notifier = createNotificationService(c.env);
  c.executionCtx.waitUntil(
    notifier.sendAlert('Asset Deleted', `Asset "${existing.name}" (ID: ${id}) has been deleted.`)
  );

  return ok(c, { message: 'Asset deleted' });
}
