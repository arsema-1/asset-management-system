"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../../database/db");
const config_1 = require("../../config");
const types_1 = require("../../shared/types");
const router = (0, express_1.Router)();
// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        (0, types_1.badRequest)(res, 'Email and password are required');
        return;
    }
    try {
        const { rows } = await db_1.db.query(`SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.employee_id, u.position, u.status,
              u.password_hash,
              d.name AS department
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.email = $1 AND u.status = 'active'`, [email]);
        if (!rows[0]) {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
            return;
        }
        const user = rows[0];
        const { rows: pwRows } = await db_1.db.query(`SELECT (password_hash = crypt($1, password_hash)) AS valid FROM users WHERE id = $2`, [password, user.id]);
        if (!pwRows[0]?.valid) {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, config_1.config.jwtSecret, { expiresIn: '7d' });
        const { password_hash: _pw, ...safeUser } = user;
        (0, types_1.ok)(res, { token, user: safeUser }, 'Login successful');
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: config_1.config.nodeEnv === 'production' ? 'Server error' : err.message
        });
    }
});
// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    const { first_name, last_name, email, password, employee_id, department } = req.body;
    if (!first_name || !last_name || !email || !password) {
        (0, types_1.badRequest)(res, 'first_name, last_name, email, and password are required');
        return;
    }
    try {
        // Resolve department name to ID
        let deptId = null;
        if (department) {
            const deptRes = await db_1.db.query(`SELECT id FROM departments WHERE LOWER(name) = LOWER($1)`, [department]);
            deptId = deptRes.rows[0]?.id ?? null;
        }
        const { rows } = await db_1.db.query(`INSERT INTO users (first_name, last_name, email, password_hash, employee_id, department_id)
       VALUES ($1, $2, $3, crypt($4, gen_salt('bf')), $5, $6)
       RETURNING id, first_name, last_name, email, role, employee_id, status`, [first_name, last_name, email, password, employee_id ?? null, deptId]);
        const user = rows[0];
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, config_1.config.jwtSecret, { expiresIn: '7d' });
        res.status(201).json({ success: true, message: 'Account created', data: { token, user } });
    }
    catch (err) {
        const pg = err;
        if (pg.code === '23505') {
            res.status(409).json({ success: false, message: 'Email already in use' });
        }
        else {
            console.error(err);
            res.status(500).json({
                success: false,
                message: config_1.config.nodeEnv === 'production' ? 'Server error' : err.message
            });
        }
    }
});
// POST /api/auth/logout  (client just drops the token; this is a no-op acknowledgement)
router.post('/logout', (_req, res) => (0, types_1.ok)(res, null, 'Logged out'));
exports.default = router;
