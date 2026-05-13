// Execute D1 migration v2 (wiki_articles + archive support)
const CF_TOKEN = process.env.CLOUDFLARE_API_TOKEN || '';
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '';
const DB_ID = process.env.D1_DATABASE_ID || '';

if (!CF_TOKEN || !ACCOUNT_ID || !DB_ID) {
  console.error('Set: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, D1_DATABASE_ID');
  process.exit(1);
}

const BASE = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DB_ID}`;
const HEADERS = { 'Authorization': `Bearer ${CF_TOKEN}`, 'Content-Type': 'application/json' };

const statements = [
  `CREATE TABLE IF NOT EXISTS wiki_articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT '',
    tags TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_wiki_category ON wiki_articles(category)`,
  // Try adding archived column (safe to fail if already exists)
  `ALTER TABLE assets ADD COLUMN archived INTEGER NOT NULL DEFAULT 0`,
];

async function exec(sql) {
  const res = await fetch(`${BASE}/query`, { method: 'POST', headers: HEADERS, body: JSON.stringify({ sql }) });
  return res.json();
}

async function main() {
  console.log(`Migrating DB ${DB_ID}...`);
  for (let i = 0; i < statements.length; i++) {
    const preview = statements[i].substring(0, 60).replace(/\n/g, ' ');
    process.stdout.write(`[${i + 1}/${statements.length}] ${preview}... `);
    try {
      const result = await exec(statements[i]);
      if (result.success) console.log('OK');
      else console.log('SKIP/FAIL:', result.errors?.map(e => e.message).join(', '));
    } catch (err) {
      console.log('ERROR:', err.message);
    }
  }
  console.log('\nDone!');
}

main();
