import type { Context } from 'hono';
import { signToken, verifyPassword, hashPassword } from '../services/jwt';
import { loginSchema, changePasswordSchema } from '../utils/validators';
import { ok, err, unauthorized } from '../utils/response';

export async function login(c: Context): Promise<Response> {
  const body = await c.req.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) throw parsed.error;

  const { username, password } = parsed.data;

  const user = await c.env.DB.prepare(
    'SELECT id, username, password, role FROM users WHERE username = ?'
  ).bind(username).first() as {
    id: number; username: string; password: string; role: string;
  } | null;

  if (!user) {
    return unauthorized(c, 'Invalid username or password');
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    return unauthorized(c, 'Invalid username or password');
  }

  const token = await signToken(
    { user_id: user.id, username: user.username, role: user.role },
    c.env.JWT_SECRET
  );

  return ok(c, {
    token,
    username: user.username,
    role: user.role,
  });
}

export async function logout(_c: Context): Promise<Response> {
  return ok(_c, { message: 'Logged out successfully' });
}

export async function me(c: Context): Promise<Response> {
  const user = c.get('user');
  return ok(c, {
    user_id: user.user_id,
    username: user.username,
    role: user.role,
  });
}

export async function changePassword(c: Context): Promise<Response> {
  const user = c.get('user');
  const body = await c.req.json();
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) throw parsed.error;

  const { oldPassword, newPassword } = parsed.data;

  const dbUser = await c.env.DB.prepare(
    'SELECT password FROM users WHERE id = ?'
  ).bind(user.user_id).first() as { password: string } | null;

  if (!dbUser) {
    return err(c, 'NOT_FOUND', 'User not found', 404);
  }

  const valid = await verifyPassword(oldPassword, dbUser.password);
  if (!valid) {
    return err(c, 'INVALID_PASSWORD', 'Current password is incorrect', 400);
  }

  const hashed = await hashPassword(newPassword);
  await c.env.DB.prepare(
    "UPDATE users SET password = ?, updated_at = datetime('now') WHERE id = ?"
  ).bind(hashed, user.user_id).run();

  return ok(c, { message: 'Password changed successfully' });
}
