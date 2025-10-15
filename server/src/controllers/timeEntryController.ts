import type { Response } from "express";
import { z } from "zod";
import { timeEntryService } from "../services/timeEntryService";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";
import { HttpException } from "../utils/httpException";

const listQuerySchema = z.object({
  userId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const allocationSchema = z.object({
  projectId: z.string().min(1).optional(),
  description: z.union([z.string(), z.null()]).optional(),
  hours: z.coerce.number().min(0),
});

const timeEntryBaseSchema = z.object({
  userId: z.string().min(1),
  date: z.string().min(1),
  entrada1: z.union([z.string(), z.null()]).optional(),
  saida1: z.union([z.string(), z.null()]).optional(),
  entrada2: z.union([z.string(), z.null()]).optional(),
  saida2: z.union([z.string(), z.null()]).optional(),
  entrada3: z.union([z.string(), z.null()]).optional(),
  saida3: z.union([z.string(), z.null()]).optional(),
  totalHours: z.union([z.string(), z.null()]).optional(),
  notes: z.union([z.string(), z.null()]).optional(),
  allocations: z.array(allocationSchema).optional(),
});

const createSchema = timeEntryBaseSchema;

const updateSchema = timeEntryBaseSchema.partial();

const ensureTenant = (req: AuthenticatedRequest) => {
  const tenantId = req.tenantId;
  if (!tenantId) {
    throw new HttpException(403, "Tenant context missing");
  }
  return tenantId;
};

export const timeEntryController = {
  async list(req: AuthenticatedRequest, res: Response) {
    const tenantId = ensureTenant(req);
    const query = listQuerySchema.parse(req.query);
    const entries = await timeEntryService.listEntries(tenantId, query);
    return res.json(entries);
  },

  async get(req: AuthenticatedRequest, res: Response) {
    const tenantId = ensureTenant(req);
    const entry = await timeEntryService.getEntryById(tenantId, req.params.id);
    return res.json(entry);
  },

  async create(req: AuthenticatedRequest, res: Response) {
    const tenantId = ensureTenant(req);
    const payload = createSchema.parse(req.body);
    const entry = await timeEntryService.createEntry(tenantId, payload);
    return res.status(201).json(entry);
  },

  async update(req: AuthenticatedRequest, res: Response) {
    const tenantId = ensureTenant(req);
    const payload = updateSchema.parse(req.body);
    const entry = await timeEntryService.updateEntry(tenantId, req.params.id, payload);
    return res.json(entry);
  },

  async remove(req: AuthenticatedRequest, res: Response) {
    const tenantId = ensureTenant(req);
    await timeEntryService.deleteEntry(tenantId, req.params.id);
    return res.status(204).send();
  },
};
