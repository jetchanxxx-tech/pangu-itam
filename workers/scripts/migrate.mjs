// Execute D1 schema migration via REST API
// Usage:
//   export CLOUDFLARE_API_TOKEN=xxx
//   export CLOUDFLARE_ACCOUNT_ID=xxx
//   export D1_DATABASE_ID=xxx
//   node scripts/migrate.mjs

const CF_TOKEN = process.env.CLOUDFLARE_API_TOKEN || '';
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '';
const DB_ID = process.env.D1_DATABASE_ID || '';

if (!CF_TOKEN || !ACCOUNT_ID || !DB_ID) {
  console.error('Missing required environment variables. Set CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, D1_DATABASE_ID');
  process.exit(1);
}

const BASE = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DB_ID}`;

const statements = [
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT '',
    platform TEXT NOT NULL DEFAULT '',
    ip TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Online',
    region TEXT NOT NULL DEFAULT '',
    owner TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    specs TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type)`,
  `CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status)`,
  `CREATE INDEX IF NOT EXISTS idx_assets_owner ON assets(owner)`,
  `CREATE TABLE IF NOT EXISTS contracts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT NOT NULL DEFAULT '',
    type TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'draft',
    vendor TEXT NOT NULL DEFAULT '',
    amount REAL NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'CNY',
    start_date TEXT NOT NULL DEFAULT '',
    end_date TEXT NOT NULL DEFAULT '',
    sign_date TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    owner TEXT NOT NULL DEFAULT '',
    contact_info TEXT NOT NULL DEFAULT '',
    asset_id INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE SET NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_contracts_code ON contracts(code)`,
  `CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status)`,
  `CREATE INDEX IF NOT EXISTS idx_contracts_owner ON contracts(owner)`,
  `CREATE TABLE IF NOT EXISTS contract_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contract_id INTEGER NOT NULL,
    file_name TEXT NOT NULL,
    file_data BLOB,
    file_size INTEGER NOT NULL DEFAULT 0,
    file_type TEXT NOT NULL DEFAULT '',
    version INTEGER NOT NULL DEFAULT 1,
    uploaded_by TEXT NOT NULL DEFAULT '',
    remark TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS idx_contract_files_contract ON contract_files(contract_id)`,
  `CREATE TABLE IF NOT EXISTS system_interfaces (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    method TEXT NOT NULL DEFAULT 'GET',
    url TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Active',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  // Seed data
  `INSERT OR IGNORE INTO users (id, username, password, role) VALUES (1, 'admin', 'c0fsQgDmrSr4CwmesEj4zg:GNTnvfvx8ixTwq9vTfWzO8kHlhWOAR5de5-UuQw3xB8', 'admin')`,
  `INSERT OR IGNORE INTO users (id, username, password, role) VALUES (2, 'user', 'VgM0V04U4wpwOXrBhI405A:nGjZyPeJyuvyaqM0kUBXS2fWXKrkbWbdshR6fkBGw8M', 'user')`,
];

async function exec(sql) {
  const res = await fetch(`${BASE}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CF_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql }),
  });
  const data = await res.json();
  return data;
}

async function main() {
  console.log(`开始迁移数据库 ${DB_ID}...`);
  for (let i = 0; i < statements.length; i++) {
    const sql = statements[i];
    const preview = sql.substring(0, 60).replace(/\n/g, ' ');
    process.stdout.write(`[${i + 1}/${statements.length}] ${preview}... `);
    try {
      const result = await exec(sql);
      if (result.success) {
        console.log('OK');
      } else {
        console.log('FAIL:', result.errors?.map(e => e.message).join(', '));
      }
    } catch (err) {
      console.log('ERROR:', err.message);
    }
  }
  console.log('\n迁移完成!');
}

main().catch(console.error);
