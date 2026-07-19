"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const db_1 = require("../../database/db");
const config_1 = require("../../config");
const types_1 = require("../../shared/types");
const utils_1 = require("../../shared/utils");
const router = (0, express_1.Router)();
// ── Nodemailer transporter (Mailtrap / SMTP) ──────────────
const transporter = nodemailer_1.default.createTransport({
    host: config_1.config.smtp.host,
    port: config_1.config.smtp.port,
    auth: {
        user: config_1.config.smtp.user,
        pass: config_1.config.smtp.pass,
    },
});
// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        (0, types_1.badRequest)(res, 'Email and password are required');
        return;
    }
    try {
        const { rows } = await db_1.db.query(`SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.employee_id, u.position, u.status,
              u.password_hash, u.email_verified,
              d.name AS department
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.email = $1 AND u.status = 'active'`, [email]);
        if (!rows[0]) {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
            return;
        }
        const user = rows[0];
        // Block unverified users from logging in
        if (!user.email_verified) {
            res.status(403).json({
                success: false,
                message: 'Please verify your email before logging in. Check your inbox for the verification link.'
            });
            return;
        }
        const { rows: pwRows } = await db_1.db.query(`SELECT (password_hash = crypt($1, password_hash)) AS valid FROM users WHERE id = $2`, [password, user.id]);
        if (!pwRows[0]?.valid) {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
            return;
        }
        // Role-based session: 7 days for employees, 24 hours for admins
        const expiresIn = user.role === 'admin' ? '1d' : '7d';
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, config_1.config.jwtSecret, { expiresIn });
        const { password_hash: _pw, email_verified: _ev, ...safeUser } = user;
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
// ── Email domain whitelist ────────────────────────────────
const ALLOWED_DOMAINS = ['gmail.com'];
function isEmailAllowed(email) {
    const domain = email.split('@')[1]?.toLowerCase();
    return domain ? ALLOWED_DOMAINS.includes(domain) : false;
}
// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    const { first_name, last_name, email, password, employee_id, department } = req.body;
    if (!first_name || !last_name || !email || !password) {
        (0, types_1.badRequest)(res, 'first_name, last_name, email, and password are required');
        return;
    }
    // Restrict to allowed email domains only
    if (!isEmailAllowed(email)) {
        (0, types_1.badRequest)(res, 'Only @gmail.com email addresses are allowed to sign up.');
        return;
    }
    try {
        // Resolve department name to ID
        let deptId = null;
        if (department) {
            const deptRes = await db_1.db.query(`SELECT id FROM departments WHERE LOWER(name) = LOWER($1)`, [department]);
            deptId = deptRes.rows[0]?.id ?? null;
        }
        const { rows } = await db_1.db.query(`INSERT INTO users (first_name, last_name, email, password_hash, employee_id, department_id, email_verified)
       VALUES ($1, $2, $3, crypt($4, gen_salt('bf')), $5, $6, FALSE)
       RETURNING id, first_name, last_name, email, role, employee_id, status, email_verified`, [first_name, last_name, email, password, employee_id ?? null, deptId]);
        const user = rows[0];
        // Generate verification token
        const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
        const tokenHash = crypto_1.default.createHash('sha256').update(verificationToken).digest('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        await db_1.db.query(`INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`, [user.id, tokenHash, expiresAt]);
        // Build verification link
        const verifyLink = `${config_1.config.appUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(user.email)}`;
        console.log('─── Email Verification Link ────────────────────────────────');
        console.log(`  To: ${user.email}`);
        console.log(`  Link: ${verifyLink}`);
        console.log('────────────────────────────────────────────────────────────');
        // Send verification email
        const mailOptions = {
            from: `"${config_1.config.smtp.fromName}" <${config_1.config.smtp.fromAddress}>`,
            to: user.email,
            subject: 'Verify your email - AssetFlow',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #58C6D7; margin: 0; font-size: 28px;">AssetFlow</h1>
            <p style="color: #696f7c; margin: 4px 0 0;">Enterprise Asset Manager</p>
          </div>
          <div style="background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
            <h2 style="margin: 0 0 16px; color: #141414;">Welcome to AssetFlow!</h2>
            <p style="color: #696f7c; line-height: 1.6; margin: 0 0 24px;">
              Hi ${first_name},<br /><br />
              Please verify your email address by clicking the button below.
              This link expires in <strong>24 hours</strong>.
            </p>
            <a href="${verifyLink}" 
               style="display: inline-block; background: #141414; color: #ffffff; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 15px; text-decoration: none;">
              Verify Email
            </a>
            <p style="color: #696f7c; font-size: 13px; line-height: 1.5; margin: 24px 0 0;">
              If you didn't create this account, you can safely ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
            <p style="color: #696f7c; font-size: 12px; margin: 0;">
              This is an automated message from AssetFlow Systems.
            </p>
          </div>
        </div>
      `,
        };
        if (config_1.config.smtp.user && config_1.config.smtp.pass) {
            try {
                await transporter.sendMail(mailOptions);
                console.log(`📧 Verification email sent to ${user.email}`);
            }
            catch (smtpErr) {
                console.error('❌ Verification email send failed:', smtpErr.message);
            }
        }
        res.status(201).json({
            success: true,
            message: 'Account created! Please check your email to verify your account before logging in.',
            data: { email: user.email }
        });
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
// GET /api/auth/verify-email?token=...&email=...
router.get('/verify-email', async (req, res) => {
    const { token, email } = req.query;
    if (!token || !email) {
        (0, types_1.badRequest)(res, 'Verification token and email are required');
        return;
    }
    try {
        const tokenHash = crypto_1.default.createHash('sha256').update(token).digest('hex');
        const { rows } = await db_1.db.query(`SELECT evt.id, evt.user_id, u.email AS user_email
       FROM email_verification_tokens evt
       JOIN users u ON evt.user_id = u.id
       WHERE evt.token = $1
         AND u.email = $2
         AND evt.expires_at > NOW()`, [tokenHash, email]);
        if (!rows[0]) {
            res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token. Please sign up again.'
            });
            return;
        }
        const { user_id: userId } = rows[0];
        await (0, utils_1.withTransaction)(async (client) => {
            await client.query(`UPDATE users SET email_verified = TRUE WHERE id = $1`, [userId]);
            await client.query(`DELETE FROM email_verification_tokens WHERE user_id = $1`, [userId]);
        });
        res.status(200).json({
            success: true,
            message: 'Email verified successfully! You can now log in.'
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: config_1.config.nodeEnv === 'production' ? 'Server error' : err.message
        });
    }
});
// POST /api/auth/resend-verification
router.post('/resend-verification', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        (0, types_1.badRequest)(res, 'Email is required');
        return;
    }
    try {
        const { rows } = await db_1.db.query(`SELECT id, first_name, last_name, email, email_verified FROM users WHERE email = $1 AND status = 'active'`, [email]);
        // Don't reveal if the email exists (prevent enumeration)
        if (!rows[0]) {
            (0, types_1.ok)(res, null, 'If the email exists, a new verification link has been sent.');
            return;
        }
        const user = rows[0];
        // If already verified, still return success to not reveal account state
        if (user.email_verified) {
            (0, types_1.ok)(res, null, 'If the email exists, a new verification link has been sent.');
            return;
        }
        // Remove old tokens for this user
        await db_1.db.query(`DELETE FROM email_verification_tokens WHERE user_id = $1`, [user.id]);
        // Generate new verification token
        const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
        const tokenHash = crypto_1.default.createHash('sha256').update(verificationToken).digest('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        await db_1.db.query(`INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`, [user.id, tokenHash, expiresAt]);
        // Build verification link
        const verifyLink = `${config_1.config.appUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(user.email)}`;
        console.log('─── Resend: Email Verification Link ────────────────────────');
        console.log(`  To: ${user.email}`);
        console.log(`  Link: ${verifyLink}`);
        console.log('────────────────────────────────────────────────────────────');
        // Send verification email
        const mailOptions = {
            from: `"${config_1.config.smtp.fromName}" <${config_1.config.smtp.fromAddress}>`,
            to: user.email,
            subject: 'Verify your email - AssetFlow',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #58C6D7; margin: 0; font-size: 28px;">AssetFlow</h1>
            <p style="color: #696f7c; margin: 4px 0 0;">Enterprise Asset Manager</p>
          </div>
          <div style="background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
            <h2 style="margin: 0 0 16px; color: #141414;">Verify Your Email</h2>
            <p style="color: #696f7c; line-height: 1.6; margin: 0 0 24px;">
              Hi ${user.first_name},<br /><br />
              You requested a new verification link for your AssetFlow account.
              Click the button below to verify your email. This link expires in <strong>24 hours</strong>.
            </p>
            <a href="${verifyLink}" 
               style="display: inline-block; background: #141414; color: #ffffff; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 15px; text-decoration: none;">
              Verify Email
            </a>
            <p style="color: #696f7c; font-size: 13px; line-height: 1.5; margin: 24px 0 0;">
              If you didn't request this, you can safely ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
            <p style="color: #696f7c; font-size: 12px; margin: 0;">
              This is an automated message from AssetFlow Systems.
            </p>
          </div>
        </div>
      `,
        };
        if (config_1.config.smtp.user && config_1.config.smtp.pass) {
            try {
                await transporter.sendMail(mailOptions);
                console.log(`📧 Verification email resent to ${user.email}`);
            }
            catch (smtpErr) {
                console.error('❌ Resend verification email failed:', smtpErr.message);
            }
        }
        (0, types_1.ok)(res, null, 'If the email exists, a new verification link has been sent.');
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: config_1.config.nodeEnv === 'production' ? 'Server error' : err.message
        });
    }
});
// POST /api/auth/logout  (client just drops the token; this is a no-op acknowledgement)
router.post('/logout', (_req, res) => (0, types_1.ok)(res, null, 'Logged out'));
// ── Forgot Password ───────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        (0, types_1.badRequest)(res, 'Email is required');
        return;
    }
    try {
        // Check if user exists
        const { rows } = await db_1.db.query(`SELECT id, first_name, last_name, email FROM users WHERE email = $1 AND status = 'active'`, [email]);
        // Always return success to prevent email enumeration
        if (!rows[0]) {
            (0, types_1.ok)(res, null, 'If the email exists, a password reset link has been sent.');
            return;
        }
        const user = rows[0];
        // Generate a secure random token
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const tokenHash = crypto_1.default.createHash('sha256').update(resetToken).digest('hex');
        // Token expires in 1 hour
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        // Store hashed token in database
        await db_1.db.query(`INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)`, [user.id, tokenHash, expiresAt]);
        // Build reset link
        const resetLink = `${config_1.config.appUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;
        // ── Always log the reset link to console ──
        console.log('─── Password Reset Link ──────────────────────────────────────');
        console.log(`  To: ${user.email}`);
        console.log(`  Link: ${resetLink}`);
        console.log('──────────────────────────────────────────────────────────────');
        // ── Try sending email via SMTP ──
        const mailOptions = {
            from: `"${config_1.config.smtp.fromName}" <${config_1.config.smtp.fromAddress}>`,
            to: user.email,
            subject: 'Password Reset Request - AssetFlow',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #58C6D7; margin: 0; font-size: 28px;">AssetFlow</h1>
            <p style="color: #696f7c; margin: 4px 0 0;">Enterprise Asset Manager</p>
          </div>
          <div style="background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
            <h2 style="margin: 0 0 16px; color: #141414;">Password Reset Request</h2>
            <p style="color: #696f7c; line-height: 1.6; margin: 0 0 24px;">
              Hi ${user.first_name},<br /><br />
              We received a request to reset the password for your AssetFlow account.
              Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
            </p>
            <a href="${resetLink}" 
               style="display: inline-block; background: #141414; color: #ffffff; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 15px; text-decoration: none;">
              Reset Password
            </a>
            <p style="color: #696f7c; font-size: 13px; line-height: 1.5; margin: 24px 0 0;">
              If you didn't request a password reset, you can safely ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
            <p style="color: #696f7c; font-size: 12px; margin: 0;">
              This is an automated message from AssetFlow Systems. Please do not reply to this email.
            </p>
          </div>
        </div>
      `,
        };
        if (config_1.config.smtp.user && config_1.config.smtp.pass) {
            try {
                await transporter.sendMail(mailOptions);
                console.log(`📧 Email sent to ${user.email} via ${config_1.config.smtp.host}:${config_1.config.smtp.port}`);
            }
            catch (smtpErr) {
                // Log the SMTP error details but don't fail the request
                console.error('❌ SMTP send failed:', smtpErr.message);
                console.error('   SMTP config:', { host: config_1.config.smtp.host, port: config_1.config.smtp.port, user: config_1.config.smtp.user });
            }
        }
        else {
            console.log('⚠️  SMTP not configured — reset link only available in server console');
        }
        (0, types_1.ok)(res, null, 'If the email exists, a password reset link has been sent.');
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: config_1.config.nodeEnv === 'production' ? 'Server error' : err.message
        });
    }
});
// ── Reset Password ────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
    const { token, email, password } = req.body;
    if (!token || !email || !password) {
        (0, types_1.badRequest)(res, 'Token, email, and new password are required');
        return;
    }
    if (password.length < 6) {
        (0, types_1.badRequest)(res, 'Password must be at least 6 characters');
        return;
    }
    try {
        const tokenHash = crypto_1.default.createHash('sha256').update(token).digest('hex');
        const { rows } = await db_1.db.query(`SELECT prt.id, prt.user_id, u.email
       FROM password_reset_tokens prt
       JOIN users u ON prt.user_id = u.id
       WHERE prt.token = $1
         AND u.email = $2
         AND prt.expires_at > NOW()
         AND prt.used = FALSE`, [tokenHash, email]);
        if (!rows[0]) {
            (0, types_1.badRequest)(res, 'Invalid or expired reset token');
            return;
        }
        const { user_id: userId } = rows[0];
        // Update password and mark token as used in a transaction
        await (0, utils_1.withTransaction)(async (client) => {
            await client.query(`UPDATE users SET password_hash = crypt($1, gen_salt('bf')) WHERE id = $2`, [password, userId]);
            await client.query(`UPDATE password_reset_tokens SET used = TRUE WHERE token = $1`, [tokenHash]);
        });
        (0, types_1.ok)(res, null, 'Password has been reset successfully. You can now log in with your new password.');
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: config_1.config.nodeEnv === 'production' ? 'Server error' : err.message
        });
    }
});
exports.default = router;
