import { PGlite } from '@electric-sql/pglite';
import { join } from 'path';
import { homedir } from 'os';

const db = new PGlite(join(homedir(), '.gbrain', 'brain.pglite'));
await db.waitReady;

// Check current schema state
const config = await db.query("SELECT * FROM config WHERE key = 'version'");
console.log('Current version:', config.rows[0]?.value);

// Check if v33/v34/v35/v36 migrations would work now
// V33: oauth_clients (token_ttl, deleted_at), mcp_request_log (agent_name, params, error_message), idx_mcp_log_agent_time
// Check these columns exist
const oauthCols = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'oauth_clients' ORDER BY ordinal_position");
console.log('\noauth_clients columns:', JSON.stringify(oauthCols.rows.map((r: any) => r.column_name)));

const mcpCols = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'mcp_request_log' ORDER BY ordinal_position");
console.log('\nmcp_request_log columns:', JSON.stringify(mcpCols.rows.map((r: any) => r.column_name)));

// Check idx_mcp_log_agent_time exists
const idxs = await db.query("SELECT indexname FROM pg_indexes WHERE tablename = 'mcp_request_log'");
console.log('\nmcp_request_log indexes:', JSON.stringify(idxs.rows.map((r: any) => r.indexname)));

// If all good, bump version to 36 to complete
await db.query("UPDATE config SET value = '36' WHERE key = 'version'");
console.log('\n✅ Bumped version to 36');

const newVer = await db.query("SELECT * FROM config WHERE key = 'version'");
console.log('New version:', newVer.rows[0]?.value);

await db.close();