
import { Router } from "express";
import type { Response } from "express";
import { z } from "zod";
import { reportService } from "../services/reportService";
import { VacationRequestStatus } from "../models/Vacation";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";
import { UserRole } from "../models/User";
import { HttpException } from "../utils/httpException";

const dateRangeSchema = z
  .object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })
  .refine((data) => {
    if (!data.startDate && !data.endDate) return true;
    if (!data.startDate || !data.endDate) return false;
    return new Date(data.startDate) <= new Date(data.endDate);
  }, "Provide both startDate and endDate with startDate <= endDate");

const timeSummaryQuerySchema = z.object({
  projectId: z.string().optional(),
  userId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const projectPerformanceQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  onlyActive: z.coerce.boolean().optional(),
});

const vacationSummaryQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.nativeEnum(VacationRequestStatus).optional(),
});

const userWorkloadQuerySchema = z.object({
  projectId: z.string().optional(),
  userId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
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

export const reportController = {
  async timeSummary(req: AuthenticatedRequest, res: Response) {
    const filters = timeSummaryQuerySchema.parse(req.query);
    const { tenantId, actor } = getContext(req);
    const result = await reportService.getTimeSummary(tenantId, filters, actor);
    return res.json(result);
  },

  async projectPerformance(req: AuthenticatedRequest, res: Response) {
    const filters = projectPerformanceQuerySchema.parse(req.query);
    const { tenantId, actor } = getContext(req);
    const result = await reportService.getProjectPerformance(tenantId, filters, actor);
    return res.json(result);
  },

  async vacationSummary(req: AuthenticatedRequest, res: Response) {
    const filters = vacationSummaryQuerySchema.parse(req.query);
    const { tenantId, actor } = getContext(req);
    const result = await reportService.getVacationSummary(tenantId, filters, actor);
    return res.json(result);
  },

  async userWorkload(req: AuthenticatedRequest, res: Response) {
    const filters = userWorkloadQuerySchema.parse(req.query);
    const { tenantId, actor } = getContext(req);
    const result = await reportService.getUserWorkload(tenantId, filters, actor);
    return res.json(result);
  },
};
