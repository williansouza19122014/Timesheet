import type { Request, Response, NextFunction } from "express";
import { HttpException } from "../utils/httpException";

export function tenantMiddleware(req: Request, _res: Response, next: NextFunction) {
  const tenantId = req.user?.tenantId;

  if (!tenantId) {
    throw new HttpException(403, "Tenant context missing");
  }

  req.tenantId = tenantId;
  next();
}
