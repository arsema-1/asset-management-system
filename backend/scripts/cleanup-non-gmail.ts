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
    // 1. Add email_verified column
    console.log('Adding email_verified column...');
    await client.query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE`
    );
    console.log('✅ Column added');

    // 2. Create email_verification_tokens table
    console.log('Creating email_verification_tokens table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS email_verification_tokens (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await client.query('CREATE INDEX IF NOT EXISTS idx_email_verification_user ON email_verification_tokens(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_email_verification_token ON email_verification_tokens(token)');
    console.log('✅ Table created');

    // 3. Find and display non-gmail users
    const { rows: nonGmail } = await client.query(
      `SELECT id, email, role FROM users WHERE LOWER(email) NOT LIKE '%@gmail.com'`
    );

    if (nonGmail.length > 0) {
      console.log(`\n⚠️  Found ${nonGmail.length} non-gmail user(s):`);
      nonGmail.forEach(u => console.log(`   - ${u.email} (role: ${u.role})`));

      // Delete their related records first
      console.log('\nRemoving non-gmail users and related records...');
      for (const user of nonGmail) {
        await client.query('DELETE FROM notifications WHERE user_id = $1', [user.id]);
        await client.query('DELETE FROM activities WHERE user_id = $1', [user.id]);
        await client.query('DELETE FROM asset_returns WHERE requested_by = $1', [user.id]);
        await client.query('DELETE FROM asset_requests WHERE requested_by = $1', [user.id]);
        await client.query('DELETE FROM asset_assignments WHERE user_id = $1', [user.id]);
        await client.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [user.id]);
        await client.query('DELETE FROM email_verification_tokens WHERE user_id = $1', [user.id]);
        await client.query('DELETE FROM users WHERE id = $1', [user.id]);
        console.log(`   ✅ Removed ${user.email}`);
      }
    } else {
      console.log('\n✅ No non-gmail users found');
    }

    // 4. Mark the admin user as pre-verified
    await client.query(
      `UPDATE users SET email_verified = TRUE WHERE email = 'arsemaarse51@gmail.com'`
    );
    console.log('\n✅ Admin user marked as verified');

    console.log('\n✅ Cleanup completed successfully');
  } catch (err) {
    console.error('❌ Failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
