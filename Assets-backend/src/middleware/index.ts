import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

/* ── Request logger ─────────────────────────────────────── */
export function requestLogger(req: Request, _res: Response, next: NextFunction): void {
  if (config.nodeEnv !== 'test') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  }
  next();
}

/* ── Global error handler ───────────────────────────────── */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  console.error(`[ERROR] ${req.method} ${req.originalUrl}`, err.message);

  res.status(500).json({
    success: false,
    message: config.nodeEnv === 'production' ? 'Internal server error' : err.message,
  });
}

/* ── 404 handler ────────────────────────────────────────── */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}
