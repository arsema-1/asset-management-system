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
      // First get the current request to check if it has an asset_id
      const currentReq = await client.query(
        `SELECT ar.*, a.name AS asset_name_full, a.status AS asset_status, a.asset_tag
         FROM asset_requests ar
         LEFT JOIN assets a ON ar.asset_id = a.id
         WHERE ar.id = $1`,
        [req.params.id]
      );
      if (!currentReq.rows[0]) { notFound(res, 'Request not found'); return null; }
      const reqData = currentReq.rows[0];

      // Update the request status
      const { rows } = await client.query(
        `UPDATE asset_requests SET ${updates.join(', ')} WHERE id = $${params.length + 1} RETURNING *`,
        [...params, req.params.id]
      );
      if (!rows[0]) { notFound(res, 'Request not found'); return null; }
      const updated = rows[0];

      if (status === 'approved') {
        // ── APPROVED: Auto-assign if a specific asset was requested ──
        if (reqData.asset_id && reqData.asset_status === 'available') {
          // Check that asset is still available
          const assetCheck = await client.query(
            `SELECT status FROM assets WHERE id = $1`,
            [reqData.asset_id]
          );
          if (assetCheck.rows[0]?.status === 'available') {
            // Create the assignment
            await client.query(
              `INSERT INTO asset_assignments (asset_id, user_id, assigned_by, notes)
               VALUES ($1, $2, $3, $4)`,
              [reqData.asset_id, updated.requested_by, req.user!.userId,
               `Auto-assigned via approved request: ${updated.asset_name}`]
            );

            // Update asset status
            await client.query(
              `UPDATE assets SET status = 'assigned' WHERE id = $1`,
              [reqData.asset_id]
            );

            // Log the assignment activity
            await logActivity(client, {
              userId: req.user!.userId,
              assetId: reqData.asset_id,
              action: 'asset_assigned',
              description: `Assigned "${reqData.asset_name_full}" (${reqData.asset_tag}) to user via approved request: ${updated.asset_name}`,
            });

            // Notify the employee
            await notifyUser(client, {
              userId: updated.requested_by,
              type: 'assignment',
              title: `Asset Assigned: ${reqData.asset_name_full}`,
              body: `Your request for "${updated.asset_name}" was approved and "${reqData.asset_name_full}" (${reqData.asset_tag}) has been assigned to you.`,
              referenceId: updated.id,
            });
          } else {
            // Asset no longer available - still approve the request but notify differently
            await notifyUser(client, {
              userId: updated.requested_by,
              type: 'request',
              title: `Your request for "${updated.asset_name}" was approved`,
              body: `Your request has been approved but the requested asset is no longer available (${assetCheck.rows[0]?.status ?? 'unknown'}). Please contact IT for an alternative assignment.`,
              referenceId: updated.id,
            });
          }
        } else {
          // No specific asset requested — just notify approval
          await notifyUser(client, {
            userId: updated.requested_by,
            type: 'request',
            title: `Your request for "${updated.asset_name}" was approved`,
            body: admin_comment
              ? `Admin comment: ${admin_comment}. Please visit IT to receive your asset.`
              : 'Your request has been approved. Please visit IT to receive your asset.',
            referenceId: updated.id,
          });
        }
      } else if (status === 'rejected') {
        // ── REJECTED: Just notify ──
        await notifyUser(client, {
          userId: updated.requested_by,
          type: 'request',
          title: `Your request for "${updated.asset_name}" was not approved`,
          body: admin_comment
            ? `Admin comment: ${admin_comment}`
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
