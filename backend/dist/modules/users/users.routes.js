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
         u.joined_date, u.two_factor_enabled, u.created_at,
         d.name AS department
  FROM users u
  LEFT JOIN departments d ON u.department_id = d.id
`;
// GET /api/users
router.get('/', auth_1.authenticate, auth_1.requireAdmin, async (_req, res) => {
    try {
        const { rows } = await db_1.db.query(`${SELECT_USER} ORDER BY u.first_name`);
        (0, types_1.ok)(res, rows, 'Users retrieved');
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// GET /api/users/me
router.get('/me', auth_1.authenticate, async (req, res) => {
    try {
        const { rows } = await db_1.db.query(`${SELECT_USER} WHERE u.id = $1`, [req.user.userId]);
        if (!rows[0]) {
            (0, types_1.notFound)(res, 'User not found');
            return;
        }
        (0, types_1.ok)(res, rows[0], 'Profile retrieved');
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// GET /api/users/me/notifications
router.get('/me/notifications', auth_1.authenticate, async (req, res) => {
    try {
        const { rows } = await db_1.db.query(`SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`, [req.user.userId]);
        (0, types_1.ok)(res, rows, 'Notifications retrieved');
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// PATCH /api/users/me/notifications/:id/read
router.patch('/me/notifications/:id/read', auth_1.authenticate, async (req, res) => {
    try {
        await db_1.db.query(`UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2`, [req.params.id, req.user.userId]);
        (0, types_1.ok)(res, null, 'Notification marked as read');
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// PATCH /api/users/me/notifications/read-all
router.patch('/me/notifications/read-all', auth_1.authenticate, async (req, res) => {
    try {
        await db_1.db.query(`UPDATE notifications SET is_read = true WHERE user_id = $1`, [req.user.userId]);
        (0, types_1.ok)(res, null, 'All notifications marked as read');
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
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
        const userRes = await db_1.db.query(`SELECT first_name, last_name FROM users WHERE id = $1`, [req.user.userId]);
        const requesterName = userRes.rows[0] ? `${userRes.rows[0].first_name} ${userRes.rows[0].last_name}` : 'Employee';
        // Notify all admins
        const admins = await db_1.db.query(`SELECT id FROM users WHERE role = 'admin'`);
        for (const admin of admins.rows) {
            await db_1.db.query(`INSERT INTO notifications (user_id, type, title, body)
         VALUES ($1, 'system', $2, $3)`, [
                admin.id,
                `New Support Ticket: ${subject}`,
                `Submitted by ${requesterName}:\n\n${message}`
            ]);
        }
        (0, types_1.ok)(res, null, 'Support ticket submitted to admin');
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// GET /api/users/:id
router.get('/:id', auth_1.authenticate, async (req, res) => {
    if (req.user?.role === 'employee' && req.user.userId !== req.params.id) {
        res.status(403).json({ success: false, message: 'Forbidden' });
        return;
    }
    try {
        const { rows } = await db_1.db.query(`${SELECT_USER} WHERE u.id = $1`, [req.params.id]);
        if (!rows[0]) {
            (0, types_1.notFound)(res, 'User not found');
            return;
        }
        (0, types_1.ok)(res, rows[0], 'User retrieved');
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
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
            res.status(409).json({ success: false, message: 'Email already exists' });
        }
        else {
            console.error(err);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }
});
// PUT /api/users/:id
router.put('/:id', auth_1.authenticate, async (req, res) => {
    if (req.user?.role === 'employee' && req.user.userId !== req.params.id) {
        res.status(403).json({ success: false, message: 'Forbidden' });
        return;
    }
    const allowed = ['first_name', 'last_name', 'phone', 'work_location', 'position', 'avatar_url'];
    if (req.user?.role === 'admin')
        allowed.push('status', 'role', 'department_id');
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
        const { rows } = await db_1.db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = $${params.length} RETURNING id, first_name, last_name, email, role`, params);
        if (!rows[0]) {
            (0, types_1.notFound)(res, 'User not found');
            return;
        }
        (0, types_1.ok)(res, rows[0], 'User updated');
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
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
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.default = router;
