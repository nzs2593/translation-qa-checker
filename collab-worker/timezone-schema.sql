CREATE TABLE IF NOT EXISTS timezone_revisions (
  version INTEGER PRIMARY KEY,
  rules_json TEXT NOT NULL,
  actor_id TEXT,
  changed_at TEXT NOT NULL,
  change_json TEXT NOT NULL
);

INSERT OR IGNORE INTO timezone_revisions (version, rules_json, actor_id, changed_at, change_json)
VALUES (1, '{"schema":"checkform-shared-timezones-v1","version":1,"updatedAt":null,"overrides":{}}', NULL, '2026-11-27T00:00:00.000Z', '{}');
