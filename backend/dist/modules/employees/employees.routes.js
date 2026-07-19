"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SELECT_USER = void 0;
const express_1 = require("express");
const db_1 = require("../../database/db");
const types_1 = require("../../shared/types");
const auth_1 = require("../../middleware/auth");
const utils_1 = require("../../shared/utils");
const router = (0, express_1.Router)();
// Shared SELECT — used by both employees & users routes
exports.SELECT_USER = `
  SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.employee_id,
         u.position, u.phone, u.work_location, u.status, u.avatar_url,
         u.joined_date, u.two_factor_enabled, u.created_at,
         d.name AS department
  FROM users u
  LEFT JOIN departments d ON u.department_id = d.id
`;
// GET /api/employees
router.get('/', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    const { status, department, search } = req.query;
    const conditions = [`u.role = 'employee'`];
    const params = [];
    (0, utils_1.addFilter)(conditions, params, 'u.status', status);
    (0, utils_1.addFilter)(conditions, params, 'LOWER(d.name)', department ? department.toLowerCase() : undefined);
    if (search) {
        const idx = params.length + 1;
        conditions.push(`(u.first_name ILIKE $${idx} OR u.last_name ILIKE $${idx} OR (u.first_name || ' ' || u.last_name) ILIKE $${idx} OR u.email ILIKE $${idx} OR u.employee_id ILIKE $${idx} OR u.id::text ILIKE $${idx})`);
        params.push(`%${search}%`);
    }
    try {
        const { rows } = await db_1.db.query(`${exports.SELECT_USER} WHERE ${conditions.join(' AND ')} ORDER BY u.first_name`, params);
        (0, types_1.ok)(res, rows, 'Employees retrieved');
    }
    catch (err) {
        (0, types_1.serverError)(res, err, 'GET /employees');
    }
});
// GET /api/employees/:id
router.get('/:id', auth_1.authenticate, async (req, res) => {
    if (req.user?.role === 'employee' && req.user.userId !== req.params.id) {
        (0, types_1.forbidden)(res);
        return;
    }
    try {
        const { rows } = await db_1.db.query(`${exports.SELECT_USER} WHERE u.id = $1`, [req.params.id]);
        if (!rows[0]) {
            (0, types_1.notFound)(res, 'Employee not found');
            return;
        }
        (0, types_1.ok)(res, rows[0], 'Employee retrieved');
    }
    catch (err) {
        (0, types_1.serverError)(res, err, 'GET /employees/:id');
    }
});
// PUT /api/employees/:id
router.put('/:id', auth_1.authenticate, async (req, res) => {
    if (req.user?.role === 'employee' && req.user.userId !== req.params.id) {
        (0, types_1.forbidden)(res);
        return;
    }
    const allowedFields = ['first_name', 'last_name', 'phone', 'work_location', 'position', 'avatar_url'];
    if (req.user?.role === 'admin')
        allowedFields.push('status', 'department_id');
    const { set, params } = (0, utils_1.buildSet)(allowedFields, req.body);
    if (!set) {
        (0, types_1.badRequest)(res, 'No fields to update');
        return;
    }
    try {
        const { rows } = await db_1.db.query(`UPDATE users SET ${set} WHERE id = $${params.length + 1} RETURNING id, first_name, last_name, email`, [...params, req.params.id]);
        if (!rows[0]) {
            (0, types_1.notFound)(res, 'Employee not found');
            return;
        }
        (0, types_1.ok)(res, rows[0], 'Employee updated');
    }
    catch (err) {
        (0, types_1.serverError)(res, err, 'PUT /employees/:id');
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
        (0, types_1.serverError)(res, err, 'DELETE /employees/:id');
    }
});
exports.default = router;
