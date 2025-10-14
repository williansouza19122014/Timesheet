import type { Request, Response } from "express";
import { z } from "zod";
import { timeEntryService } from "../services/timeEntryService";

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

export const timeEntryController = {
  async list(req: Request, res: Response) {
    const query = listQuerySchema.parse(req.query);
    const entries = await timeEntryService.listEntries(query);
    return res.json(entries);
  },

  async get(req: Request, res: Response) {
    const entry = await timeEntryService.getEntryById(req.params.id);
    return res.json(entry);
  },

  async create(req: Request, res: Response) {
    const payload = createSchema.parse(req.body);
    const entry = await timeEntryService.createEntry(payload);
    return res.status(201).json(entry);
  },

  async update(req: Request, res: Response) {
    const payload = updateSchema.parse(req.body);
    const entry = await timeEntryService.updateEntry(req.params.id, payload);
    return res.json(entry);
  },

  async remove(req: Request, res: Response) {
    await timeEntryService.deleteEntry(req.params.id);
    return res.status(204).send();
  },
};
