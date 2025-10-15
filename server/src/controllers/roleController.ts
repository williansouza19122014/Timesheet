import type { Response } from "express";
import { z } from "zod";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";
import { HttpException } from "../utils/httpException";
import { roleService } from "../services/roleService";

const createRoleSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters"),
  permissions: z.array(z.string().trim().min(1)).optional(),
});

export const roleController = {
  async list(req: AuthenticatedRequest, res: Response) {
    const tenantId = req.tenantId;
    if (!tenantId) {
      throw new HttpException(403, "Tenant context missing");
    }
    const roles = await roleService.listRoles(tenantId);
    return res.json(roles);
  },

  async create(req: AuthenticatedRequest, res: Response) {
    const tenantId = req.tenantId;
    if (!tenantId) {
      throw new HttpException(403, "Tenant context missing");
    }
    const payload = createRoleSchema.parse(req.body);
    const role = await roleService.createRole(tenantId, payload);
    return res.status(201).json(role);
  },
};
