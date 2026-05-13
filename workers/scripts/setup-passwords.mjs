// Script to generate PBKDF2 password hashes for seed data
// Run: node scripts/setup-passwords.mjs
//
// This uses Node.js Web Crypto API (same as Workers),
// so hashes are compatible.

import { webcrypto } from 'node:crypto';

const crypto = webcrypto;

function base64url(bytes) {
  let str = '';
  for (let i = 0; i < bytes.length; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return btoa(str).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function hashPassword(password) {
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
  const hashB64 = base64url(new Uint8Array(hash));
  return `${saltB64}:${hashB64}`;
}

async function main() {
  const adminHash = await hashPassword('admin123');
  const userHash = await hashPassword('user123');

  console.log('-- Copy this into workers/src/db/seed.sql --\n');
  console.log(`-- admin / admin123`);
  console.log(`INSERT OR IGNORE INTO users (id, username, password, role) VALUES (1, 'admin', '${adminHash}', 'admin');`);
  console.log(`-- user / user123`);
  console.log(`INSERT OR IGNORE INTO users (id, username, password, role) VALUES (2, 'user', '${userHash}', 'user');`);
}

main().catch(console.error);
