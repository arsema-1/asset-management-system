"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = requestLogger;
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
const config_1 = require("../config");
/* ── Request logger ─────────────────────────────────────── */
function requestLogger(req, _res, next) {
    if (config_1.config.nodeEnv !== 'test') {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    }
    next();
}
/* ── Global error handler ───────────────────────────────── */
function errorHandler(err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_next) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}`, err.message);
    res.status(500).json({
        success: false,
        message: config_1.config.nodeEnv === 'production' ? 'Internal server error' : err.message,
    });
}
/* ── 404 handler ────────────────────────────────────────── */
function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
}
