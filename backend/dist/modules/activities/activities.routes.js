"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../../database/db");
const types_1 = require("../../shared/types");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/activities
router.get('/', auth_1.authenticate, async (req, res) => {
    const { limit = '50', asset_id } = req.query;
    const conditions = [];
    const params = [];
    if (req.user?.role === 'employee') {
        conditions.push(`ac.user_id = $${params.length + 1}`);
        params.push(req.user.userId);
    }
    if (asset_id) {
        conditions.push(`ac.asset_id = $${params.length + 1}`);
        params.push(asset_id);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    params.push(parseInt(limit, 10));
    try {
        const { rows } = await db_1.db.query(`SELECT ac.*,
         json_build_object('id', u.id, 'first_name', u.first_name, 'last_name', u.last_name) AS actor,
         CASE WHEN a.id IS NOT NULL
           THEN json_build_object('id', a.id, 'name', a.name, 'asset_tag', a.asset_tag)
           ELSE NULL
         END AS asset
       FROM activities ac
       LEFT JOIN users u ON ac.user_id = u.id
       LEFT JOIN assets a ON ac.asset_id = a.id
       ${where} ORDER BY ac.created_at DESC LIMIT $${params.length}`, params);
        (0, types_1.ok)(res, rows, 'Activities retrieved');
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// GET /api/activities/:id
router.get('/:id', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { rows } = await db_1.db.query(`SELECT * FROM activities WHERE id = $1`, [req.params.id]);
        if (!rows[0]) {
            (0, types_1.notFound)(res, 'Activity not found');
            return;
        }
        (0, types_1.ok)(res, rows[0], 'Activity retrieved');
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// DELETE /api/activities/:id
router.delete('/:id', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { rowCount } = await db_1.db.query(`DELETE FROM activities WHERE id = $1`, [req.params.id]);
        if (!rowCount) {
            (0, types_1.notFound)(res, 'Activity not found');
            return;
        }
        (0, types_1.ok)(res, null, 'Activity deleted');
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.default = router;
