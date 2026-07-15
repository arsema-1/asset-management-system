import { Router, Request, Response } from 'express';
import { db } from '../../database/db';
import { ok, created, notFound, badRequest, forbidden, serverError, conflict } from '../../shared/types';
import { authenticate, requireAdmin } from '../../middleware/auth';
import { buildSet, withTransaction, notifyAdmins } from '../../shared/utils';
import { SELECT_USER } from '../employees/employees.routes';

const router = Router();

// GET /api/users
router.get('/', authenticate, requireAdmin, async (_req, res: Response) => {
  try {
    const { rows } = await db.query(`${SELECT_USER} ORDER BY u.first_name`);
    ok(res, rows, 'Users retrieved');
  } catch (err) { serverError(res, err, 'GET /users'); }
});

// GET /api/users/me
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const { rows } = await db.query(`${SELECT_USER} WHERE u.id = $1`, [req.user!.userId]);
    if (!rows[0]) { notFound(res, 'User not found'); return; }
    ok(res, rows[0], 'Profile retrieved');
  } catch (err) { serverError(res, err, 'GET /users/me'); }
});

// GET /api/users/me/notifications
router.get('/me/notifications', authenticate, async (req: Request, res: Response) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [req.user!.userId]
    );
    ok(res, rows, 'Notifications retrieved');
  } catch (err) { serverError(res, err, 'GET /users/me/notifications'); }
});

// PATCH /api/users/me/notifications/:id/read
router.patch('/me/notifications/:id/read', authenticate, async (req: Request, res: Response) => {
  try {
    await db.query(
      `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user!.userId]
    );
    ok(res, null, 'Notification marked as read');
  } catch (err) { serverError(res, err, 'PATCH notifications/:id/read'); }
});

// PATCH /api/users/me/notifications/read-all
router.patch('/me/notifications/read-all', authenticate, async (req: Request, res: Response) => {
  try {
    await db.query(`UPDATE notifications SET is_read = true WHERE user_id = $1`, [req.user!.userId]);
    ok(res, null, 'All notifications marked as read');
  } catch (err) { serverError(res, err, 'PATCH notifications/read-all'); }
});

// POST /api/users/me/support-tickets
router.post('/me/support-tickets', authenticate, async (req: Request, res: Response) => {
  const { subject, message } = req.body;
  if (!subject || !message) { badRequest(res, 'subject and message are required'); return; }
  try {
    await withTransaction(async (client) => {
      const userRes = await client.query(`SELECT first_name, last_name FROM users WHERE id = $1`, [req.user!.userId]);
      const name = userRes.rows[0] ? `${userRes.rows[0].first_name} ${userRes.rows[0].last_name}` : 'Employee';
      await notifyAdmins(client, {
        type: 'system',
        title: `New Support Ticket: ${subject}`,
        body: `Submitted by ${name}:\n\n${message}`,
      });
    });
    ok(res, null, 'Support ticket submitted to admin');
  } catch (err) { serverError(res, err, 'POST /users/me/support-tickets'); }
});

// GET /api/users/:id
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  if (req.user?.role === 'employee' && req.user.userId !== req.params.id) {
    forbidden(res); return;
  }
  try {
    const { rows } = await db.query(`${SELECT_USER} WHERE u.id = $1`, [req.params.id]);
    if (!rows[0]) { notFound(res, 'User not found'); return; }
    ok(res, rows[0], 'User retrieved');
  } catch (err) { serverError(res, err, 'GET /users/:id'); }
});

// POST /api/users
router.post('/', authenticate, requireAdmin, async (req: Request, res: Response) => {
  const { first_name, last_name, email, password, role, employee_id, department, position } = req.body;
  if (!first_name || !last_name || !email || !password) {
    badRequest(res, 'first_name, last_name, email, and password are required'); return;
  }
  try {
    let deptId: string | null = null;
    if (department) {
      const d = await db.query(`SELECT id FROM departments WHERE LOWER(name) = LOWER($1)`, [department]);
      deptId = d.rows[0]?.id ?? null;
    }
    const { rows } = await db.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, role, employee_id, department_id, position)
       VALUES ($1, $2, $3, crypt($4, gen_salt('bf')), $5, $6, $7, $8)
       RETURNING id, first_name, last_name, email, role, employee_id, status`,
      [first_name, last_name, email, password, role ?? 'employee', employee_id ?? null, deptId, position ?? null]
    );
    created(res, rows[0], 'User created');
  } catch (err: unknown) {
    const pg = err as { code?: string };
    if (pg.code === '23505') { conflict(res, 'Email already exists'); }
    else { serverError(res, err, 'POST /users'); }
  }
});

// PUT /api/users/:id
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  if (req.user?.role === 'employee' && req.user.userId !== req.params.id) {
    forbidden(res); return;
  }
  const allowedFields = ['first_name', 'last_name', 'phone', 'work_location', 'position', 'avatar_url'];
  if (req.user?.role === 'admin') allowedFields.push('status', 'role', 'department_id');

  const { set, params } = buildSet(allowedFields, req.body);
  if (!set) { badRequest(res, 'No fields to update'); return; }

  try {
    const { rows } = await db.query(
      `UPDATE users SET ${set} WHERE id = $${params.length + 1} RETURNING id, first_name, last_name, email, role`,
      [...params, req.params.id]
    );
    if (!rows[0]) { notFound(res, 'User not found'); return; }
    ok(res, rows[0], 'User updated');
  } catch (err) { serverError(res, err, 'PUT /users/:id'); }
});

// DELETE /api/users/:id
router.delete('/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { rowCount } = await db.query(`DELETE FROM users WHERE id = $1`, [req.params.id]);
    if (!rowCount) { notFound(res, 'User not found'); return; }
    ok(res, null, 'User deleted');
  } catch (err) { serverError(res, err, 'DELETE /users/:id'); }
});

export default router;
