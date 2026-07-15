import { Request, Response, NextFunction } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export type RouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

export function ok<T>(res: Response, data: T, message = 'Success'): Response {
  return res.status(200).json({ success: true, message, data } satisfies ApiResponse<T>);
}

export function created<T>(res: Response, data: T, message = 'Created'): Response {
  return res.status(201).json({ success: true, message, data } satisfies ApiResponse<T>);
}

export function notFound(res: Response, message = 'Not found'): Response {
  return res.status(404).json({ success: false, message } satisfies ApiResponse);
}

export function badRequest(res: Response, message = 'Bad request'): Response {
  return res.status(400).json({ success: false, message } satisfies ApiResponse);
}
