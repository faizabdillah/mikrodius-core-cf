-- Initial schema migration
CREATE TABLE IF NOT EXISTS packages (
  name TEXT PRIMARY KEY,
  max_nas INTEGER NOT NULL,
  max_subscribers INTEGER NOT NULL,
  max_devices INTEGER NOT NULL,
  rate_limit INTEGER NOT NULL,
  price_cents INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at INTEGER
);

CREATE TABLE IF NOT EXISTS nodes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT,
  acs_url TEXT NOT NULL,
  radius_url TEXT NOT NULL,
  admin_secret TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  node_id TEXT REFERENCES nodes(id),
  package TEXT DEFAULT 'starter' REFERENCES packages(name),
  status TEXT DEFAULT 'active',
  created_at INTEGER
);

CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  name TEXT NOT NULL,
  download_rate INTEGER,
  upload_rate INTEGER,
  quota_bytes INTEGER,
  price INTEGER,
  validity_days INTEGER
);

CREATE TABLE IF NOT EXISTS subscribers (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  plan_id TEXT REFERENCES plans(id),
  username TEXT NOT NULL,
  name TEXT,
  email TEXT,
  whatsapp TEXT,
  address TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active',
  expire_at INTEGER,
  created_at INTEGER
);

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  subscriber_id TEXT REFERENCES subscribers(id),
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  due_date INTEGER,
  paid_at INTEGER,
  created_at INTEGER
);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  name TEXT NOT NULL,
  color TEXT
);

CREATE TABLE IF NOT EXISTS subscriber_tags (
  subscriber_id TEXT NOT NULL REFERENCES subscribers(id),
  tag_id TEXT NOT NULL REFERENCES tags(id),
  PRIMARY KEY (subscriber_id, tag_id)
);
