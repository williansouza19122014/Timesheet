import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "./authMiddleware";

const hasPermission = (permissions: unknown, permission: string): boolean => {
  if (!Array.isArray(permissions)) {
    return false;
  }
  if (permissions.includes("*")) {
    return true;
  }
  return permissions.includes(permission);
};

export function checkPermission(permission: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const permissions = req.user?.permissions;

    if (!hasPermission(permissions, permission)) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    return next();
  };
}
