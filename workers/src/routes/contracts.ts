import type { Context } from 'hono';
import { createContractSchema, updateContractSchema } from '../utils/validators';
import { ok, okPaginated, notFound, err } from '../utils/response';
import { getPagination } from '../middleware/pagination';

export async function list(c: Context): Promise<Response> {
  const { page, limit, offset, sort, order, search } = getPagination(c);
  const db = c.env.DB;

  let whereClause = '';
  const params: unknown[] = [];

  if (search) {
    whereClause = 'WHERE (name LIKE ? OR code LIKE ? OR vendor LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  const countRow = await db.prepare(
    `SELECT COUNT(*) as total FROM contracts ${whereClause}`
  ).bind(...params).first() as { total: number } | null;

  const total = countRow?.total ?? 0;

  const { results } = await db.prepare(
    `SELECT * FROM contracts ${whereClause} ORDER BY ${sort} ${order} LIMIT ? OFFSET ?`
  ).bind(...params, limit, offset).all();

  return okPaginated(c, (results ?? []) as Record<string, unknown>[], { page, limit, total });
}

export async function get(c: Context): Promise<Response> {
  const id = parseInt(c.req.param('id') ?? '', 10);
  if (isNaN(id)) return err(c, 'VALIDATION_ERROR', 'Invalid ID');

  const db = c.env.DB;
  const contract = await db.prepare('SELECT * FROM contracts WHERE id = ?').bind(id).first();
  if (!contract) return notFound(c, 'Contract');

  return ok(c, contract);
}

export async function create(c: Context): Promise<Response> {
  const body = await c.req.json();
  const parsed = createContractSchema.safeParse(body);
  if (!parsed.success) throw parsed.error;

  const d = parsed.data;
  const db = c.env.DB;

  if (d.asset_id != null) {
    const asset = await db.prepare('SELECT id FROM assets WHERE id = ?').bind(d.asset_id).first();
    if (!asset) return notFound(c, 'Asset');
  }

  const result = await db.prepare(
    `INSERT INTO contracts (name, code, type, status, vendor, amount, currency,
      start_date, end_date, sign_date, description, owner, contact_info, asset_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    d.name, d.code, d.type, d.status, d.vendor, d.amount, d.currency,
    d.start_date, d.end_date, d.sign_date, d.description,
    d.owner, d.contact_info, d.asset_id ?? null
  ).run();

  const id = result.meta.last_row_id;
  const contract = await db.prepare('SELECT * FROM contracts WHERE id = ?').bind(id).first();

  return ok(c, contract, 201);
}

export async function update(c: Context): Promise<Response> {
  const id = parseInt(c.req.param('id') ?? '', 10);
  if (isNaN(id)) return err(c, 'VALIDATION_ERROR', 'Invalid ID');

  const body = await c.req.json();
  const parsed = updateContractSchema.safeParse(body);
  if (!parsed.success) throw parsed.error;

  const d = parsed.data;
  const db = c.env.DB;

  const existing = await db.prepare('SELECT id FROM contracts WHERE id = ?').bind(id).first();
  if (!existing) return notFound(c, 'Contract');

  if (d.asset_id != null) {
    const asset = await db.prepare('SELECT id FROM assets WHERE id = ?').bind(d.asset_id).first();
    if (!asset) return notFound(c, 'Asset');
  }

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
    await db.prepare(`UPDATE contracts SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run();
  }

  const updated = await db.prepare('SELECT * FROM contracts WHERE id = ?').bind(id).first();
  return ok(c, updated);
}

export async function remove(c: Context): Promise<Response> {
  const id = parseInt(c.req.param('id') ?? '', 10);
  if (isNaN(id)) return err(c, 'VALIDATION_ERROR', 'Invalid ID');

  const db = c.env.DB;

  const existing = await db.prepare('SELECT id FROM contracts WHERE id = ?').bind(id).first();
  if (!existing) return notFound(c, 'Contract');

  await db.prepare('DELETE FROM contracts WHERE id = ?').bind(id).run();

  return ok(c, { message: 'Contract deleted' });
}
