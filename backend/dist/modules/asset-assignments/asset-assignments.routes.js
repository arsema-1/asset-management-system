"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../../database/db");
const types_1 = require("../../shared/types");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
const SELECT_ASSIGNMENT = `
  SELECT aa.*,
    json_build_object('id', a.id, 'name', a.name, 'asset_tag', a.asset_tag, 'category', a.category) AS asset,
    json_build_object('id', u.id, 'first_name', u.first_name, 'last_name', u.last_name, 'email', u.email) AS "user"
  FROM asset_assignments aa
  JOIN assets a ON aa.asset_id = a.id
  JOIN users u ON aa.user_id = u.id
`;
// GET /api/assignments
router.get('/', auth_1.authenticate, async (req, res) => {
    const { status } = req.query;
    const conditions = [];
    const params = [];
    if (req.user?.role === 'employee') {
        conditions.push(`aa.user_id = $${params.length + 1}`);
        params.push(req.user.userId);
    }
    if (status) {
        conditions.push(`aa.status = $${params.length + 1}`);
        params.push(status);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    try {
        const { rows } = await db_1.db.query(`${SELECT_ASSIGNMENT} ${where} ORDER BY aa.assigned_date DESC`, params);
        (0, types_1.ok)(res, rows, 'Assignments retrieved');
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// GET /api/assignments/:id
router.get('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { rows } = await db_1.db.query(`${SELECT_ASSIGNMENT} WHERE aa.id = $1`, [req.params.id]);
        if (!rows[0]) {
            (0, types_1.notFound)(res, 'Assignment not found');
            return;
        }
        (0, types_1.ok)(res, rows[0], 'Assignment retrieved');
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// POST /api/assignments
router.post('/', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    const { asset_id, user_id, expected_return_date, notes } = req.body;
    if (!asset_id || !user_id) {
        (0, types_1.badRequest)(res, 'asset_id and user_id are required');
        return;
    }
    const client = await db_1.db.connect();
    try {
        await client.query('BEGIN');
        const { rows } = await client.query(`INSERT INTO asset_assignments (asset_id, user_id, assigned_by, expected_return_date, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`, [asset_id, user_id, req.user.userId, expected_return_date ?? null, notes ?? null]);
        await client.query(`UPDATE assets SET status = 'assigned' WHERE id = $1`, [asset_id]);
        await client.query(`INSERT INTO activities (user_id, asset_id, action, description)
       VALUES ($1, $2, 'asset_assigned', 'Asset assigned to employee')`, [req.user.userId, asset_id]);
        await client.query('COMMIT');
        (0, types_1.created)(res, rows[0], 'Assignment created');
    }
    catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
    finally {
        client.release();
    }
});
// PUT /api/assignments/:id
router.put('/:id', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    const { status, actual_return_date, notes } = req.body;
    const updates = [];
    const params = [];
    if (status !== undefined) {
        updates.push(`status = $${params.length + 1}`);
        params.push(status);
    }
    if (actual_return_date !== undefined) {
        updates.push(`actual_return_date = $${params.length + 1}`);
        params.push(actual_return_date);
    }
    if (notes !== undefined) {
        updates.push(`notes = $${params.length + 1}`);
        params.push(notes);
    }
    if (!updates.length) {
        (0, types_1.badRequest)(res, 'No fields to update');
        return;
    }
    params.push(req.params.id);
    const client = await db_1.db.connect();
    try {
        await client.query('BEGIN');
        const { rows } = await client.query(`UPDATE asset_assignments SET ${updates.join(', ')} WHERE id = $${params.length} RETURNING *`, params);
        if (!rows[0]) {
            (0, types_1.notFound)(res, 'Assignment not found');
            return;
        }
        // If returned, mark asset available and log activity
        if (status === 'returned') {
            await client.query(`UPDATE assets SET status = 'available' WHERE id = $1`, [rows[0].asset_id]);
            await client.query(`INSERT INTO activities (user_id, asset_id, action, description)
         VALUES ($1, $2, 'asset_returned', 'Asset returned by employee')`, [req.user.userId, rows[0].asset_id]);
            // Update any corresponding pending return request
            await client.query(`UPDATE asset_returns 
         SET status = 'completed', processed_by = $1, return_date = CURRENT_DATE 
         WHERE assignment_id = $2 AND status = 'pending'`, [req.user.userId, rows[0].id]);
        }
        await client.query('COMMIT');
        (0, types_1.ok)(res, rows[0], 'Assignment updated');
    }
    catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
    finally {
        client.release();
    }
});
exports.default = router;
