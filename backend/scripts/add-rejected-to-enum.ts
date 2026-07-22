import { Pool } from 'pg';
import { config } from '../src/config';

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
});

async function main() {
  const client = await pool.connect();
  try {
    console.log('Adding "rejected" to return_status enum...');
    await client.query(`ALTER TYPE return_status ADD VALUE IF NOT EXISTS 'rejected'`);
    console.log('✅ Enum updated successfully');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});
