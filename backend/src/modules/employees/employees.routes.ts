import { Router, Request, Response } from 'express';
import { db } from '../../database/db';
import { ok, notFound, badRequest, forbidden, serverError } from '../../shared/types';
import { authenticate, requireAdmin } from '../../middleware/auth';
import { addFilter, buildWhere, buildSet } from '../../shared/utils';

const router = Router();

// Shared SELECT — used by both employees & users routes
export const SELECT_USER = `
  SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.employee_id,
         u.position, u.phone, u.work_location, u.status, u.avatar_url,
         u.joined_date, u.two_factor_enabled, u.created_at,
         d.name AS department
  FROM users u
  LEFT JOIN departments d ON u.department_id = d.id
`;

// GET /api/employees
router.get('/', authenticate, requireAdmin, async (req: Request, res: Response) => {
  const { status, department, search } = req.query as Record<string, string>;
  const conditions: string[] = [`u.role = 'employee'`];
  const params: unknown[] = [];

  addFilter(conditions, params, 'u.status', status);
  addFilter(conditions, params, 'LOWER(d.name)', department ? department.toLowerCase() : undefined);
  if (search) {
    const idx = params.length + 1;
    conditions.push(`(u.first_name ILIKE $${idx} OR u.last_name ILIKE $${idx} OR (u.first_name || ' ' || u.last_name) ILIKE $${idx} OR u.email ILIKE $${idx} OR u.employee_id ILIKE $${idx} OR u.id::text ILIKE $${idx})`);
    params.push(`%${search}%`);
  }

  try {
    const { rows } = await db.query(
      `${SELECT_USER} WHERE ${conditions.join(' AND ')} ORDER BY u.first_name`,
      params
    );
    ok(res, rows, 'Employees retrieved');
  } catch (err) { serverError(res, err, 'GET /employees'); }
});

// GET /api/employees/:id
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  if (req.user?.role === 'employee' && req.user.userId !== req.params.id) {
    forbidden(res); return;
  }
  try {
    const { rows } = await db.query(`${SELECT_USER} WHERE u.id = $1`, [req.params.id]);
    if (!rows[0]) { notFound(res, 'Employee not found'); return; }
    ok(res, rows[0], 'Employee retrieved');
  } catch (err) { serverError(res, err, 'GET /employees/:id'); }
});

// PUT /api/employees/:id
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  if (req.user?.role === 'employee' && req.user.userId !== req.params.id) {
    forbidden(res); return;
  }
  const allowedFields = ['first_name', 'last_name', 'phone', 'work_location', 'position', 'avatar_url'];
  if (req.user?.role === 'admin') allowedFields.push('status', 'department_id');

  const { set, params } = buildSet(allowedFields, req.body);
  if (!set) { badRequest(res, 'No fields to update'); return; }

  try {
    const { rows } = await db.query(
      `UPDATE users SET ${set} WHERE id = $${params.length + 1} RETURNING id, first_name, last_name, email`,
      [...params, req.params.id]
    );
    if (!rows[0]) { notFound(res, 'Employee not found'); return; }
    ok(res, rows[0], 'Employee updated');
  } catch (err) { serverError(res, err, 'PUT /employees/:id'); }
});

// DELETE /api/employees/:id
router.delete('/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { rowCount } = await db.query(`DELETE FROM users WHERE id = $1 AND role = 'employee'`, [req.params.id]);
    if (!rowCount) { notFound(res, 'Employee not found'); return; }
    ok(res, null, 'Employee deleted');
  } catch (err) { serverError(res, err, 'DELETE /employees/:id'); }
});

export default router;
