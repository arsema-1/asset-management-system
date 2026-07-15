import { Router, Request, Response } from 'express';
import { db } from '../../database/db';
import { ok } from '../../shared/types';
import { authenticate, requireAdmin } from '../../middleware/auth';

const router = Router();

// GET /api/reports  — dashboard summary stats
router.get('/', authenticate, requireAdmin, async (_req, res: Response) => {
  try {
    const [assets, assignments, requests, maintenance, employees] = await Promise.all([
      db.query(`SELECT status, COUNT(*) AS count FROM assets GROUP BY status`),
      db.query(`SELECT status, COUNT(*) AS count FROM asset_assignments GROUP BY status`),
      db.query(`SELECT status, COUNT(*) AS count FROM asset_requests GROUP BY status`),
      db.query(`SELECT status, COUNT(*) AS count FROM maintenance_logs GROUP BY status`),
      db.query(`SELECT COUNT(*) AS count FROM users WHERE role = 'employee' AND status = 'active'`),
    ]);

    ok(res, {
      assets: assets.rows,
      assignments: assignments.rows,
      requests: requests.rows,
      maintenance: maintenance.rows,
      active_employees: parseInt(employees.rows[0]?.count ?? '0', 10),
    }, 'Reports retrieved');
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/reports/assets  — detailed asset breakdown
router.get('/assets', authenticate, requireAdmin, async (_req, res: Response) => {
  try {
    const { rows } = await db.query(`
      SELECT category, status, COUNT(*) AS count,
             SUM(purchase_cost) AS total_cost
      FROM assets
      GROUP BY category, status
      ORDER BY category, status
    `);
    ok(res, rows, 'Asset report retrieved');
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/reports/maintenance-costs
router.get('/maintenance-costs', authenticate, requireAdmin, async (_req, res: Response) => {
  try {
    const { rows } = await db.query(`
      SELECT DATE_TRUNC('month', created_at) AS month,
             SUM(cost) AS total_cost,
             COUNT(*) AS job_count
      FROM maintenance_logs
      WHERE created_at >= NOW() - INTERVAL '12 months'
      GROUP BY month
      ORDER BY month
    `);
    ok(res, rows, 'Maintenance cost report retrieved');
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
