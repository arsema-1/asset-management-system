import { Router, Request, Response } from 'express';
import { db } from '../../database/db';
import { ok, created, notFound, badRequest } from '../../shared/types';
import { authenticate, requireAdmin } from '../../middleware/auth';

const router = Router();

const SELECT_REQUEST = `
  SELECT ar.*,
    json_build_object('id', u.id, 'first_name', u.first_name, 'last_name', u.last_name) AS requested_by_user
  FROM asset_requests ar
  JOIN users u ON ar.requested_by = u.id
`;

// GET /api/requests
router.get('/', authenticate, async (req: Request, res: Response) => {
  const { status } = req.query as Record<string, string>;
  const conditions: string[] = [];
  const params: unknown[] = [];

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
    const { rows } = await db.query(
      `${SELECT_REQUEST} ${where} ORDER BY ar.created_at DESC`,
      params
    );
    ok(res, rows, 'Requests retrieved');
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/requests/:id
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { rows } = await db.query(`${SELECT_REQUEST} WHERE ar.id = $1`, [req.params.id]);
    if (!rows[0]) { notFound(res, 'Request not found'); return; }
    if (req.user?.role === 'employee' && rows[0].requested_by !== req.user.userId) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }
    ok(res, rows[0], 'Request retrieved');
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/requests
router.post('/', authenticate, async (req: Request, res: Response) => {
  const { asset_name, asset_id, category, reason } = req.body;
  if (!asset_name || !reason) {
    badRequest(res, 'asset_name and reason are required');
    return;
  }
  try {
    const { rows } = await db.query(
      `INSERT INTO asset_requests (requested_by, asset_id, asset_name, category, reason)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user!.userId, asset_id ?? null, asset_name, category ?? null, reason]
    );

    const insertedRequest = rows[0];

    // Log activity
    await db.query(
      `INSERT INTO activities (user_id, asset_id, action, description)
       VALUES ($1, $2, 'request_submitted', $3)`,
      [req.user!.userId, asset_id ?? null, `Requested: ${asset_name}`]
    );

    // Get requester name
    const userRes = await db.query(`SELECT first_name, last_name FROM users WHERE id = $1`, [req.user!.userId]);
    const requesterName = userRes.rows[0] ? `${userRes.rows[0].first_name} ${userRes.rows[0].last_name}` : 'Employee';

    // Notify all admins
    const admins = await db.query(`SELECT id FROM users WHERE role = 'admin'`);
    for (const admin of admins.rows) {
      await db.query(
        `INSERT INTO notifications (user_id, type, title, body, reference_id)
         VALUES ($1, 'request', $2, $3, $4)`,
        [
          admin.id,
          'New Asset Request',
          `${requesterName} requested asset: "${asset_name}" (${category ?? 'other'}).`,
          insertedRequest.id
        ]
      );
    }

    created(res, insertedRequest, 'Request submitted');
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/requests/:id
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  const { status, admin_comment } = req.body;
  const updates: string[] = [];
  const params: unknown[] = [];

  const adminOnlyStatuses = ['approved', 'rejected', 'completed'];
  if (status && adminOnlyStatuses.includes(status) && req.user?.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Only admins can approve or reject requests' });
    return;
  }

  if (status) { updates.push(`status = $${params.length + 1}`); params.push(status); }
  if (admin_comment !== undefined) { updates.push(`admin_comment = $${params.length + 1}`); params.push(admin_comment); }
  if (status && adminOnlyStatuses.includes(status)) {
    updates.push(`reviewed_by = $${params.length + 1}`); params.push(req.user!.userId);
    updates.push(`reviewed_at = NOW()`);
  }
  if (!updates.length) { badRequest(res, 'No fields to update'); return; }

  params.push(req.params.id);
  try {
    const { rows } = await db.query(
      `UPDATE asset_requests SET ${updates.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    if (!rows[0]) { notFound(res, 'Request not found'); return; }
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

      await db.query(
        `INSERT INTO notifications (user_id, type, title, body, reference_id)
         VALUES ($1, 'request', $2, $3, $4)`,
        [updated.requested_by, notifTitle, notifBody, updated.id]
      );
    }

    ok(res, updated, 'Request updated');
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/requests/:id
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const check = await db.query(`SELECT requested_by FROM asset_requests WHERE id = $1`, [req.params.id]);
    if (!check.rows[0]) { notFound(res, 'Request not found'); return; }
    if (req.user?.role === 'employee' && check.rows[0].requested_by !== req.user.userId) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }
    await db.query(`DELETE FROM asset_requests WHERE id = $1`, [req.params.id]);
    ok(res, null, 'Request deleted');
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
