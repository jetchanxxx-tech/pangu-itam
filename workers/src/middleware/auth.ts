import type { Context, Next } from 'hono';
import { verifyToken } from '../services/jwt';
import { unauthorized } from '../utils/response';
import type { JwtClaims } from '../services/jwt';

declare module 'hono' {
  interface ContextVariableMap {
    user: JwtClaims;
  }
}

export async function authMiddleware(c: Context, next: Next): Promise<Response | void> {
  const authHeader = c.req.header('Authorization');
  const token = extractBearerToken(authHeader);

  if (!token) {
    return unauthorized(c, 'Missing or invalid Authorization header');
  }

  const claims = await verifyToken(token, c.env.JWT_SECRET);
  if (!claims) {
    return unauthorized(c, 'Invalid or expired token');
  }

  c.set('user', claims);
  await next();
}

export async function adminMiddleware(c: Context, next: Next): Promise<Response | void> {
  const user = c.get('user');
  if (!user || user.role !== 'admin') {
    return unauthorized(c, 'Admin access required');
  }
  await next();
}

function extractBearerToken(header: string | undefined): string | null {
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}
