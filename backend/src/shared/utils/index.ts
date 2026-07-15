import { PoolClient } from 'pg';
import { db } from '../../database/db';

// ── Query Builder ───────────────────────────────────────
/** Builds a parameterised WHERE clause from a conditions array. */
export function buildWhere(conditions: string[], params: unknown[]): string {
  return conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
}

/** Pushes a filter condition only if value is defined. Returns updated param count. */
export function addFilter(
  conditions: string[],
  params: unknown[],
  column: string,
  value: unknown,
  operator: 'eq' | 'ilike' = 'eq',
): void {
  if (value === undefined || value === null || value === '') return;
  const idx = params.length + 1;
  if (operator === 'ilike') {
    conditions.push(`${column} ILIKE $${idx}`);
    params.push(`%${value}%`);
  } else {
    conditions.push(`${column} = $${idx}`);
    params.push(value);
  }
}

/** Builds a SET clause for UPDATE queries. */
export function buildSet(fields: string[], body: Record<string, unknown>): { set: string; params: unknown[] } {
  const updates: string[] = [];
  const params: unknown[] = [];
  for (const f of fields) {
    if (body[f] !== undefined) {
      updates.push(`${f} = $${params.length + 1}`);
      params.push(body[f]);
    }
  }
  return { set: updates.join(', '), params };
}

// ── Transaction Helper ──────────────────────────────────
/** Runs fn inside a BEGIN/COMMIT/ROLLBACK transaction. */
export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ── Notifications ───────────────────────────────────────
/** Broadcasts a notification to every admin in the system. */
export async function notifyAdmins(
  client: PoolClient,
  opts: { type: string; title: string; body: string; referenceId?: string; excludeUserId?: string }
): Promise<void> {
  const admins = await client.query(`SELECT id FROM users WHERE role = 'admin'`);
  for (const admin of admins.rows) {
    if (opts.excludeUserId && admin.id === opts.excludeUserId) continue;
    await client.query(
      `INSERT INTO notifications (user_id, type, title, body, reference_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [admin.id, opts.type, opts.title, opts.body, opts.referenceId ?? null]
    );
  }
}

/** Sends a notification to a single user. */
export async function notifyUser(
  client: PoolClient,
  opts: { userId: string; type: string; title: string; body: string; referenceId?: string }
): Promise<void> {
  await client.query(
    `INSERT INTO notifications (user_id, type, title, body, reference_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [opts.userId, opts.type, opts.title, opts.body, opts.referenceId ?? null]
  );
}

// ── Activity Logger ─────────────────────────────────────
export async function logActivity(
  client: PoolClient,
  opts: { userId: string; assetId?: string; action: string; description: string }
): Promise<void> {
  await client.query(
    `INSERT INTO activities (user_id, asset_id, action, description) VALUES ($1, $2, $3, $4)`,
    [opts.userId, opts.assetId ?? null, opts.action, opts.description]
  );
}

// ── User helpers ────────────────────────────────────────
export async function getFullName(client: PoolClient, userId: string): Promise<string> {
  const res = await client.query(`SELECT first_name, last_name FROM users WHERE id = $1`, [userId]);
  return res.rows[0] ? `${res.rows[0].first_name} ${res.rows[0].last_name}` : 'Unknown';
}
