// JWT service using Web Crypto API (HMAC-SHA256)
// Workers-compatible — no external dependencies

function base64url(bytes: Uint8Array): string {
  let str = '';
  for (let i = 0; i < bytes.length; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return btoa(str).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64urlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  const decoded = atob(str);
  const bytes = new Uint8Array(decoded.length);
  for (let i = 0; i < decoded.length; i++) {
    bytes[i] = decoded.charCodeAt(i);
  }
  return bytes;
}

let cachedKey: CryptoKey | null = null;
let cachedSecret: string = '';

async function getKey(secret: string): Promise<CryptoKey> {
  if (cachedKey && cachedSecret === secret) return cachedKey;
  const enc = new TextEncoder().encode(secret);
  cachedKey = await crypto.subtle.importKey(
    'raw', enc,
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign', 'verify']
  );
  cachedSecret = secret;
  return cachedKey;
}

export interface JwtClaims {
  user_id: number;
  username: string;
  role: string;
  iat: number;
  exp: number;
}

export async function signToken(
  payload: Omit<JwtClaims, 'iat' | 'exp'>,
  secret: string
): Promise<string> {
  const enc = new TextEncoder();
  const now = Math.floor(Date.now() / 1000);
  const claims: JwtClaims = {
    ...payload,
    iat: now,
    exp: now + 86400,
  };

  const headerB64 = base64url(enc.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const payloadB64 = base64url(enc.encode(JSON.stringify(claims)));
  const signingInput = `${headerB64}.${payloadB64}`;

  const key = await getKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(signingInput));
  const sigB64 = base64url(new Uint8Array(sig));

  return `${signingInput}.${sigB64}`;
}

export async function verifyToken(
  token: string,
  secret: string
): Promise<JwtClaims | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, sigB64] = parts;

  try {
    const key = await getKey(secret);
    const signature = base64urlDecode(sigB64) as unknown as BufferSource;
    const signingInput = `${headerB64}.${payloadB64}`;
    const enc = new TextEncoder();

    const valid = await crypto.subtle.verify(
      'HMAC', key, signature,
      enc.encode(signingInput) as BufferSource
    );
    if (!valid) return null;

    const payload = JSON.parse(
      new TextDecoder().decode(base64urlDecode(payloadB64))
    ) as JwtClaims;

    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

// PBKDF2 password hashing — bcrypt is not Workers-compatible
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password),
    'PBKDF2', false, ['deriveBits']
  );
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    key, 256
  );
  const saltB64 = base64url(salt);
  const hashB64 = base64url(new Uint8Array(hash as ArrayBuffer));
  return `${saltB64}:${hashB64}`;
}

export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const [saltB64, hashB64] = stored.split(':');
  if (!saltB64 || !hashB64) return false;

  const salt = base64urlDecode(saltB64) as unknown as BufferSource;
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password),
    'PBKDF2', false, ['deriveBits']
  );
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    key, 256
  );
  const resultB64 = base64url(new Uint8Array(hash as ArrayBuffer));
  return resultB64 === hashB64;
}
