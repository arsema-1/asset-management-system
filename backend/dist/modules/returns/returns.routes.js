"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../../database/db");
const types_1 = require("../../shared/types");
const auth_1 = require("../../middleware/auth");
const utils_1 = require("../../shared/utils");
const router = (0, express_1.Router)();
// POST /api/returns - Employee requests to return an asset
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
        // Check if there's already a pending return for this assignment
        const existingReturn = await db_1.db.query(`SELECT id FROM asset_returns WHERE assignment_id = $1 AND status = 'pending'`, [assignment_id]);
        if (existingReturn.rows[0]) {
            (0, types_1.badRequest)(res, 'A return request is already pending for this assignment');
            return;
        }
        const requesterId = req.user.userId;
        await (0, utils_1.withTransaction)(async (client) => {
            // Create return record with status 'pending'
            const { rows } = await client.query(`INSERT INTO asset_returns (assignment_id, requested_by, condition_on_return, return_notes, status, return_date)
         VALUES ($1, $2, $3, $4, 'pending', $5) RETURNING *`, [
                assignment_id,
                requesterId,
                condition_on_return ?? null,
                return_notes ?? null,
                return_date ?? new Date().toISOString().split('T')[0]
            ]);
            // IMPORTANT: Asset status remains 'assigned' while return is pending
            // The employee still possesses the asset until the admin approves
            // Get requester name
            const requesterName = await (0, utils_1.getFullName)(client, requesterId);
            // Notify admins about the return request
            await (0, utils_1.notifyAdmins)(client, {
                type: 'return',
                title: 'Asset Return Requested',
                body: `${requesterName} requested to return asset "${assignment.asset_name}" (${assignment.asset_tag}).`,
                referenceId: rows[0].id,
            });
            // Log activity
            await (0, utils_1.logActivity)(client, {
                userId: requesterId,
                assetId: assignment.asset_id,
                action: 'return_requested',
                description: `${requesterName} requested to return: ${assignment.asset_name} (${assignment.asset_tag})`,
            });
            (0, types_1.created)(res, rows[0], 'Return request submitted successfully. Asset remains assigned until admin approval.');
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// GET /api/returns - View return requests
router.get('/', auth_1.authenticate, async (req, res) => {
    const { status } = req.query;
    try {
        const conditions = [];
        const params = [];
        if (status) {
            conditions.push(`r.status = $${params.length + 1}`);
            params.push(status);
        }
        // Employees can only see their own return requests
        if (req.user?.role === 'employee') {
            conditions.push(`r.requested_by = $${params.length + 1}`);
            params.push(req.user.userId);
        }
        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        const { rows } = await db_1.db.query(`SELECT r.*,
         json_build_object('id', u.id, 'first_name', u.first_name, 'last_name', u.last_name, 'email', u.email) AS requested_by_user,
         json_build_object('id', a.id, 'name', a.name, 'asset_tag', a.asset_tag, 'category', a.category) AS asset,
         json_build_object('id', aa.id, 'assigned_date', aa.assigned_date, 'status', aa.status) AS assignment,
         CASE WHEN r.processed_by IS NOT NULL
           THEN json_build_object('id', p.id, 'first_name', p.first_name, 'last_name', p.last_name)
           ELSE NULL
         END AS processed_by_user
       FROM asset_returns r
       JOIN users u ON r.requested_by = u.id
       JOIN asset_assignments aa ON r.assignment_id = aa.id
       JOIN assets a ON aa.asset_id = a.id
       LEFT JOIN users p ON r.processed_by = p.id
       ${where}
       ORDER BY r.created_at DESC`, params);
        (0, types_1.ok)(res, rows, 'Return requests retrieved');
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// GET /api/returns/:id
router.get('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { rows } = await db_1.db.query(`SELECT r.*,
         json_build_object('id', u.id, 'first_name', u.first_name, 'last_name', u.last_name, 'email', u.email) AS requested_by_user,
         json_build_object('id', a.id, 'name', a.name, 'asset_tag', a.asset_tag, 'category', a.category) AS asset,
         json_build_object('id', aa.id, 'assigned_date', aa.assigned_date, 'status', aa.status) AS assignment,
         CASE WHEN r.processed_by IS NOT NULL
           THEN json_build_object('id', p.id, 'first_name', p.first_name, 'last_name', p.last_name)
           ELSE NULL
         END AS processed_by_user
       FROM asset_returns r
       JOIN users u ON r.requested_by = u.id
       JOIN asset_assignments aa ON r.assignment_id = aa.id
       JOIN assets a ON aa.asset_id = a.id
       LEFT JOIN users p ON r.processed_by = p.id
       WHERE r.id = $1`, [req.params.id]);
        if (!rows[0]) {
            (0, types_1.notFound)(res, 'Return request not found');
            return;
        }
        // Employees can only see their own return requests
        if (req.user?.role === 'employee' && rows[0].requested_by !== req.user.userId) {
            res.status(403).json({ success: false, message: 'Access denied' });
            return;
        }
        (0, types_1.ok)(res, rows[0], 'Return request retrieved');
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// PUT /api/returns/:id - Admin approves or rejects a return request
router.put('/:id', auth_1.authenticate, async (req, res) => {
    if (req.user?.role !== 'admin') {
        res.status(403).json({ success: false, message: 'Admin access required' });
        return;
    }
    const { status, admin_comment, condition_on_return } = req.body;
    if (!status || !['approved', 'rejected'].includes(status)) {
        (0, types_1.badRequest)(res, 'Status must be either "approved" or "rejected"');
        return;
    }
    // Cast to string since Express body-parser can return string[] for query params
    const adminComment = String(admin_comment ?? '');
    const conditionOnReturn = condition_on_return ? String(condition_on_return) : null;
    try {
        // Get the return request with related data
        const returnRes = await db_1.db.query(`SELECT r.*, aa.asset_id, aa.id AS assignment_id, aa.status AS assignment_status,
              a.name AS asset_name, a.asset_tag, a.status AS asset_status,
              u.id AS employee_id, u.first_name, u.last_name
       FROM asset_returns r
       JOIN asset_assignments aa ON r.assignment_id = aa.id
       JOIN assets a ON aa.asset_id = a.id
       JOIN users u ON r.requested_by = u.id
       WHERE r.id = $1 AND r.status = 'pending'`, [req.params.id]);
        if (!returnRes.rows[0]) {
            (0, types_1.notFound)(res, 'Pending return request not found');
            return;
        }
        const returnReq = returnRes.rows[0];
        const returnId = req.params.id;
        await (0, utils_1.withTransaction)(async (client) => {
            if (status === 'approved') {
                // ── APPROVE RETURN ──────────────────────────────────────
                // 1. Update return record status to 'received', record who processed it, update condition if provided
                const returnUpdateFields = [
                    `status = 'received'`,
                    `processed_by = $1`,
                    `return_date = CURRENT_DATE`
                ];
                const returnUpdateParams = [req.user.userId];
                if (adminComment) {
                    returnUpdateFields.push(`return_notes = $${returnUpdateParams.length + 1}`);
                    returnUpdateParams.push(adminComment);
                }
                if (conditionOnReturn) {
                    returnUpdateFields.push(`condition_on_return = $${returnUpdateParams.length + 1}`);
                    returnUpdateParams.push(conditionOnReturn);
                }
                returnUpdateParams.push(returnId);
                await client.query(`UPDATE asset_returns
           SET ${returnUpdateFields.join(', ')}
           WHERE id = $${returnUpdateParams.length}`, returnUpdateParams);
                // 2. Close the active assignment
                await client.query(`UPDATE asset_assignments
           SET status = 'returned', actual_return_date = CURRENT_DATE
           WHERE id = $1 AND status = 'active'`, [returnReq.assignment_id]);
                // 3. Update asset status back to 'available' and condition if provided
                if (conditionOnReturn) {
                    await client.query(`UPDATE assets SET status = 'available', condition = $1 WHERE id = $2`, [conditionOnReturn, returnReq.asset_id]);
                }
                else {
                    await client.query(`UPDATE assets SET status = 'available' WHERE id = $1`, [returnReq.asset_id]);
                }
                // 4. Notify the employee that their return was approved
                await (0, utils_1.notifyUser)(client, {
                    userId: returnReq.employee_id,
                    type: 'return',
                    title: 'Asset Return Approved',
                    body: `Your return request for "${returnReq.asset_name}" (${returnReq.asset_tag}) has been approved. The asset is now marked as available.`,
                    referenceId: returnId,
                });
                // 5. Log the approval activity
                await (0, utils_1.logActivity)(client, {
                    userId: req.user.userId,
                    assetId: returnReq.asset_id,
                    action: 'return_approved',
                    description: `Return approved: "${returnReq.asset_name}" (${returnReq.asset_tag}) returned by ${returnReq.first_name} ${returnReq.last_name}`,
                });
                (0, types_1.ok)(res, {
                    id: returnId,
                    status: 'received',
                    message: 'Return approved. Asset marked as available. Assignment closed.',
                }, 'Return approved successfully');
            }
            else {
                // ── REJECT RETURN ───────────────────────────────────────
                // 1. Update return record status to 'rejected'
                await client.query(`UPDATE asset_returns
           SET status = 'rejected', processed_by = $1, return_notes = COALESCE($2, return_notes)
           WHERE id = $3`, [req.user.userId, adminComment || null, returnId]);
                // 2. Asset status stays 'assigned' - employee still has it
                // 3. Assignment stays 'active' - no changes needed
                // 4. Update asset condition if provided by admin
                if (conditionOnReturn) {
                    await client.query(`UPDATE assets SET condition = $1 WHERE id = $2`, [conditionOnReturn, returnReq.asset_id]);
                }
                // 5. Notify the employee that their return was rejected
                const rejectionReason = adminComment
                    ? ` Reason: ${adminComment}`
                    : '';
                await (0, utils_1.notifyUser)(client, {
                    userId: returnReq.employee_id,
                    type: 'return',
                    title: 'Asset Return Rejected',
                    body: `Your return request for "${returnReq.asset_name}" (${returnReq.asset_tag}) was not approved.${rejectionReason} The asset remains assigned to you.`,
                    referenceId: returnId,
                });
                // 5. Log the rejection activity
                await (0, utils_1.logActivity)(client, {
                    userId: req.user.userId,
                    assetId: returnReq.asset_id,
                    action: 'return_rejected',
                    description: `Return rejected: "${returnReq.asset_name}" (${returnReq.asset_tag}) - ${adminComment || 'No reason provided'}`,
                });
                (0, types_1.ok)(res, {
                    id: returnId,
                    status: 'rejected',
                    message: `Return request rejected. Asset remains assigned to employee.`,
                }, 'Return rejected');
            }
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.default = router;
