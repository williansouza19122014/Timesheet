import type { Response } from "express";
import { z } from "zod";
import { clientService } from "../services/clientService";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";
import { HttpException } from "../utils/httpException";

const createSchema = z.object({
  name: z.string().min(2),
  cnpj: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const updateSchema = createSchema.partial();

const ensureTenant = (req: AuthenticatedRequest) => {
  const tenantId = req.tenantId;
  if (!tenantId) {
    throw new HttpException(403, "Tenant context missing");
  }
  return tenantId;
};

export const clientController = {
  async list(req: AuthenticatedRequest, res: Response) {
    const tenantId = ensureTenant(req);
    const clients = await clientService.listClients(tenantId);
    return res.json(clients);
  },

  async get(req: AuthenticatedRequest, res: Response) {
    const tenantId = ensureTenant(req);
    const client = await clientService.getClientById(tenantId, req.params.id);
    return res.json(client);
  },

  async create(req: AuthenticatedRequest, res: Response) {
    const tenantId = ensureTenant(req);
    const payload = createSchema.parse(req.body);
    const client = await clientService.createClient(tenantId, payload);
    return res.status(201).json(client);
  },

  async update(req: AuthenticatedRequest, res: Response) {
    const tenantId = ensureTenant(req);
    const payload = updateSchema.parse(req.body);
    const client = await clientService.updateClient(tenantId, req.params.id, payload);
    return res.json(client);
  },

  async remove(req: AuthenticatedRequest, res: Response) {
    const tenantId = ensureTenant(req);
    await clientService.deleteClient(tenantId, req.params.id);
    return res.status(204).send();
  },
};
