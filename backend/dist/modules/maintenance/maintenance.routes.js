"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../../database/db");
const types_1 = require("../../shared/types");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
const SELECT_MAINTENANCE = `
  SELECT ml.*,
    json_build_object('id', a.id, 'name', a.name, 'asset_tag', a.asset_tag) AS asset,
    CASE WHEN t.id IS NOT NULL
      THEN json_build_object('id', t.id, 'first_name', t.first_name, 'last_name', t.last_name)
      ELSE NULL
    END AS technician
  FROM maintenance_logs ml
  JOIN assets a ON ml.asset_id = a.id
  LEFT JOIN users t ON ml.technician_id = t.id
`;
// GET /api/maintenance
router.get('/', auth_1.authenticate, async (req, res) => {
    const { status, asset_id } = req.query;
    const conditions = [];
    const params = [];
    if (status) {
        conditions.push(`ml.status = $${params.length + 1}`);
        params.push(status);
    }
    if (asset_id) {
        conditions.push(`ml.asset_id = $${params.length + 1}`);
        params.push(asset_id);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    try {
        const { rows } = await db_1.db.query(`${SELECT_MAINTENANCE} ${where} ORDER BY ml.created_at DESC`, params);
        (0, types_1.ok)(res, rows, 'Maintenance logs retrieved');
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// GET /api/maintenance/:id
router.get('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { rows } = await db_1.db.query(`${SELECT_MAINTENANCE} WHERE ml.id = $1`, [req.params.id]);
        if (!rows[0]) {
            (0, types_1.notFound)(res, 'Maintenance log not found');
            return;
        }
        (0, types_1.ok)(res, rows[0], 'Maintenance log retrieved');
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// POST /api/maintenance
router.post('/', auth_1.authenticate, async (req, res) => {
    const { asset_id, type, description, technician_id, cost, scheduled_date } = req.body;
    if (!asset_id || !type || !description) {
        (0, types_1.badRequest)(res, 'asset_id, type, and description are required');
        return;
    }
    if (req.user?.role === 'employee') {
        // Verify the asset is assigned to the current employee
        try {
            const check = await db_1.db.query(`SELECT aa.id, a.name, a.asset_tag 
         FROM asset_assignments aa 
         JOIN assets a ON aa.asset_id = a.id 
         WHERE aa.asset_id = $1 AND aa.user_id = $2 AND aa.status = 'active'`, [asset_id, req.user.userId]);
            if (!check.rows[0]) {
                res.status(403).json({ success: false, message: 'You can only report issues for assets assigned to you' });
                return;
            }
            const assetName = check.rows[0].name;
            const assetTag = check.rows[0].asset_tag;
            // Get employee's name
            const userRes = await db_1.db.query(`SELECT first_name, last_name FROM users WHERE id = $1`, [req.user.userId]);
            const reporterName = userRes.rows[0] ? `${userRes.rows[0].first_name} ${userRes.rows[0].last_name}` : 'Employee';
            const client = await db_1.db.connect();
            try {
                await client.query('BEGIN');
                const { rows } = await client.query(`INSERT INTO maintenance_logs (asset_id, reported_by, technician_id, type, description, cost, scheduled_date)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`, [asset_id, req.user.userId, null, type, description, 0, null]);
                await client.query(`UPDATE assets SET status = 'in_repair' WHERE id = $1`, [asset_id]);
                // Send notification to all admin users
                const admins = await client.query(`SELECT id FROM users WHERE role = 'admin'`);
                for (const admin of admins.rows) {
                    await client.query(`INSERT INTO notifications (user_id, type, title, body, reference_id)
             VALUES ($1, 'maintenance', $2, $3, $4)`, [
                        admin.id,
                        'Asset Issue Reported',
                        `${reporterName} reported an issue with "${assetName}" (${assetTag}): ${description}`,
                        rows[0].id
                    ]);
                }
                // Log activity
                await client.query(`INSERT INTO activities (user_id, asset_id, action, description)
           VALUES ($1, $2, 'maintenance_reported', $3)`, [req.user.userId, asset_id, `Reported maintenance issue for: ${assetName}`]);
                await client.query('COMMIT');
                (0, types_1.created)(res, rows[0], 'Maintenance issue reported to admin');
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
        return;
    }
    // Admin User flow
    const client = await db_1.db.connect();
    try {
        await client.query('BEGIN');
        const { rows } = await client.query(`INSERT INTO maintenance_logs (asset_id, reported_by, technician_id, type, description, cost, scheduled_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`, [asset_id, req.user.userId, technician_id ?? null, type, description, cost ?? 0, scheduled_date ?? null]);
        await client.query(`UPDATE assets SET status = 'in_repair' WHERE id = $1`, [asset_id]);
        await client.query('COMMIT');
        (0, types_1.created)(res, rows[0], 'Maintenance log created');
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
// PUT /api/maintenance/:id
router.put('/:id', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    const allowed = ['status', 'technician_id', 'cost', 'scheduled_date', 'completed_date', 'description'];
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
    const client = await db_1.db.connect();
    try {
        await client.query('BEGIN');
        const { rows } = await client.query(`UPDATE maintenance_logs SET ${updates.join(', ')} WHERE id = $${params.length} RETURNING *`, params);
        if (!rows[0]) {
            (0, types_1.notFound)(res, 'Maintenance log not found');
            return;
        }
        // If completed, mark asset available again
        if (req.body.status === 'completed') {
            await client.query(`UPDATE assets SET status = 'available' WHERE id = $1`, [rows[0].asset_id]);
        }
        await client.query('COMMIT');
        (0, types_1.ok)(res, rows[0], 'Maintenance log updated');
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
// DELETE /api/maintenance/:id
router.delete('/:id', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { rowCount } = await db_1.db.query(`DELETE FROM maintenance_logs WHERE id = $1`, [req.params.id]);
        if (!rowCount) {
            (0, types_1.notFound)(res, 'Maintenance log not found');
            return;
        }
        (0, types_1.ok)(res, null, 'Maintenance log deleted');
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.default = router;
