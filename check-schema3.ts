import { PGlite } from '@electric-sql/pglite';
import { join } from 'path';
import { homedir } from 'os';

const db = new PGlite(join(homedir(), '.gbrain', 'brain.pglite'));
await db.waitReady;

// Check config table for version
try {
  const r = await db.query("SELECT * FROM config WHERE key IN ('schema_version', 'version')");
  console.log('config version:', JSON.stringify(r.rows, null, 2));
} catch(e) {
  console.log('config error:', e.message);
}

// Check mcp_request_log columns more carefully
const mcp = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'mcp_request_log' ORDER BY ordinal_position");
console.log('\nmcp_request_log columns:', JSON.stringify(mcp.rows.map((r: any) => r.column_name)));

// Check oauth_clients - does it exist at all?
const oauth = await db.query("SELECT EXISTS (SELECT FROM pg_tables WHERE tablename = 'oauth_clients')");
console.log('\noauth_clients exists:', oauth.rows);

// Check if migration tracking table has different name
const allTables = await db.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
console.log('\nall tables:', JSON.stringify(allTables.rows.map((r: any) => r.tablename)));

await db.close();