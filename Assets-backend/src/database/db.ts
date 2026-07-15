import { Pool } from 'pg';
import { config } from '../config';

export const db = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

db.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});

export async function checkDbConnection(): Promise<boolean> {
  try {
    const client = await db.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch {
    return false;
  }
}
