import type { Response } from "express";
import { z } from "zod";
import { vacationService } from "../services/vacationService";
import { VacationRequestStatus } from "../models/Vacation";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";
import { HttpException } from "../utils/httpException";

// ==================== VALIDATION SCHEMAS ====================

const vacationPeriodCreateSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  daysAvailable: z.number().int().positive("Days available must be positive"),
  contractType: z.string().optional().default("CLT"),
});

const vacationPeriodUpdateSchema = vacationPeriodCreateSchema.partial();

const vacationPeriodQuerySchema = z.object({
  userId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const vacationRequestCreateSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  vacationPeriodId: z.string().min(1, "Vacation period ID is required"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  daysTaken: z.number().int().min(0, "Days taken must be non-negative"),
  soldDays: z.number().int().min(0, "Sold days must be non-negative").optional().default(0),
  comments: z.string().optional(),
});

const vacationRequestUpdateSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  daysTaken: z.number().int().min(0).optional(),
  soldDays: z.number().int().min(0).optional(),
  status: z.enum([
    VacationRequestStatus.PENDING,
    VacationRequestStatus.APPROVED,
    VacationRequestStatus.REJECTED,
    VacationRequestStatus.CANCELLED,
  ]).optional(),
  comments: z.string().optional(),
});

const vacationRequestQuerySchema = z.object({
  userId: z.string().optional(),
  status: z.enum([
    VacationRequestStatus.PENDING,
    VacationRequestStatus.APPROVED,
    VacationRequestStatus.REJECTED,
    VacationRequestStatus.CANCELLED,
  ]).optional(),
  vacationPeriodId: z.string().optional(),
});

const ensureTenant = (req: AuthenticatedRequest) => {
  const tenantId = req.tenantId;
  if (!tenantId) {
    throw new HttpException(403, "Tenant context missing");
  }
  return tenantId;
};

// ==================== CONTROLLERS ====================

export const vacationController = {
  // ==================== VACATION PERIODS ====================

  /**
   * GET /api/vacations/periods
   * List vacation periods with optional filters
   */
  async listPeriods(req: AuthenticatedRequest, res: Response) {
    const tenantId = ensureTenant(req);
    const query = vacationPeriodQuerySchema.parse(req.query);
    const periods = await vacationService.listPeriods(tenantId, query);
    return res.json(periods);
  },

  /**
   * GET /api/vacations/periods/:id
   * Get a specific vacation period
   */
  async getPeriod(req: AuthenticatedRequest, res: Response) {
    const tenantId = ensureTenant(req);
    const period = await vacationService.getPeriodById(tenantId, req.params.id);
    return res.json(period);
  },

  /**
   * POST /api/vacations/periods
   * Create a new vacation period
   */
  async createPeriod(req: AuthenticatedRequest, res: Response) {
    const tenantId = ensureTenant(req);
    const payload = vacationPeriodCreateSchema.parse(req.body);
    const period = await vacationService.createPeriod(tenantId, payload);
    return res.status(201).json(period);
  },

  /**
   * PUT /api/vacations/periods/:id
   * Update a vacation period
   */
  async updatePeriod(req: AuthenticatedRequest, res: Response) {
    const tenantId = ensureTenant(req);
    const payload = vacationPeriodUpdateSchema.parse(req.body);
    const period = await vacationService.updatePeriod(tenantId, req.params.id, payload);
    return res.json(period);
  },

  /**
   * DELETE /api/vacations/periods/:id
   * Delete a vacation period
   */
  async deletePeriod(req: AuthenticatedRequest, res: Response) {
    const tenantId = ensureTenant(req);
    await vacationService.deletePeriod(tenantId, req.params.id);
    return res.status(204).send();
  },

  // ==================== VACATION REQUESTS ====================

  /**
   * GET /api/vacations/requests
   * List vacation requests with optional filters
   */
  async listRequests(req: AuthenticatedRequest, res: Response) {
    const tenantId = ensureTenant(req);
    const query = vacationRequestQuerySchema.parse(req.query);
    const requests = await vacationService.listRequests(tenantId, query);
    return res.json(requests);
  },

  /**
   * GET /api/vacations/requests/:id
   * Get a specific vacation request
   */
  async getRequest(req: AuthenticatedRequest, res: Response) {
    const tenantId = ensureTenant(req);
    const request = await vacationService.getRequestById(tenantId, req.params.id);
    return res.json(request);
  },

  /**
   * POST /api/vacations/requests
   * Create a new vacation request
   */
  async createRequest(req: AuthenticatedRequest, res: Response) {
    const tenantId = ensureTenant(req);
    const payload = vacationRequestCreateSchema.parse(req.body);
    const request = await vacationService.createRequest(tenantId, payload);
    return res.status(201).json(request);
  },

  /**
   * PUT /api/vacations/requests/:id
   * Update a vacation request (including approval/rejection)
   */
  async updateRequest(req: AuthenticatedRequest, res: Response) {
    const tenantId = ensureTenant(req);
    const payload = vacationRequestUpdateSchema.parse(req.body);
    const request = await vacationService.updateRequest(tenantId, req.params.id, payload);
    return res.json(request);
  },

  /**
   * POST /api/vacations/requests/:id/cancel
   * Cancel a vacation request
   */
  async cancelRequest(req: AuthenticatedRequest, res: Response) {
    const tenantId = ensureTenant(req);
    const request = await vacationService.cancelRequest(tenantId, req.params.id);
    return res.json(request);
  },

  /**
   * DELETE /api/vacations/requests/:id
   * Delete a vacation request (hard delete)
   */
  async deleteRequest(req: AuthenticatedRequest, res: Response) {
    const tenantId = ensureTenant(req);
    await vacationService.deleteRequest(tenantId, req.params.id);
    return res.status(204).send();
  },
};
