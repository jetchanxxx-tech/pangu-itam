import type { Context } from 'hono';

export interface ApiResponse<T> {
  ok: true;
  data: T;
}

export interface ApiPaginatedResponse<T> {
  ok: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function ok<T>(c: Context, data: T, status: number = 200): Response {
  return c.json({ ok: true, data } as ApiResponse<T>, status as never);
}

export function okPaginated<T>(
  c: Context,
  data: T[],
  pagination: { page: number; limit: number; total: number }
): Response {
  return c.json<ApiPaginatedResponse<T>>({
    ok: true,
    data,
    pagination: {
      ...pagination,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    },
  });
}

export function err(
  c: Context,
  code: string,
  message: string,
  status = 400,
  details?: unknown
): Response {
  return c.json<ApiError>(
    { ok: false, error: { code, message, ...(details ? { details } : {}) } },
    status as 200
  );
}

export function notFound(c: Context, resource = 'Resource'): Response {
  return err(c, 'NOT_FOUND', `${resource} not found`, 404);
}

export function unauthorized(c: Context, message = 'Unauthorized'): Response {
  return err(c, 'UNAUTHORIZED', message, 401);
}
