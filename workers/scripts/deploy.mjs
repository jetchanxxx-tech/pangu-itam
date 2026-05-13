// Build and deploy Worker to Cloudflare via REST API
import * as esbuild from 'esbuild';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const CF_TOKEN = process.env.CLOUDFLARE_API_TOKEN || '';
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '';
const SCRIPT_NAME = process.env.WORKER_NAME || 'itam-api';
const DB_ID = process.env.D1_DATABASE_ID || '';
const JWT_SECRET = process.env.JWT_SECRET || '';

if (!CF_TOKEN || !ACCOUNT_ID || !DB_ID) {
  console.error('Missing required environment variables. Set:');
  console.error('  CLOUDFLARE_API_TOKEN');
  console.error('  CLOUDFLARE_ACCOUNT_ID');
  console.error('  D1_DATABASE_ID');
  console.error('  JWT_SECRET (optional, can be set via wrangler secret)');
  process.exit(1);
}

async function build() {
  if (!existsSync(resolve(ROOT, 'dist'))) mkdirSync(resolve(ROOT, 'dist'));

  console.log('[1/3] Building Worker with esbuild...');
  await esbuild.build({
    entryPoints: [resolve(ROOT, 'src/index.ts')],
    bundle: true,
    minify: false,
    format: 'esm',
    target: 'es2022',
    outfile: resolve(ROOT, 'dist/worker.mjs'),
    define: { 'process.env.NODE_ENV': '"production"' },
  });
  console.log('[OK] Build complete');
  return readFileSync(resolve(ROOT, 'dist/worker.mjs'), 'utf-8');
}

async function uploadWorker(scriptContent) {
  console.log('[2/3] Uploading Worker with D1 binding...');

  const metadata = {
    main_module: 'worker.mjs',
    bindings: [
      { type: 'd1', name: 'DB', database_id: DB_ID },
      { type: 'plain_text', name: 'NOTIFICATION_ENABLE', text: 'false' },
      { type: 'plain_text', name: 'FEISHU_WEBHOOK', text: '' },
      { type: 'plain_text', name: 'FEISHU_SECRET', text: '' },
    ],
    compatibility_date: '2025-04-01',
    compatibility_flags: ['nodejs_compat'],
    workers_dev: true,
  };

  const boundary = '----CFWorkerUpload' + Date.now();
  const body = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="metadata"',
    'Content-Type: application/json',
    '',
    JSON.stringify(metadata),
    `--${boundary}`,
    'Content-Disposition: form-data; name="worker.mjs"; filename="worker.mjs"',
    'Content-Type: application/javascript+module',
    '',
    scriptContent,
    `--${boundary}--`,
    '',
  ].join('\r\n');

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/workers/scripts/${SCRIPT_NAME}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${CF_TOKEN}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body,
    }
  );
  const data = await res.json();
  if (!data.success) throw new Error('Upload failed: ' + JSON.stringify(data.errors));
  console.log('[OK] Worker uploaded with D1 binding');
}

async function setSecret() {
  console.log('[3/3] Setting JWT_SECRET...');
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/workers/scripts/${SCRIPT_NAME}/secrets`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${CF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'JWT_SECRET',
        text: JWT_SECRET,
        type: 'secret_text',
      }),
    }
  );
  const data = await res.json();
  if (!data.success) {
    console.log('[WARN] Secret:', data.errors?.[0]?.message || JSON.stringify(data.errors));
  } else {
    console.log('[OK] JWT_SECRET set');
  }
}

async function main() {
  try {
    const script = await build();
    await uploadWorker(script);
    await setSecret();

    const url = `https://${SCRIPT_NAME}.${ACCOUNT_ID}.workers.dev`;
    console.log(`\n=== 部署完成! ===`);
    console.log(`Worker URL: ${url}`);
    console.log(``);
    console.log(`测试命令:`);
    console.log(`  curl ${url}/health`);
    console.log(`  curl -X POST ${url}/api/v1/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}'`);
  } catch (err) {
    console.error('部署失败:', err.message);
    process.exit(1);
  }
}

main();
