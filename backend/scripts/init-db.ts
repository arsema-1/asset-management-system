import { Pool, type PoolConfig } from 'pg';
import fs from 'fs';
import path from 'path';
import { config } from '../src/config';

const poolOptions: PoolConfig = {
  connectionTimeoutMillis: 10000, // Neon cold starts can take 5+ seconds
};

if (config.db.url) {
  poolOptions.connectionString = config.db.url;
} else {
  poolOptions.host = config.db.host;
  poolOptions.port = config.db.port;
  poolOptions.database = config.db.database;
  poolOptions.user = config.db.user;
  poolOptions.password = config.db.password;
}

const pool = new Pool(poolOptions);

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    console.log('🔄 Initializing database schema...');
    
    const schemaPath = path.join(__dirname, '../src/database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    // Execute the entire schema at once (splitting by ; breaks dollar-quoted functions)
    try {
      await client.query(schema);
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      // Ignore "already exists" errors for idempotent re-runs
      if (
        error.code !== '42P07' &&
        error.code !== '42710' &&
        error.code !== '42723' &&
        !error.message?.includes('already exists')
      ) {
        throw err;
      }
    }
    
    console.log('✅ Database schema initialized successfully');
    
    // Log table info
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📊 Tables created:');
    tables.rows.forEach(row => console.log(`  - ${row.table_name}`));
    
  } catch (err) {
    console.error('❌ Database initialization failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

initializeDatabase();
