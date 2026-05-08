import { PGlite } from '@electric-sql/pglite';
import { join } from 'path';
import { homedir } from 'os';

const db = new PGlite(join(homedir(), '.gbrain', 'brain.pglite'));
await db.waitReady;

// Check all possible migration tracking mechanisms
const tables = await db.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename");
console.log('All tables:', JSON.stringify(tables.rows.map((r: any) => r.tablename)));

// Check config
const config = await db.query("SELECT * FROM config");
console.log('\nconfig rows:', JSON.stringify(config.rows));

await db.close();