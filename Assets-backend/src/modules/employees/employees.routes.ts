import { Router, Request, Response } from 'express';
import { db } from '../../database/db';
import { ok, notFound, badRequest } from '../../shared/types';
import { authenticate, requireAdmin } from '../../middleware/auth';

const router = Router();

const SELECT_USER = `
  SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.employee_id,
         u.position, u.phone, u.work_location, u.status, u.avatar_url,
         u.joined_date, u.created_at,
         d.name AS department
  FROM users u
  LEFT JOIN departments d ON u.department_id = d.id
`;

// GET /api/employees
router.get('/', authenticate, requireAdmin, async (req: Request, res: Response) => {
  const { status, department, search } = req.query as Record<string, string>;
  const conditions: string[] = [`u.role = 'employee'`];
  const params: unknown[] = [];

  if (status) { conditions.push(`u.status = $${params.length + 1}`); params.push(status); }
  if (department) { conditions.push(`LOWER(d.name) = LOWER($${params.length + 1})`); params.push(department); }
  if (search) {
    conditions.push(`(u.first_name ILIKE $${params.length + 1} OR u.last_name ILIKE $${params.length + 1} OR u.email ILIKE $${params.length + 1})`);
    params.push(`%${search}%`);
  }

  try {
    const { rows } = await db.query(
      `${SELECT_USER} WHERE ${conditions.join(' AND ')} ORDER BY u.first_name`,
      params
    );
    ok(res, rows, 'Employees retrieved');
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/employees/:id
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  // Employees can only fetch their own profile
  if (req.user?.role === 'employee' && req.user.userId !== req.params.id) {
    res.status(403).json({ success: false, message: 'Forbidden' });
    return;
  }
  try {
    const { rows } = await db.query(`${SELECT_USER} WHERE u.id = $1`, [req.params.id]);
    if (!rows[0]) { notFound(res, 'Employee not found'); return; }
    ok(res, rows[0], 'Employee retrieved');
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/employees/:id
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  if (req.user?.role === 'employee' && req.user.userId !== req.params.id) {
    res.status(403).json({ success: false, message: 'Forbidden' });
    return;
  }
  const allowed = ['first_name','last_name','phone','work_location','position','avatar_url'];
  // Only admins can change status / department
  if (req.user?.role === 'admin') allowed.push('status', 'department_id');

  const updates: string[] = [];
  const params: unknown[] = [];
  for (const f of allowed) {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = $${params.length + 1}`);
      params.push(req.body[f]);
    }
  }
  if (!updates.length) { badRequest(res, 'No fields to update'); return; }
  params.push(req.params.id);
  try {
    const { rows } = await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${params.length} RETURNING id, first_name, last_name, email`,
      params
    );
    if (!rows[0]) { notFound(res, 'Employee not found'); return; }
    ok(res, rows[0], 'Employee updated');
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/employees/:id
router.delete('/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { rowCount } = await db.query(`DELETE FROM users WHERE id = $1 AND role = 'employee'`, [req.params.id]);
    if (!rowCount) { notFound(res, 'Employee not found'); return; }
    ok(res, null, 'Employee deleted');
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
