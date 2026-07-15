"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../../database/db");
const types_1 = require("../../shared/types");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/reports  — dashboard summary stats
router.get('/', auth_1.authenticate, auth_1.requireAdmin, async (_req, res) => {
    try {
        const [assets, assignments, requests, maintenance, employees] = await Promise.all([
            db_1.db.query(`SELECT status, COUNT(*) AS count FROM assets GROUP BY status`),
            db_1.db.query(`SELECT status, COUNT(*) AS count FROM asset_assignments GROUP BY status`),
            db_1.db.query(`SELECT status, COUNT(*) AS count FROM asset_requests GROUP BY status`),
            db_1.db.query(`SELECT status, COUNT(*) AS count FROM maintenance_logs GROUP BY status`),
            db_1.db.query(`SELECT COUNT(*) AS count FROM users WHERE role = 'employee' AND status = 'active'`),
        ]);
        (0, types_1.ok)(res, {
            assets: assets.rows,
            assignments: assignments.rows,
            requests: requests.rows,
            maintenance: maintenance.rows,
            active_employees: parseInt(employees.rows[0]?.count ?? '0', 10),
        }, 'Reports retrieved');
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// GET /api/reports/assets  — detailed asset breakdown
router.get('/assets', auth_1.authenticate, auth_1.requireAdmin, async (_req, res) => {
    try {
        const { rows } = await db_1.db.query(`
      SELECT category, status, COUNT(*) AS count,
             SUM(purchase_cost) AS total_cost
      FROM assets
      GROUP BY category, status
      ORDER BY category, status
    `);
        (0, types_1.ok)(res, rows, 'Asset report retrieved');
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// GET /api/reports/maintenance-costs
router.get('/maintenance-costs', auth_1.authenticate, auth_1.requireAdmin, async (_req, res) => {
    try {
        const { rows } = await db_1.db.query(`
      SELECT DATE_TRUNC('month', created_at) AS month,
             SUM(cost) AS total_cost,
             COUNT(*) AS job_count
      FROM maintenance_logs
      WHERE created_at >= NOW() - INTERVAL '12 months'
      GROUP BY month
      ORDER BY month
    `);
        (0, types_1.ok)(res, rows, 'Maintenance cost report retrieved');
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.default = router;
