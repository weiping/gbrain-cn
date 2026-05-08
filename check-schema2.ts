import { PGlite } from '@electric-sql/pglite';
import { join } from 'path';
import { homedir } from 'os';

const db = new PGlite(join(homedir(), '.gbrain', 'brain.pglite'));
await db.waitReady;

// Check migrations table
try {
  const r = await db.query('SELECT * FROM pgmigrations ORDER BY applied_at DESC LIMIT 5');
  console.log('recent migrations:', JSON.stringify(r.rows, null, 2));
} catch(e) {
  console.log('pgmigrations error:', e.message);
}

// Check all tables
const t = await db.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename");
console.log('\nall tables:', JSON.stringify(t.rows.map((r: any) => r.tablename)));

// Check current schema version
const v = await db.query("SELECT * FROM gbrain_meta WHERE key = 'schema_version'");
console.log('\nschema_version:', JSON.stringify(v.rows));

await db.close();
console.log('\nDone');