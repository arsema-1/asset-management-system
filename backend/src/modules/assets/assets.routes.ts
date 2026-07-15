import { Router, Request, Response } from 'express';
import { db } from '../../database/db';
import { ok, created, notFound, badRequest } from '../../shared/types';
import { authenticate, requireAdmin } from '../../middleware/auth';

const router = Router();

// GET /api/assets
router.get('/', authenticate, async (req: Request, res: Response) => {
  const { status, category, search } = req.query as Record<string, string>;
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (status) { conditions.push(`a.status = $${params.length + 1}`); params.push(status); }
  if (category) { conditions.push(`a.category = $${params.length + 1}`); params.push(category); }
  if (search) { conditions.push(`a.name ILIKE $${params.length + 1}`); params.push(`%${search}%`); }

  // If employee: only show assets assigned to them, unless querying for available assets
  if (req.user?.role === 'employee') {
    if (status !== 'available') {
      conditions.push(
        `a.id IN (SELECT asset_id FROM asset_assignments WHERE user_id = $${params.length + 1} AND status = 'active')`
      );
      params.push(req.user.userId);
    }
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  try {
    const { rows } = await db.query(
      `SELECT a.* FROM assets a ${where} ORDER BY a.created_at DESC`,
      params
    );
    ok(res, rows, 'Assets retrieved');
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/assets/:id
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { rows } = await db.query(`SELECT * FROM assets WHERE id = $1`, [req.params.id]);
    if (!rows[0]) { notFound(res, 'Asset not found'); return; }
    ok(res, rows[0], 'Asset retrieved');
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/assets
router.post('/', authenticate, requireAdmin, async (req: Request, res: Response) => {
  const { name, asset_tag, serial_number, category, status, condition,
          purchase_date, purchase_cost, warranty_expiry, vendor, location, description } = req.body;
  if (!name || !asset_tag || !category) {
    badRequest(res, 'name, asset_tag, and category are required');
    return;
  }
  try {
    const { rows } = await db.query(
      `INSERT INTO assets (name, asset_tag, serial_number, category, status, condition,
        purchase_date, purchase_cost, warranty_expiry, vendor, location, description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [name, asset_tag, serial_number ?? null, category, status ?? 'available',
       condition ?? 'good', purchase_date ?? null, purchase_cost ?? null,
       warranty_expiry ?? null, vendor ?? null, location ?? null, description ?? null]
    );
    created(res, rows[0], 'Asset created');
  } catch (err: unknown) {
    const pg = err as { code?: string };
    if (pg.code === '23505') {
      res.status(409).json({ success: false, message: 'Asset tag already exists' });
    } else {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
});

// PUT /api/assets/:id
router.put('/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  const fields = ['name','asset_tag','serial_number','category','status','condition',
                  'purchase_date','purchase_cost','warranty_expiry','vendor','location','description'];
  const updates: string[] = [];
  const params: unknown[] = [];
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = $${params.length + 1}`);
      params.push(req.body[f]);
    }
  }
  if (!updates.length) { badRequest(res, 'No fields to update'); return; }
  params.push(req.params.id);
  try {
    const { rows } = await db.query(
      `UPDATE assets SET ${updates.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    if (!rows[0]) { notFound(res, 'Asset not found'); return; }
    ok(res, rows[0], 'Asset updated');
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/assets/:id
router.delete('/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { rowCount } = await db.query(`DELETE FROM assets WHERE id = $1`, [req.params.id]);
    if (!rowCount) { notFound(res, 'Asset not found'); return; }
    ok(res, null, 'Asset deleted');
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
