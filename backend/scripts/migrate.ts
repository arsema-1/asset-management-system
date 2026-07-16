import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { config } from '../src/config';

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
});

async function runMigration(filePath: string) {
  const client = await pool.connect();
  try {
    const sql = fs.readFileSync(filePath, 'utf-8');
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    for (const statement of statements) {
      try {
        await client.query(statement);
        console.log(`✅ Executed: ${statement.slice(0, 60)}...`);
      } catch (err: unknown) {
        const error = err as { code?: string; message?: string };
        if (error.code === '42P07' || error.message?.includes('already exists')) {
          console.log(`⏭️  Already exists, skipped`);
        } else {
          throw err;
        }
      }
    }

    console.log('\n✅ Migration completed successfully');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

const migrationFile = process.argv[2];
if (!migrationFile) {
  console.error('Usage: npx ts-node scripts/migrate.ts <path-to-sql>');
  process.exit(1);
}

runMigration(path.resolve(migrationFile));
