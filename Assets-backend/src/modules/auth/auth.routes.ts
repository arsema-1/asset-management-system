import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../../database/db';
import { config } from '../../config';
import { ok, badRequest, notFound } from '../../shared/types';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    badRequest(res, 'Email and password are required');
    return;
  }
  try {
    const { rows } = await db.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.employee_id, u.position, u.status,
              u.password_hash,
              d.name AS department
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.email = $1 AND u.status = 'active'`,
      [email]
    );
    if (!rows[0]) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }
    const user = rows[0];
    const { rows: pwRows } = await db.query(
      `SELECT (password_hash = crypt($1, password_hash)) AS valid FROM users WHERE id = $2`,
      [password, user.id]
    );
    if (!pwRows[0]?.valid) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      config.jwtSecret as string,
      { expiresIn: '7d' }
    );
    const { password_hash: _pw, ...safeUser } = user;
    ok(res, { token, user: safeUser }, 'Login successful');
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: config.nodeEnv === 'production' ? 'Server error' : (err as Error).message
    });
  }
});

// POST /api/auth/signup
router.post('/signup', async (req: Request, res: Response) => {
  const { first_name, last_name, email, password, employee_id, department } = req.body;
  if (!first_name || !last_name || !email || !password) {
    badRequest(res, 'first_name, last_name, email, and password are required');
    return;
  }
  try {
    // Resolve department name to ID
    let deptId: string | null = null;
    if (department) {
      const deptRes = await db.query(
        `SELECT id FROM departments WHERE LOWER(name) = LOWER($1)`,
        [department]
      );
      deptId = deptRes.rows[0]?.id ?? null;
    }

    const { rows } = await db.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, employee_id, department_id)
       VALUES ($1, $2, $3, crypt($4, gen_salt('bf')), $5, $6)
       RETURNING id, first_name, last_name, email, role, employee_id, status`,
      [first_name, last_name, email, password, employee_id ?? null, deptId]
    );
    const user = rows[0];
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      config.jwtSecret as string,
      { expiresIn: '7d' }
    );
    res.status(201).json({ success: true, message: 'Account created', data: { token, user } });
  } catch (err: unknown) {
    const pg = err as { code?: string };
    if (pg.code === '23505') {
      res.status(409).json({ success: false, message: 'Email already in use' });
    } else {
      console.error(err);
      res.status(500).json({
        success: false,
        message: config.nodeEnv === 'production' ? 'Server error' : (err as Error).message
      });
    }
  }
});

// POST /api/auth/logout  (client just drops the token; this is a no-op acknowledgement)
router.post('/logout', (_req, res) => ok(res, null, 'Logged out'));

export default router;
