import { PGlite } from '@electric-sql/pglite';
import { homedir } from 'os';
import { join } from 'path';

const dbPath = join(homedir(), '.gbrain', 'brain.pglite');
console.log('DB path:', dbPath);

const db = new PGlite(dbPath);
await db.waitReady;

try {
  const r1 = await db.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'oauth_clients' ORDER BY ordinal_position`);
  console.log('\noauth_clients columns:', JSON.stringify(r1.rows, null, 2));
} catch(e) {
  console.log('oauth_clients error:', e.message);
}

try {
  const r2 = await db.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'mcp_request_log' ORDER BY ordinal_position`);
  console.log('\nmcp_request_log columns:', JSON.stringify(r2.rows, null, 2));
} catch(e) {
  console.log('mcp_request_log error:', e.message);
}

try {
  const r3 = await db.query(`SELECT * FROM gbrain_meta WHERE key = 'version'`);
// @ts-ignore
  console.log('\nschema version:', r3.rows[0]?.value);
} catch(e) {
  console.log('version error:', e.message);
}

await db.close();
console.log('\nDone');