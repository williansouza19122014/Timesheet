import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { HttpException } from "../utils/httpException";

export interface AuthenticatedUser {
  userId: string;
  tenantId: string;
  role: string;
  permissions: string[];
}

export type AuthenticatedRequest = Request;

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthenticatedUser;
    tenantId?: string;
    userId?: string;
    userRole?: string;
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new HttpException(401, "Authorization header missing");
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    throw new HttpException(401, "Invalid authorization header");
  }

  try {
    const payload = verifyToken(token);

    req.user = payload;
    req.userId = payload.userId;
    req.userRole = payload.role;

    next();
  } catch (error) {
    throw new HttpException(401, "Invalid or expired token", error);
  }
}
