import type { Context } from 'hono';

const ALLOWED_SORT_COLUMNS = new Set([
  'id', 'name', 'created_at', 'updated_at', 'status', 'type', 'owner',
  'version', 'code', 'vendor', 'amount', 'method', 'url',
]);

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
}

export function getPagination(c: Context): PaginationParams {
  const page = Math.max(1, parseInt(c.req.query('page') ?? '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') ?? '20', 10) || 20));
  const sort = c.req.query('sort') ?? 'created_at';
  const order = c.req.query('order') === 'asc' ? 'asc' : 'desc';
  const search = c.req.query('search');

  const safeSort = ALLOWED_SORT_COLUMNS.has(sort) ? sort : 'created_at';

  return {
    page,
    limit,
    offset: (page - 1) * limit,
    sort: safeSort,
    order,
    search: search && search.trim() ? search.trim() : undefined,
  };
}
