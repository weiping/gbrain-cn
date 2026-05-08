import { PGlite } from '@electric-sql/pglite';
import { join } from 'path';
import { homedir } from 'os';

const db = new PGlite(join(homedir(), '.gbrain', 'brain.pglite'));
await db.waitReady;

console.log('=== Running remaining schema migrations (v34, v35, v36) ===\n');

// V34: destructive_guard_columns
console.log('[v34] Adding pages/sources soft-delete columns...');
try {
  await db.query(`ALTER TABLE pages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ`);
  console.log('  ✅ pages.deleted_at');
} catch(e) { console.log('  ❌ pages.deleted_at:', e.message); }

try {
  await db.query(`ALTER TABLE sources ADD COLUMN IF NOT EXISTS archived BOOLEAN NOT NULL DEFAULT false`);
  console.log('  ✅ sources.archived');
} catch(e) { console.log('  ❌ sources.archived:', e.message); }

try {
  await db.query(`ALTER TABLE sources ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ`);
  console.log('  ✅ sources.archived_at');
} catch(e) { console.log('  ❌ sources.archived_at:', e.message); }

try {
  await db.query(`ALTER TABLE sources ADD COLUMN IF NOT EXISTS archive_expires_at TIMESTAMPTZ`);
  console.log('  ✅ sources.archive_expires_at');
} catch(e) { console.log('  ❌ sources.archive_expires_at:', e.message); }

// Backfill sources.archived from JSONB
try {
  await db.query(`
    UPDATE sources
    SET archived = true,
        archived_at = COALESCE((config->>'archived_at')::timestamptz, now()),
        archive_expires_at = COALESCE(
          (config->>'archive_expires_at')::timestamptz,
          COALESCE((config->>'archived_at')::timestamptz, now()) + INTERVAL '72 hours'
        )
    WHERE config ? 'archived'
      AND (config->>'archived')::boolean = true
      AND archived = false
  `);
  console.log('  ✅ sources.archived backfill from JSONB');
} catch(e) { console.log('  ❌ sources.archived backfill:', e.message); }

// V34 partial indexes (PGLite uses non-CONCURRENTLY variant)
try {
  await db.query(`CREATE INDEX IF NOT EXISTS idx_pages_deleted_at ON pages(deleted_at) WHERE deleted_at IS NOT NULL`);
  console.log('  ✅ idx_pages_deleted_at');
} catch(e) { console.log('  ❌ idx_pages_deleted_at:', e.message); }

try {
  await db.query(`CREATE INDEX IF NOT EXISTS idx_sources_archived ON sources(archived) WHERE archived = true`);
  console.log('  ✅ idx_sources_archived');
} catch(e) { console.log('  ❌ idx_sources_archived:', e.message); }

// V35: auto_rls_event_trigger - PGLite skips this (no event trigger support)
console.log('\n[v35] Skipping (PGLite — no event trigger support)');

// V36: subagent schema columns
console.log('\n[v36] Adding subagent schema_version/provider_id columns...');
try {
  await db.query(`ALTER TABLE subagent_messages ADD COLUMN IF NOT EXISTS schema_version INTEGER NOT NULL DEFAULT 1`);
  console.log('  ✅ subagent_messages.schema_version');
} catch(e) { console.log('  ❌ subagent_messages.schema_version:', e.message); }

try {
  await db.query(`ALTER TABLE subagent_messages ADD COLUMN IF NOT EXISTS provider_id TEXT`);
  console.log('  ✅ subagent_messages.provider_id');
} catch(e) { console.log('  ❌ subagent_messages.provider_id:', e.message); }

try {
  await db.query(`ALTER TABLE subagent_tool_executions ADD COLUMN IF NOT EXISTS schema_version INTEGER NOT NULL DEFAULT 1`);
  console.log('  ✅ subagent_tool_executions.schema_version');
} catch(e) { console.log('  ❌ subagent_tool_executions.schema_version:', e.message); }

try {
  await db.query(`ALTER TABLE subagent_tool_executions ADD COLUMN IF NOT EXISTS provider_id TEXT`);
  console.log('  ✅ subagent_tool_executions.provider_id');
} catch(e) { console.log('  ❌ subagent_tool_executions.provider_id:', e.message); }

// Update version to 36
await db.query(`UPDATE config SET value = '36' WHERE key = 'version'`);
console.log('\n✅ Schema version bumped to 36');

// Verify
const version = await db.query("SELECT * FROM config WHERE key = 'version'");
console.log('Verified version:', version.rows[0]?.value);

await db.close();
console.log('\nDone!');