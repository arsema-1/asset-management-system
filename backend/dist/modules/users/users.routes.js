"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../../database/db");
const types_1 = require("../../shared/types");
const auth_1 = require("../../middleware/auth");
const utils_1 = require("../../shared/utils");
const employees_routes_1 = require("../employees/employees.routes");
const router = (0, express_1.Router)();
// GET /api/users
router.get('/', auth_1.authenticate, auth_1.requireAdmin, async (_req, res) => {
    try {
        const { rows } = await db_1.db.query(`${employees_routes_1.SELECT_USER} ORDER BY u.first_name`);
        (0, types_1.ok)(res, rows, 'Users retrieved');
    }
    catch (err) {
        (0, types_1.serverError)(res, err, 'GET /users');
    }
});
// GET /api/users/me
router.get('/me', auth_1.authenticate, async (req, res) => {
    try {
        const { rows } = await db_1.db.query(`${employees_routes_1.SELECT_USER} WHERE u.id = $1`, [req.user.userId]);
        if (!rows[0]) {
            (0, types_1.notFound)(res, 'User not found');
            return;
        }
        (0, types_1.ok)(res, rows[0], 'Profile retrieved');
    }
    catch (err) {
        (0, types_1.serverError)(res, err, 'GET /users/me');
    }
});
// GET /api/users/me/notifications
router.get('/me/notifications', auth_1.authenticate, async (req, res) => {
    try {
        const { rows } = await db_1.db.query(`SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`, [req.user.userId]);
        (0, types_1.ok)(res, rows, 'Notifications retrieved');
    }
    catch (err) {
        (0, types_1.serverError)(res, err, 'GET /users/me/notifications');
    }
});
// PATCH /api/users/me/notifications/:id/read
router.patch('/me/notifications/:id/read', auth_1.authenticate, async (req, res) => {
    try {
        await db_1.db.query(`UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2`, [req.params.id, req.user.userId]);
        (0, types_1.ok)(res, null, 'Notification marked as read');
    }
    catch (err) {
        (0, types_1.serverError)(res, err, 'PATCH notifications/:id/read');
    }
});
// PATCH /api/users/me/notifications/read-all
router.patch('/me/notifications/read-all', auth_1.authenticate, async (req, res) => {
    try {
        await db_1.db.query(`UPDATE notifications SET is_read = true WHERE user_id = $1`, [req.user.userId]);
        (0, types_1.ok)(res, null, 'All notifications marked as read');
    }
    catch (err) {
        (0, types_1.serverError)(res, err, 'PATCH notifications/read-all');
    }
});
// POST /api/users/me/support-tickets
router.post('/me/support-tickets', auth_1.authenticate, async (req, res) => {
    const { subject, message } = req.body;
    if (!subject || !message) {
        (0, types_1.badRequest)(res, 'subject and message are required');
        return;
    }
    try {
        await (0, utils_1.withTransaction)(async (client) => {
            const userRes = await client.query(`SELECT first_name, last_name FROM users WHERE id = $1`, [req.user.userId]);
            const name = userRes.rows[0] ? `${userRes.rows[0].first_name} ${userRes.rows[0].last_name}` : 'Employee';
            await (0, utils_1.notifyAdmins)(client, {
                type: 'system',
                title: `New Support Ticket: ${subject}`,
                body: `Submitted by ${name}:\n\n${message}`,
            });
        });
        (0, types_1.ok)(res, null, 'Support ticket submitted to admin');
    }
    catch (err) {
        (0, types_1.serverError)(res, err, 'POST /users/me/support-tickets');
    }
});
// GET /api/users/:id
router.get('/:id', auth_1.authenticate, async (req, res) => {
    if (req.user?.role === 'employee' && req.user.userId !== req.params.id) {
        (0, types_1.forbidden)(res);
        return;
    }
    try {
        const { rows } = await db_1.db.query(`${employees_routes_1.SELECT_USER} WHERE u.id = $1`, [req.params.id]);
        if (!rows[0]) {
            (0, types_1.notFound)(res, 'User not found');
            return;
        }
        (0, types_1.ok)(res, rows[0], 'User retrieved');
    }
    catch (err) {
        (0, types_1.serverError)(res, err, 'GET /users/:id');
    }
});
// POST /api/users
router.post('/', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    const { first_name, last_name, email, password, role, employee_id, department, position } = req.body;
    if (!first_name || !last_name || !email || !password) {
        (0, types_1.badRequest)(res, 'first_name, last_name, email, and password are required');
        return;
    }
    try {
        let deptId = null;
        if (department) {
            const d = await db_1.db.query(`SELECT id FROM departments WHERE LOWER(name) = LOWER($1)`, [department]);
            deptId = d.rows[0]?.id ?? null;
        }
        const { rows } = await db_1.db.query(`INSERT INTO users (first_name, last_name, email, password_hash, role, employee_id, department_id, position)
       VALUES ($1, $2, $3, crypt($4, gen_salt('bf')), $5, $6, $7, $8)
       RETURNING id, first_name, last_name, email, role, employee_id, status`, [first_name, last_name, email, password, role ?? 'employee', employee_id ?? null, deptId, position ?? null]);
        (0, types_1.created)(res, rows[0], 'User created');
    }
    catch (err) {
        const pg = err;
        if (pg.code === '23505') {
            (0, types_1.conflict)(res, 'Email already exists');
        }
        else {
            (0, types_1.serverError)(res, err, 'POST /users');
        }
    }
});
// PUT /api/users/:id
router.put('/:id', auth_1.authenticate, async (req, res) => {
    if (req.user?.role === 'employee' && req.user.userId !== req.params.id) {
        (0, types_1.forbidden)(res);
        return;
    }
    const allowedFields = ['first_name', 'last_name', 'phone', 'work_location', 'position', 'avatar_url'];
    if (req.user?.role === 'admin')
        allowedFields.push('status', 'role', 'department_id');
    const { set, params } = (0, utils_1.buildSet)(allowedFields, req.body);
    if (!set) {
        (0, types_1.badRequest)(res, 'No fields to update');
        return;
    }
    try {
        const { rows } = await db_1.db.query(`UPDATE users SET ${set} WHERE id = $${params.length + 1} RETURNING id, first_name, last_name, email, role`, [...params, req.params.id]);
        if (!rows[0]) {
            (0, types_1.notFound)(res, 'User not found');
            return;
        }
        (0, types_1.ok)(res, rows[0], 'User updated');
    }
    catch (err) {
        (0, types_1.serverError)(res, err, 'PUT /users/:id');
    }
});
// DELETE /api/users/:id
router.delete('/:id', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { rowCount } = await db_1.db.query(`DELETE FROM users WHERE id = $1`, [req.params.id]);
        if (!rowCount) {
            (0, types_1.notFound)(res, 'User not found');
            return;
        }
        (0, types_1.ok)(res, null, 'User deleted');
    }
    catch (err) {
        (0, types_1.serverError)(res, err, 'DELETE /users/:id');
    }
});
exports.default = router;
