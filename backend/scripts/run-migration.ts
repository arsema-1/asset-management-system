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
    console.log('Creating password_reset_tokens table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        used BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    console.log('✅ Table created');

    await client.query('CREATE INDEX IF NOT EXISTS idx_reset_tokens_user ON password_reset_tokens(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_reset_tokens_token ON password_reset_tokens(token)');
    console.log('✅ Indexes created');

    // Verify
    const { rows } = await client.query(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'password_reset_tokens'`
    );
    console.log('\n📊 Columns:');
    rows.forEach(r => console.log(`  - ${r.column_name} (${r.data_type})`));
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});
