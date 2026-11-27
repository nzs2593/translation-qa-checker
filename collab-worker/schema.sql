CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  code_hash TEXT NOT NULL UNIQUE,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1))
);

CREATE TABLE IF NOT EXISTS revisions (
  version INTEGER PRIMARY KEY,
  glossary_json TEXT NOT NULL,
  actor_id TEXT,
  changed_at TEXT NOT NULL,
  change_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS login_attempts (
  client_key TEXT PRIMARY KEY,
  window_start INTEGER NOT NULL,
  failures INTEGER NOT NULL
);

INSERT OR IGNORE INTO revisions (version, glossary_json, actor_id, changed_at, change_json)
VALUES (1, '{"schema":"checkform-shared-glossary-v1","version":1,"updatedAt":null,"overrides":{},"rootOverrides":{},"customRows":[]}', NULL, '2026-11-27T00:00:00.000Z', '{}');
