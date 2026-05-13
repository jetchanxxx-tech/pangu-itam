import type { Context } from 'hono';
import { ZodError } from 'zod';

export async function errorHandler(err: Error, c: Context): Promise<Response> {
  console.error(`[ERROR] ${err.name}: ${err.message}`);

  if (err instanceof ZodError) {
    return c.json({
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
    }, 400);
  }

  return c.json({
    ok: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  }, 500);
}
