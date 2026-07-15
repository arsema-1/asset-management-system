import { Router, Request, Response } from 'express';
import { db } from '../../database/db';
import { ok, created, notFound, badRequest, forbidden, serverError } from '../../shared/types';
import { authenticate } from '../../middleware/auth';
import { addFilter, buildWhere, withTransaction, notifyAdmins, notifyUser, logActivity, getFullName } from '../../shared/utils';

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

  if (req.user?.role === 'employee') addFilter(conditions, params, 'ar.requested_by', req.user.userId);
  addFilter(conditions, params, 'ar.status', status);

  try {
    const { rows } = await db.query(
      `${SELECT_REQUEST} ${buildWhere(conditions, params)} ORDER BY ar.created_at DESC`,
      params
    );
    ok(res, rows, 'Requests retrieved');
  } catch (err) { serverError(res, err, 'GET /requests'); }
});

// GET /api/requests/:id
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { rows } = await db.query(`${SELECT_REQUEST} WHERE ar.id = $1`, [req.params.id]);
    if (!rows[0]) { notFound(res, 'Request not found'); return; }
    if (req.user?.role === 'employee' && rows[0].requested_by !== req.user.userId) {
      forbidden(res); return;
    }
    ok(res, rows[0], 'Request retrieved');
  } catch (err) { serverError(res, err, 'GET /requests/:id'); }
});

// POST /api/requests
router.post('/', authenticate, async (req: Request, res: Response) => {
  const { asset_name, asset_id, category, reason } = req.body;
  if (!asset_name || !reason) { badRequest(res, 'asset_name and reason are required'); return; }

  try {
    const result = await withTransaction(async (client) => {
      const { rows } = await client.query(
        `INSERT INTO asset_requests (requested_by, asset_id, asset_name, category, reason)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [req.user!.userId, asset_id ?? null, asset_name, category ?? null, reason]
      );
      const inserted = rows[0];
      const requesterName = await getFullName(client, req.user!.userId);
      await logActivity(client, {
        userId: req.user!.userId,
        assetId: asset_id,
        action: 'request_submitted',
        description: `Requested: ${asset_name}`,
      });
      await notifyAdmins(client, {
        type: 'request',
        title: 'New Asset Request',
        body: `${requesterName} requested: "${asset_name}" (${category ?? 'other'}).`,
        referenceId: inserted.id,
      });
      return inserted;
    });
    created(res, result, 'Request submitted');
  } catch (err) { serverError(res, err, 'POST /requests'); }
});

// PUT /api/requests/:id  (approve / reject / cancel)
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  const { status, admin_comment } = req.body;
  const adminOnly = ['approved', 'rejected', 'completed'];

  if (status && adminOnly.includes(status) && req.user?.role !== 'admin') {
    forbidden(res, 'Only admins can approve or reject requests'); return;
  }

  const updates: string[] = [];
  const params: unknown[] = [];
  if (status)                { updates.push(`status = $${params.length + 1}`);        params.push(status); }
  if (admin_comment !== undefined) { updates.push(`admin_comment = $${params.length + 1}`); params.push(admin_comment); }
  if (status && adminOnly.includes(status)) {
    updates.push(`reviewed_by = $${params.length + 1}`); params.push(req.user!.userId);
    updates.push(`reviewed_at = NOW()`);
  }
  if (!updates.length) { badRequest(res, 'No fields to update'); return; }

  try {
    const result = await withTransaction(async (client) => {
      const { rows } = await client.query(
        `UPDATE asset_requests SET ${updates.join(', ')} WHERE id = $${params.length + 1} RETURNING *`,
        [...params, req.params.id]
      );
      if (!rows[0]) { notFound(res, 'Request not found'); return null; }
      const updated = rows[0];

      if (status === 'approved' || status === 'rejected') {
        await notifyUser(client, {
          userId: updated.requested_by,
          type: 'request',
          title: status === 'approved'
            ? `Your request for "${updated.asset_name}" was approved`
            : `Your request for "${updated.asset_name}" was rejected`,
          body: admin_comment
            ? `Admin comment: ${admin_comment}`
            : status === 'approved'
              ? 'Your request has been approved. Please check with IT for pickup details.'
              : 'Your request was not approved at this time.',
          referenceId: updated.id,
        });
      }
      return updated;
    });
    if (!result) return;
    ok(res, result, 'Request updated');
  } catch (err) { serverError(res, err, 'PUT /requests/:id'); }
});

// DELETE /api/requests/:id
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const check = await db.query(`SELECT requested_by FROM asset_requests WHERE id = $1`, [req.params.id]);
    if (!check.rows[0]) { notFound(res, 'Request not found'); return; }
    if (req.user?.role === 'employee' && check.rows[0].requested_by !== req.user.userId) {
      forbidden(res); return;
    }
    await db.query(`DELETE FROM asset_requests WHERE id = $1`, [req.params.id]);
    ok(res, null, 'Request deleted');
  } catch (err) { serverError(res, err, 'DELETE /requests/:id'); }
});

export default router;
