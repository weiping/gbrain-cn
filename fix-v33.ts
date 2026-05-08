import { PGlite } from '@electric-sql/pglite';
import { join } from 'path';
import { homedir } from 'os';

const db = new PGlite(join(homedir(), '.gbrain', 'brain.pglite'));
await db.waitReady;

console.log('Applying schema fixes for v33 migration...\n');

// 1. Create oauth_clients table (missing entirely)
try {
  await db.query(`
    CREATE TABLE IF NOT EXISTS oauth_clients (
      client_id               TEXT PRIMARY KEY,
      client_secret_hash      TEXT,
      client_name             TEXT NOT NULL,
      redirect_uris           TEXT[],
      grant_types             TEXT[] DEFAULT '{"client_credentials"}',
      scope                   TEXT,
      token_endpoint_auth_method TEXT,
      client_id_issued_at     BIGINT,
      client_secret_expires_at BIGINT,
      token_ttl               INTEGER,
      deleted_at              TIMESTAMPTZ,
      created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  console.log('✅ Created oauth_clients table');
} catch(e) {
  console.log('oauth_clients error:', e.message);
}

// 2. Add missing columns to mcp_request_log
const missingCols = ['agent_name', 'params', 'error_message'];
for (const col of missingCols) {
  try {
    const colType = col === 'params' ? 'JSONB' : 'TEXT';
    await db.query(`ALTER TABLE mcp_request_log ADD COLUMN IF NOT EXISTS ${col} ${colType}`);
    console.log(`✅ Added mcp_request_log.${col}`);
  } catch(e) {
    console.log(`mcp_request_log.${col} error:`, e.message);
  }
}

// 3. Create index for agent_name
try {
  await db.query(`CREATE INDEX IF NOT EXISTS idx_mcp_log_agent_time ON mcp_request_log(agent_name, created_at DESC)`);
  console.log('✅ Created idx_mcp_log_agent_time index');
} catch(e) {
  console.log('index error:', e.message);
}

// 4. Update schema version to 33
try {
  await db.query(`UPDATE config SET value = '33' WHERE key = 'version'`);
  console.log('✅ Updated schema version from 30 → 33');
} catch(e) {
  console.log('version update error:', e.message);
}

// Verify
const version = await db.query("SELECT * FROM config WHERE key = 'version'");
console.log('\nCurrent version:', JSON.stringify(version.rows));

await db.close();
console.log('\nDone!');