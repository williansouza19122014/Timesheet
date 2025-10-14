import type { RequestHandler } from "express";

/**
 * Wraps an async Express handler and forwards any rejection to the next middleware.
 */
export function asyncHandler<T extends RequestHandler>(handler: T): RequestHandler {
  return (async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  }) as RequestHandler;
}
