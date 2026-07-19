"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildWhere = buildWhere;
exports.addFilter = addFilter;
exports.buildSet = buildSet;
exports.withTransaction = withTransaction;
exports.notifyAdmins = notifyAdmins;
exports.notifyUser = notifyUser;
exports.logActivity = logActivity;
exports.getFullName = getFullName;
const db_1 = require("../../database/db");
// ── Query Builder ───────────────────────────────────────
/** Builds a parameterised WHERE clause from a conditions array. */
function buildWhere(conditions, params) {
    return conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
}
/** Pushes a filter condition only if value is defined. Returns updated param count. */
function addFilter(conditions, params, column, value, operator = 'eq') {
    if (value === undefined || value === null || value === '')
        return;
    const idx = params.length + 1;
    if (operator === 'ilike') {
        conditions.push(`${column} ILIKE $${idx}`);
        params.push(`%${value}%`);
    }
    else {
        conditions.push(`${column} = $${idx}`);
        params.push(value);
    }
}
/** Builds a SET clause for UPDATE queries. */
function buildSet(fields, body) {
    const updates = [];
    const params = [];
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
async function withTransaction(fn) {
    const client = await db_1.db.connect();
    try {
        await client.query('BEGIN');
        const result = await fn(client);
        await client.query('COMMIT');
        return result;
    }
    catch (err) {
        await client.query('ROLLBACK');
        throw err;
    }
    finally {
        client.release();
    }
}
// ── Notifications ───────────────────────────────────────
/** Broadcasts a notification to every admin in the system. */
async function notifyAdmins(client, opts) {
    const admins = await client.query(`SELECT id FROM users WHERE role = 'admin'`);
    for (const admin of admins.rows) {
        if (opts.excludeUserId && admin.id === opts.excludeUserId)
            continue;
        await client.query(`INSERT INTO notifications (user_id, type, title, body, reference_id)
       VALUES ($1, $2, $3, $4, $5)`, [admin.id, opts.type, opts.title, opts.body, opts.referenceId ?? null]);
    }
}
/** Sends a notification to a single user. */
async function notifyUser(client, opts) {
    await client.query(`INSERT INTO notifications (user_id, type, title, body, reference_id)
     VALUES ($1, $2, $3, $4, $5)`, [opts.userId, opts.type, opts.title, opts.body, opts.referenceId ?? null]);
}
// ── Activity Logger ─────────────────────────────────────
async function logActivity(client, opts) {
    await client.query(`INSERT INTO activities (user_id, asset_id, action, description) VALUES ($1, $2, $3, $4)`, [opts.userId, opts.assetId ?? null, opts.action, opts.description]);
}
// ── User helpers ────────────────────────────────────────
async function getFullName(client, userId) {
    const res = await client.query(`SELECT first_name, last_name FROM users WHERE id = $1`, [userId]);
    return res.rows[0] ? `${res.rows[0].first_name} ${res.rows[0].last_name}` : 'Unknown';
}
