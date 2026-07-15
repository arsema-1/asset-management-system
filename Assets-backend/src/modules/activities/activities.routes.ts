import { Router, Request, Response } from 'express';
import { db } from '../../database/db';
import { ok, notFound } from '../../shared/types';
import { authenticate, requireAdmin } from '../../middleware/auth';

const router = Router();

// GET /api/activities
router.get('/', authenticate, async (req: Request, res: Response) => {
  const { limit = '50', asset_id } = req.query as Record<string, string>;
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (req.user?.role === 'employee') {
    conditions.push(`ac.user_id = $${params.length + 1}`);
    params.push(req.user.userId);
  }
  if (asset_id) { conditions.push(`ac.asset_id = $${params.length + 1}`); params.push(asset_id); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  params.push(parseInt(limit, 10));

  try {
    const { rows } = await db.query(
      `SELECT ac.*,
         json_build_object('id', u.id, 'first_name', u.first_name, 'last_name', u.last_name) AS actor,
         CASE WHEN a.id IS NOT NULL
           THEN json_build_object('id', a.id, 'name', a.name, 'asset_tag', a.asset_tag)
           ELSE NULL
         END AS asset
       FROM activities ac
       LEFT JOIN users u ON ac.user_id = u.id
       LEFT JOIN assets a ON ac.asset_id = a.id
       ${where} ORDER BY ac.created_at DESC LIMIT $${params.length}`,
      params
    );
    ok(res, rows, 'Activities retrieved');
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/activities/:id
router.get('/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { rows } = await db.query(`SELECT * FROM activities WHERE id = $1`, [req.params.id]);
    if (!rows[0]) { notFound(res, 'Activity not found'); return; }
    ok(res, rows[0], 'Activity retrieved');
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/activities/:id
router.delete('/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { rowCount } = await db.query(`DELETE FROM activities WHERE id = $1`, [req.params.id]);
    if (!rowCount) { notFound(res, 'Activity not found'); return; }
    ok(res, null, 'Activity deleted');
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
