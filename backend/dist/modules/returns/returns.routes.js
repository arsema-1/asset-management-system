"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../../database/db");
const types_1 = require("../../shared/types");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
// POST /api/returns - Request to return an asset
router.post('/', auth_1.authenticate, async (req, res) => {
    const { assignment_id, condition_on_return, return_notes, return_date } = req.body;
    if (!assignment_id) {
        (0, types_1.badRequest)(res, 'assignment_id is required');
        return;
    }
    try {
        // Verify assignment exists and is active
        const aaRes = await db_1.db.query(`SELECT aa.*, a.name AS asset_name, a.asset_tag, a.id AS asset_id
       FROM asset_assignments aa
       JOIN assets a ON aa.asset_id = a.id
       WHERE aa.id = $1 AND aa.status = 'active'`, [assignment_id]);
        if (!aaRes.rows[0]) {
            (0, types_1.notFound)(res, 'Active assignment not found');
            return;
        }
        const assignment = aaRes.rows[0];
        // If employee, they can only return their own assigned asset
        if (req.user?.role === 'employee' && assignment.user_id !== req.user.userId) {
            res.status(403).json({ success: false, message: 'You can only request return for your own assigned assets' });
            return;
        }
        const requesterId = req.user.userId;
        const client = await db_1.db.connect();
        try {
            await client.query('BEGIN');
            // Create return record
            const { rows } = await client.query(`INSERT INTO asset_returns (assignment_id, requested_by, condition_on_return, return_notes, status, return_date)
         VALUES ($1, $2, $3, $4, 'pending', $5) RETURNING *`, [
                assignment_id,
                requesterId,
                condition_on_return ?? null,
                return_notes ?? null,
                return_date ?? new Date().toISOString().split('T')[0]
            ]);
            // Update asset status to pending_return
            await client.query(`UPDATE assets SET status = 'pending_return' WHERE id = $1`, [assignment.asset_id]);
            // Update assignment status? We keep assignment active but asset status pending_return.
            // Wait, in returns page, the employee wants to see their assets that are not returned, but if it is pending return, it should show 'Pending Return' status.
            // Yes, MyAssetCard maps pending_return to a different badge correctly.
            // Get requester user name
            const userRes = await client.query(`SELECT first_name, last_name FROM users WHERE id = $1`, [requesterId]);
            const requesterName = userRes.rows[0] ? `${userRes.rows[0].first_name} ${userRes.rows[0].last_name}` : 'Employee';
            // Notify admins
            const admins = await client.query(`SELECT id FROM users WHERE role = 'admin'`);
            for (const admin of admins.rows) {
                await client.query(`INSERT INTO notifications (user_id, type, title, body, reference_id)
           VALUES ($1, 'return', $2, $3, $4)`, [
                    admin.id,
                    'Asset Return Requested',
                    `${requesterName} requested to return asset "${assignment.asset_name}" (${assignment.asset_tag}).`,
                    rows[0].id
                ]);
            }
            // Log activity
            await client.query(`INSERT INTO activities (user_id, asset_id, action, description)
         VALUES ($1, $2, 'asset_return_requested', $3)`, [requesterId, assignment.asset_id, `Requested return for asset: ${assignment.asset_name}`]);
            await client.query('COMMIT');
            (0, types_1.created)(res, rows[0], 'Return request submitted successfully');
        }
        catch (err) {
            await client.query('ROLLBACK');
            console.error(err);
            res.status(500).json({ success: false, message: 'Server error' });
        }
        finally {
            client.release();
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// GET /api/returns - View return requests (Admin only)
router.get('/', auth_1.authenticate, async (req, res) => {
    if (req.user?.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Admin access required' });
        return;
    }
    try {
        const { rows } = await db_1.db.query(`SELECT r.*,
         json_build_object('id', u.id, 'first_name', u.first_name, 'last_name', u.last_name) AS requested_by_user,
         json_build_object('id', a.id, 'name', a.name, 'asset_tag', a.asset_tag) AS asset
       FROM asset_returns r
       JOIN users u ON r.requested_by = u.id
       JOIN asset_assignments aa ON r.assignment_id = aa.id
       JOIN assets a ON aa.asset_id = a.id
       ORDER BY r.created_at DESC`);
        (0, types_1.ok)(res, rows, 'Return requests retrieved');
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.default = router;
