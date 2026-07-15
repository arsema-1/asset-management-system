"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../../database/db");
const types_1 = require("../../shared/types");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
const SELECT_USER = `
  SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.employee_id,
         u.position, u.phone, u.work_location, u.status, u.avatar_url,
         u.joined_date, u.created_at,
         d.name AS department
  FROM users u
  LEFT JOIN departments d ON u.department_id = d.id
`;
// GET /api/employees
router.get('/', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    const { status, department, search } = req.query;
    const conditions = [`u.role = 'employee'`];
    const params = [];
    if (status) {
        conditions.push(`u.status = $${params.length + 1}`);
        params.push(status);
    }
    if (department) {
        conditions.push(`LOWER(d.name) = LOWER($${params.length + 1})`);
        params.push(department);
    }
    if (search) {
        conditions.push(`(u.first_name ILIKE $${params.length + 1} OR u.last_name ILIKE $${params.length + 1} OR u.email ILIKE $${params.length + 1})`);
        params.push(`%${search}%`);
    }
    try {
        const { rows } = await db_1.db.query(`${SELECT_USER} WHERE ${conditions.join(' AND ')} ORDER BY u.first_name`, params);
        (0, types_1.ok)(res, rows, 'Employees retrieved');
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// GET /api/employees/:id
router.get('/:id', auth_1.authenticate, async (req, res) => {
    // Employees can only fetch their own profile
    if (req.user?.role === 'employee' && req.user.userId !== req.params.id) {
        res.status(403).json({ success: false, message: 'Forbidden' });
        return;
    }
    try {
        const { rows } = await db_1.db.query(`${SELECT_USER} WHERE u.id = $1`, [req.params.id]);
        if (!rows[0]) {
            (0, types_1.notFound)(res, 'Employee not found');
            return;
        }
        (0, types_1.ok)(res, rows[0], 'Employee retrieved');
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// PUT /api/employees/:id
router.put('/:id', auth_1.authenticate, async (req, res) => {
    if (req.user?.role === 'employee' && req.user.userId !== req.params.id) {
        res.status(403).json({ success: false, message: 'Forbidden' });
        return;
    }
    const allowed = ['first_name', 'last_name', 'phone', 'work_location', 'position', 'avatar_url'];
    // Only admins can change status / department
    if (req.user?.role === 'admin')
        allowed.push('status', 'department_id');
    const updates = [];
    const params = [];
    for (const f of allowed) {
        if (req.body[f] !== undefined) {
            updates.push(`${f} = $${params.length + 1}`);
            params.push(req.body[f]);
        }
    }
    if (!updates.length) {
        (0, types_1.badRequest)(res, 'No fields to update');
        return;
    }
    params.push(req.params.id);
    try {
        const { rows } = await db_1.db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = $${params.length} RETURNING id, first_name, last_name, email`, params);
        if (!rows[0]) {
            (0, types_1.notFound)(res, 'Employee not found');
            return;
        }
        (0, types_1.ok)(res, rows[0], 'Employee updated');
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// DELETE /api/employees/:id
router.delete('/:id', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { rowCount } = await db_1.db.query(`DELETE FROM users WHERE id = $1 AND role = 'employee'`, [req.params.id]);
        if (!rowCount) {
            (0, types_1.notFound)(res, 'Employee not found');
            return;
        }
        (0, types_1.ok)(res, null, 'Employee deleted');
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.default = router;
