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

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // Get current asset state before update
    const current = await client.query(`SELECT status, name FROM assets WHERE id = $1`, [req.params.id]);
    if (!current.rows[0]) { 
      await client.query('ROLLBACK');
      notFound(res, 'Asset not found'); 
      return; 
    }
    const oldStatus = current.rows[0].status;
    const newStatus = req.body.status;

    // ── Block manual status change to 'available' if asset has active assignment ──
    if (newStatus === 'available' && oldStatus === 'assigned') {
      const activeAssignment = await client.query(
        `SELECT id FROM asset_assignments WHERE asset_id = $1 AND status = 'active' LIMIT 1`,
        [req.params.id]
      );
      if (activeAssignment.rows[0]) {
        await client.query('ROLLBACK');
        res.status(400).json({
          success: false,
          message: 'Cannot manually set this asset to "Available" because it has an active assignment. Please process the return first.'
        });
        return;
      }
    }

    // Apply the update
    const { rows } = await client.query(
      `UPDATE assets SET ${updates.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    if (!rows[0]) { 
      await client.query('ROLLBACK');
      notFound(res, 'Asset not found'); 
      return; 
    }
    const updatedAsset = rows[0];

    // ── Status Propagation ────────────────────────────────────
    if (newStatus && oldStatus !== newStatus) {
      // Log the status change activity
      await client.query(
        `INSERT INTO activities (user_id, asset_id, action, description)
         VALUES ($1, $2, 'asset_status_changed', $3)`,
        [req.user!.userId, req.params.id, `Status changed from "${oldStatus}" to "${newStatus}" for: ${updatedAsset.name}`]
      );

      if (newStatus === 'available') {
        // Close any active maintenance logs
        await client.query(
          `UPDATE maintenance_logs SET status = 'completed', completed_date = CURRENT_DATE
           WHERE asset_id = $1 AND status IN ('pending', 'in_progress')`,
          [req.params.id]
        );
        // Close any active assignments
        await client.query(
          `UPDATE asset_assignments SET status = 'returned', actual_return_date = CURRENT_DATE
           WHERE asset_id = $1 AND status IN ('active', 'overdue')`,
          [req.params.id]
        );
      } else if (newStatus === 'disposed') {
        // Cascade delete the asset and all related records instead of just updating status
        await client.query(
          `DELETE FROM asset_returns WHERE assignment_id IN (SELECT id FROM asset_assignments WHERE asset_id = $1)`,
          [req.params.id]
        );
        await client.query(`DELETE FROM activities WHERE asset_id = $1`, [req.params.id]);
        await client.query(`DELETE FROM maintenance_logs WHERE asset_id = $1`, [req.params.id]);
        await client.query(`DELETE FROM asset_assignments WHERE asset_id = $1`, [req.params.id]);
        await client.query(`UPDATE asset_requests SET asset_id = NULL WHERE asset_id = $1`, [req.params.id]);
        await client.query(`DELETE FROM assets WHERE id = $1`, [req.params.id]);

        // Log the disposal activity
        await client.query(
          `INSERT INTO activities (user_id, action, description)
           VALUES ($1, 'asset_disposed', $2)`,
          [req.user!.userId, `Disposed and deleted asset "${updatedAsset.name}" (${updatedAsset.asset_tag})`]
        );
      } else if (newStatus === 'in_repair') {
        // Close any active assignments since the asset is going for repair
        await client.query(
          `UPDATE asset_assignments SET status = 'returned', actual_return_date = CURRENT_DATE
           WHERE asset_id = $1 AND status IN ('active', 'overdue')`,
          [req.params.id]
        );
      }

      // Notify admins about the status change
      const admins = await client.query(`SELECT id FROM users WHERE role = 'admin'`);
      for (const admin of admins.rows) {
        if (admin.id !== req.user!.userId) { // Don't notify the admin who made the change
          await client.query(
            `INSERT INTO notifications (user_id, type, title, body, reference_id)
             VALUES ($1, 'system', $2, $3, $4)`,
            [admin.id, 'Asset Status Updated',
             `"${updatedAsset.name}" (${updatedAsset.asset_tag}) status changed from "${oldStatus}" to "${newStatus}".`,
             req.params.id]
          );
        }
      }

      // Notify employee who had this asset assigned (if any)
      const assignee = await client.query(
        `SELECT user_id FROM asset_assignments WHERE asset_id = $1 ORDER BY updated_at DESC LIMIT 1`,
        [req.params.id]
      );
      if (assignee.rows[0]) {
        await client.query(
          `INSERT INTO notifications (user_id, type, title, body, reference_id)
           VALUES ($1, 'system', $2, $3, $4)`,
          [assignee.rows[0].user_id, 'Asset Status Updated',
           `"${updatedAsset.name}" (${updatedAsset.asset_tag}) status: ${newStatus}.`,
           req.params.id]
        );
      }
    }

    await client.query('COMMIT');
    ok(res, updatedAsset, 'Asset updated');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    client.release();
  }
});

// DELETE /api/assets/:id
router.delete('/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    // Verify asset exists and check its status
    const assetRecord = await db.query(`SELECT id, name, asset_tag, status FROM assets WHERE id = $1`, [req.params.id]);
    if (!assetRecord.rows[0]) { notFound(res, 'Asset not found'); return; }
    
    const asset = assetRecord.rows[0];
    
    // Block deletion for active assignments/in-use assets
    const activeStatuses = ['assigned', 'in_repair', 'pending_return'];
    if (activeStatuses.includes(asset.status)) {
      const messages: Record<string, string> = {
        assigned: 'Cannot delete an assigned asset. Please process the return first.',
        in_repair: 'Cannot delete an asset that is currently under repair. Complete or cancel maintenance first.',
        pending_return: 'Cannot delete an asset with a pending return request. Process the return first.',
      };
      res.status(400).json({ success: false, message: messages[asset.status] ?? 'Cannot delete asset in its current state.' });
      return;
    }

    const client = await db.connect();
    try {
      await client.query('BEGIN');

      // Delete related records in order to avoid foreign key violations
      // 1. Delete asset_returns (via assignment_id → asset_assignments → assets)
      await client.query(
        `DELETE FROM asset_returns WHERE assignment_id IN (SELECT id FROM asset_assignments WHERE asset_id = $1)`,
        [req.params.id]
      );
      // 2. Delete activities referencing this asset
      await client.query(`DELETE FROM activities WHERE asset_id = $1`, [req.params.id]);
      // 3. Delete maintenance_logs referencing this asset
      await client.query(`DELETE FROM maintenance_logs WHERE asset_id = $1`, [req.params.id]);
      // 4. Delete asset_assignments referencing this asset
      await client.query(`DELETE FROM asset_assignments WHERE asset_id = $1`, [req.params.id]);
      // 5. Update asset_requests to remove asset_id reference
      await client.query(`UPDATE asset_requests SET asset_id = NULL WHERE asset_id = $1`, [req.params.id]);
      // 6. Finally delete the asset itself
      const { rowCount } = await client.query(`DELETE FROM assets WHERE id = $1`, [req.params.id]);
      
      if (!rowCount) {
        await client.query('ROLLBACK');
        notFound(res, 'Asset not found');
        return;
      }

      // Log the deletion activity
      await client.query(
        `INSERT INTO activities (user_id, action, description)
         VALUES ($1, 'asset_deleted', $2)`,
        [req.user!.userId, `Deleted asset "${asset.name}" (${asset.asset_tag})`]
      );

      await client.query('COMMIT');
      ok(res, null, 'Asset deleted successfully along with all associated records');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
