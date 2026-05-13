import type { Context } from 'hono';
import { z } from 'zod';
import { ok, okPaginated, notFound, err } from '../utils/response';
import { getPagination } from '../middleware/pagination';

const createWikiSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string().optional().default(''),
  category: z.string().max(100).optional().default(''),
  tags: z.string().max(500).optional().default(''),
});

const updateWikiSchema = createWikiSchema.partial();

export async function list(c: Context): Promise<Response> {
  const { page, limit, offset, sort, order, search } = getPagination(c);
  const category = c.req.query('category');
  const db = c.env.DB;

  let whereClause = 'WHERE 1=1';
  const params: unknown[] = [];

  if (search) {
    whereClause += ' AND (title LIKE ? OR content LIKE ? OR tags LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s);
  }
  if (category) {
    whereClause += ' AND category = ?';
    params.push(category);
  }

  const countRow = await db.prepare(
    `SELECT COUNT(*) as total FROM wiki_articles ${whereClause}`
  ).bind(...params).first() as { total: number } | null;

  const total = countRow?.total ?? 0;

  const { results } = await db.prepare(
    `SELECT id, title, category, tags, created_at, updated_at FROM wiki_articles ${whereClause} ORDER BY ${sort} ${order} LIMIT ? OFFSET ?`
  ).bind(...params, limit, offset).all();

  return okPaginated(c, (results ?? []) as Record<string, unknown>[], { page, limit, total });
}

export async function get(c: Context): Promise<Response> {
  const id = parseInt(c.req.param('id') ?? '', 10);
  if (isNaN(id)) return err(c, 'VALIDATION_ERROR', 'Invalid ID');

  const article = await c.env.DB.prepare(
    'SELECT * FROM wiki_articles WHERE id = ?'
  ).bind(id).first();
  if (!article) return notFound(c, 'Article');

  return ok(c, article);
}

export async function create(c: Context): Promise<Response> {
  const body = await c.req.json();
  const parsed = createWikiSchema.safeParse(body);
  if (!parsed.success) throw parsed.error;

  const d = parsed.data;
  const result = await c.env.DB.prepare(
    `INSERT INTO wiki_articles (title, content, category, tags) VALUES (?, ?, ?, ?)`
  ).bind(d.title, d.content, d.category, d.tags).run();

  const id = result.meta.last_row_id;
  const article = await c.env.DB.prepare('SELECT * FROM wiki_articles WHERE id = ?').bind(id).first();
  return ok(c, article, 201);
}

export async function update(c: Context): Promise<Response> {
  const id = parseInt(c.req.param('id') ?? '', 10);
  if (isNaN(id)) return err(c, 'VALIDATION_ERROR', 'Invalid ID');

  const body = await c.req.json();
  const parsed = updateWikiSchema.safeParse(body);
  if (!parsed.success) throw parsed.error;

  const d = parsed.data;
  const db = c.env.DB;

  const existing = await db.prepare('SELECT id FROM wiki_articles WHERE id = ?').bind(id).first();
  if (!existing) return notFound(c, 'Article');

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
    await db.prepare(`UPDATE wiki_articles SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run();
  }

  const updated = await db.prepare('SELECT * FROM wiki_articles WHERE id = ?').bind(id).first();
  return ok(c, updated);
}

export async function remove(c: Context): Promise<Response> {
  const id = parseInt(c.req.param('id') ?? '', 10);
  if (isNaN(id)) return err(c, 'VALIDATION_ERROR', 'Invalid ID');

  const existing = await c.env.DB.prepare('SELECT id FROM wiki_articles WHERE id = ?').bind(id).first();
  if (!existing) return notFound(c, 'Article');

  await c.env.DB.prepare('DELETE FROM wiki_articles WHERE id = ?').bind(id).run();
  return ok(c, { message: 'Article deleted' });
}

export async function categories(c: Context): Promise<Response> {
  const { results } = await c.env.DB.prepare(
    'SELECT DISTINCT category FROM wiki_articles WHERE category != "" ORDER BY category'
  ).all();
  const cats = ((results ?? []) as { category: string }[]).map(r => r.category);
  return ok(c, cats);
}
