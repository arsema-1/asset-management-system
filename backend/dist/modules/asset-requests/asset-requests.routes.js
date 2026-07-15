"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../../database/db");
const types_1 = require("../../shared/types");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
const SELECT_REQUEST = `
  SELECT ar.*,
    json_build_object('id', u.id, 'first_name', u.first_name, 'last_name', u.last_name) AS requested_by_user
  FROM asset_requests ar
  JOIN users u ON ar.requested_by = u.id
`;
// GET /api/requests
router.get('/', auth_1.authenticate, async (req, res) => {
    const { status } = req.query;
    const conditions = [];
    const params = [];
    if (req.user?.role === 'employee') {
        conditions.push(`ar.requested_by = $${params.length + 1}`);
        params.push(req.user.userId);
    }
    if (status) {
        conditions.push(`ar.status = $${params.length + 1}`);
        params.push(status);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    try {
        const { rows } = await db_1.db.query(`${SELECT_REQUEST} ${where} ORDER BY ar.created_at DESC`, params);
        (0, types_1.ok)(res, rows, 'Requests retrieved');
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// GET /api/requests/:id
router.get('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { rows } = await db_1.db.query(`${SELECT_REQUEST} WHERE ar.id = $1`, [req.params.id]);
        if (!rows[0]) {
            (0, types_1.notFound)(res, 'Request not found');
            return;
        }
        if (req.user?.role === 'employee' && rows[0].requested_by !== req.user.userId) {
            res.status(403).json({ success: false, message: 'Forbidden' });
            return;
        }
        (0, types_1.ok)(res, rows[0], 'Request retrieved');
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// POST /api/requests
router.post('/', auth_1.authenticate, async (req, res) => {
    const { asset_name, asset_id, category, reason } = req.body;
    if (!asset_name || !reason) {
        (0, types_1.badRequest)(res, 'asset_name and reason are required');
        return;
    }
    try {
        const { rows } = await db_1.db.query(`INSERT INTO asset_requests (requested_by, asset_name, category, reason)
       VALUES ($1, $2, $3, $4) RETURNING *`, [req.user.userId, asset_name, category ?? null, reason]);
        const insertedRequest = rows[0];
        // Log activity
        await db_1.db.query(`INSERT INTO activities (user_id, asset_id, action, description)
       VALUES ($1, $2, 'request_submitted', $3)`, [req.user.userId, asset_id ?? null, `Requested: ${asset_name}`]);
        // Get requester name
        const userRes = await db_1.db.query(`SELECT first_name, last_name FROM users WHERE id = $1`, [req.user.userId]);
        const requesterName = userRes.rows[0] ? `${userRes.rows[0].first_name} ${userRes.rows[0].last_name}` : 'Employee';
        // Notify all admins
        const admins = await db_1.db.query(`SELECT id FROM users WHERE role = 'admin'`);
        for (const admin of admins.rows) {
            await db_1.db.query(`INSERT INTO notifications (user_id, type, title, body, reference_id)
         VALUES ($1, 'request', $2, $3, $4)`, [
                admin.id,
                'New Asset Request',
                `${requesterName} requested asset: "${asset_name}" (${category ?? 'other'}).`,
                insertedRequest.id
            ]);
        }
        (0, types_1.created)(res, insertedRequest, 'Request submitted');
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// PUT /api/requests/:id
router.put('/:id', auth_1.authenticate, async (req, res) => {
    const { status, admin_comment } = req.body;
    const updates = [];
    const params = [];
    const adminOnlyStatuses = ['approved', 'rejected', 'completed'];
    if (status && adminOnlyStatuses.includes(status) && req.user?.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Only admins can approve or reject requests' });
        return;
    }
    if (status) {
        updates.push(`status = $${params.length + 1}`);
        params.push(status);
    }
    if (admin_comment !== undefined) {
        updates.push(`admin_comment = $${params.length + 1}`);
        params.push(admin_comment);
    }
    if (status && adminOnlyStatuses.includes(status)) {
        updates.push(`reviewed_by = $${params.length + 1}`);
        params.push(req.user.userId);
        updates.push(`reviewed_at = NOW()`);
    }
    if (!updates.length) {
        (0, types_1.badRequest)(res, 'No fields to update');
        return;
    }
    params.push(req.params.id);
    try {
        const { rows } = await db_1.db.query(`UPDATE asset_requests SET ${updates.join(', ')} WHERE id = $${params.length} RETURNING *`, params);
        if (!rows[0]) {
            (0, types_1.notFound)(res, 'Request not found');
            return;
        }
        const updated = rows[0];
        // Send notification to the employee when admin approves or rejects
        if (status === 'approved' || status === 'rejected') {
            const notifTitle = status === 'approved'
                ? `Your request for "${updated.asset_name}" was approved`
                : `Your request for "${updated.asset_name}" was rejected`;
            const notifBody = admin_comment
                ? `Admin comment: ${admin_comment}`
                : status === 'approved'
                    ? 'Your request has been approved. Please check with IT for pickup details.'
                    : 'Your request was not approved at this time.';
            await db_1.db.query(`INSERT INTO notifications (user_id, type, title, body, reference_id)
         VALUES ($1, 'request', $2, $3, $4)`, [updated.requested_by, notifTitle, notifBody, updated.id]);
        }
        (0, types_1.ok)(res, updated, 'Request updated');
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// DELETE /api/requests/:id
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const check = await db_1.db.query(`SELECT requested_by FROM asset_requests WHERE id = $1`, [req.params.id]);
        if (!check.rows[0]) {
            (0, types_1.notFound)(res, 'Request not found');
            return;
        }
        if (req.user?.role === 'employee' && check.rows[0].requested_by !== req.user.userId) {
            res.status(403).json({ success: false, message: 'Forbidden' });
            return;
        }
        await db_1.db.query(`DELETE FROM asset_requests WHERE id = $1`, [req.params.id]);
        (0, types_1.ok)(res, null, 'Request deleted');
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.default = router;
