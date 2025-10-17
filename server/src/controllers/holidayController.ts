import type { Response } from "express";
import { z } from "zod";
import { holidayService } from "../services/holidayService";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";
import { HttpException } from "../utils/httpException";

const querySchema = z.object({
  year: z
    .preprocess((value) => (value === undefined ? undefined : Number(value)), z.number().int().optional())
    .optional(),
});

const holidayBodySchema = z.object({
  name: z.string().trim().min(1, "Holiday name is required"),
  date: z.string().trim().min(1, "Holiday date is required"),
  isRecurring: z.boolean().optional(),
});

const paramsSchema = z.object({
  id: z.string().trim().min(1),
});

const ensureTenant = (req: AuthenticatedRequest) => {
  const tenantId = req.tenantId;
  if (!tenantId) {
    throw new HttpException(403, "Tenant context missing");
  }
  return tenantId;
};

export const holidayController = {
  async list(req: AuthenticatedRequest, res: Response) {
    const tenantId = ensureTenant(req);
    const filters = querySchema.parse(req.query ?? {});
    const holidays = await holidayService.listHolidays(tenantId, filters);
    return res.json(holidays);
  },

  async create(req: AuthenticatedRequest, res: Response) {
    const tenantId = ensureTenant(req);
    const payload = holidayBodySchema.parse(req.body);
    const holiday = await holidayService.createHoliday(tenantId, payload);
    return res.status(201).json(holiday);
  },

  async update(req: AuthenticatedRequest, res: Response) {
    const tenantId = ensureTenant(req);
    const { id } = paramsSchema.parse(req.params);
    const payload = holidayBodySchema.partial().refine(
      (data) => Object.keys(data).length > 0,
      { message: "At least one field must be provided" }
    ).parse(req.body ?? {});
    const holiday = await holidayService.updateHoliday(tenantId, id, payload);
    return res.json(holiday);
  },

  async remove(req: AuthenticatedRequest, res: Response) {
    const tenantId = ensureTenant(req);
    const { id } = paramsSchema.parse(req.params);
    await holidayService.deleteHoliday(tenantId, id);
    return res.status(204).send();
  },
};
