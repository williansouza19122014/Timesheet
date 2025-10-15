import type { Response } from "express";
import { z } from "zod";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";
import { dashboardService } from "../services/dashboardService";
import { UserRole } from "../models/User";
import { HttpException } from "../utils/httpException";

const overviewQuerySchema = z.object({
  month: z.coerce.number().min(1).max(12).optional(),
  year: z.coerce.number().min(1970).max(9999).optional(),
  scope: z.enum(["self", "team"]).optional(),
  userId: z.string().trim().optional(),
});

const getContext = (req: AuthenticatedRequest) => {
  const tenantId = req.tenantId;
  if (!tenantId) {
    throw new HttpException(403, "Tenant context missing");
  }
  if (!req.userId || !req.userRole) {
    throw new HttpException(401, "Unauthorized");
  }
  return { tenantId, actor: { id: req.userId, role: req.userRole as UserRole } };
};

export const dashboardController = {
  async overview(req: AuthenticatedRequest, res: Response) {
    const query = overviewQuerySchema.parse(req.query);
    const { tenantId, actor } = getContext(req);
    const overview = await dashboardService.getOverview(query, actor, tenantId);
    return res.json(overview);
  },
};
