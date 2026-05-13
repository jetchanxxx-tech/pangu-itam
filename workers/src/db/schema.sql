-- Migration 0001: Initial schema for ITAM on D1

CREATE TABLE IF NOT EXISTS users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  username    TEXT    NOT NULL UNIQUE,
  password    TEXT    NOT NULL,
  role        TEXT    NOT NULL DEFAULT 'user',
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS assets (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  type        TEXT    NOT NULL DEFAULT '',
  platform    TEXT    NOT NULL DEFAULT '',
  ip          TEXT    NOT NULL DEFAULT '',
  status      TEXT    NOT NULL DEFAULT 'Online',
  region      TEXT    NOT NULL DEFAULT '',
  owner       TEXT    NOT NULL DEFAULT '',
  description TEXT    NOT NULL DEFAULT '',
  specs       TEXT    NOT NULL DEFAULT '',
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_assets_type   ON assets(type);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_owner  ON assets(owner);

CREATE TABLE IF NOT EXISTS contracts (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT    NOT NULL,
  code         TEXT    NOT NULL DEFAULT '',
  type         TEXT    NOT NULL DEFAULT '',
  status       TEXT    NOT NULL DEFAULT 'draft',
  vendor       TEXT    NOT NULL DEFAULT '',
  amount       REAL    NOT NULL DEFAULT 0,
  currency     TEXT    NOT NULL DEFAULT 'CNY',
  start_date   TEXT    NOT NULL DEFAULT '',
  end_date     TEXT    NOT NULL DEFAULT '',
  sign_date    TEXT    NOT NULL DEFAULT '',
  description  TEXT    NOT NULL DEFAULT '',
  owner        TEXT    NOT NULL DEFAULT '',
  contact_info TEXT    NOT NULL DEFAULT '',
  asset_id     INTEGER,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_contracts_code   ON contracts(code);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_owner  ON contracts(owner);

CREATE TABLE IF NOT EXISTS contract_files (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  contract_id  INTEGER NOT NULL,
  file_name    TEXT    NOT NULL,
  file_data    BLOB,
  file_size    INTEGER NOT NULL DEFAULT 0,
  file_type    TEXT    NOT NULL DEFAULT '',
  version      INTEGER NOT NULL DEFAULT 1,
  uploaded_by  TEXT    NOT NULL DEFAULT '',
  remark       TEXT    NOT NULL DEFAULT '',
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_contract_files_contract ON contract_files(contract_id);

CREATE TABLE IF NOT EXISTS system_interfaces (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  method      TEXT    NOT NULL DEFAULT 'GET',
  url         TEXT    NOT NULL DEFAULT '',
  description TEXT    NOT NULL DEFAULT '',
  status      TEXT    NOT NULL DEFAULT 'Active',
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);
