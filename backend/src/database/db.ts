import { Pool, type PoolConfig } from 'pg';
import { config } from '../config';

const poolConfig: PoolConfig = {
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Neon cold starts can take 5+ seconds
};

if (config.db.url) {
  // Use connection string (Neon, Supabase, etc.)
  poolConfig.connectionString = config.db.url;
} else {
  // Use individual connection params
  poolConfig.host = config.db.host;
  poolConfig.port = config.db.port;
  poolConfig.database = config.db.database;
  poolConfig.user = config.db.user;
  poolConfig.password = config.db.password;
}

export const db = new Pool(poolConfig);

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
