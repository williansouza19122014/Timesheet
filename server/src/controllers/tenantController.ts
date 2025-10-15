import type { Request, Response } from "express";
import { z } from "zod";
import { tenantService } from "../services/tenantService";

const registerSchema = z.object({
  companyName: z.string().min(2, "companyName must be at least 2 characters"),
  masterEmail: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const tenantController = {
  async register(req: Request, res: Response) {
    const payload = registerSchema.parse(req.body);
    const result = await tenantService.registerTenant(payload);
    return res.status(201).json({
      tenantId: result.tenantId,
      userId: result.userId,
      token: result.token,
      role: result.role.toLowerCase(),
      permissions: result.permissions,
    });
  },
};
