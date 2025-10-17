import type { Response } from "express";
import { z } from "zod";
import { UserRole, UserStatus } from "../models/User";
import { userService } from "../services/userService";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";
import { HttpException } from "../utils/httpException";

const listQuerySchema = z.object({
  status: z.nativeEnum(UserStatus).optional(),
  role: z.nativeEnum(UserRole).optional(),
  search: z.string().trim().optional(),
  clientId: z.string().trim().optional(),
  projectId: z.string().trim().optional(),
});

const emergencyContactSchema = z
  .object({
    name: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    relationship: z.string().trim().optional(),
  })
  .partial();

const personalInfoSchema = z
  .object({
    nationality: z.string().trim().optional(),
    maritalStatus: z.string().trim().optional(),
    educationLevel: z.string().trim().optional(),
    emergencyContact: emergencyContactSchema.nullish(),
  })
  .partial();

const bankInfoSchema = z
  .object({
    bankName: z.string().trim().optional(),
    accountType: z.string().trim().optional(),
    accountNumber: z.string().trim().optional(),
    agency: z.string().trim().optional(),
  })
  .partial();


const documentSchema = z.object({
  type: z.string().trim().optional(),
  number: z.string().trim().optional(),
  issueDate: z.string().trim().optional().nullable(),
  expiryDate: z.string().trim().optional().nullable(),
  issuer: z.string().trim().optional(),
  fileUrl: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

const benefitSchema = z.object({
  name: z.string().trim().optional(),
  provider: z.string().trim().optional(),
  status: z.string().trim().optional(),
  joinDate: z.string().trim().optional().nullable(),
  endDate: z.string().trim().optional().nullable(),
  contribution: z.union([z.string().trim(), z.number()]).optional().nullable(),
  notes: z.string().trim().optional(),
});

const dependentSchema = z.object({
  name: z.string().trim().optional(),
  relationship: z.string().trim().optional(),
  birthDate: z.string().trim().optional().nullable(),
  document: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

const employmentHistorySchema = z.object({
  company: z.string().trim().optional(),
  role: z.string().trim().optional(),
  startDate: z.string().trim().optional().nullable(),
  endDate: z.string().trim().optional().nullable(),
  responsibilities: z.string().trim().optional(),
  achievements: z.string().trim().optional(),
  technologies: z.array(z.string().trim()).optional().nullable(),
  location: z.string().trim().optional(),
});

const skillSchema = z.object({
  name: z.string().trim().optional(),
  level: z.string().trim().optional(),
  category: z.string().trim().optional(),
  certified: z.union([z.boolean(), z.string().trim(), z.number()]).optional().nullable(),
  certificationAuthority: z.string().trim().optional(),
  issuedAt: z.string().trim().optional().nullable(),
  expiresAt: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional(),
});

const addressSchema = z
  .object({
    street: z.string().trim().optional(),
    number: z.string().trim().optional(),
    complement: z.string().trim().optional(),
    neighborhood: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    zipCode: z.string().trim().optional(),
  })
  .partial();

const workScheduleDaySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  enabled: z.boolean().optional(),
  hours: z.number().min(0).max(24),
});

const workScheduleSchema = z
  .object({
    days: z
      .array(workScheduleDaySchema)
      .min(1)
      .refine(
        (days) => {
          const unique = new Set(days.map((day) => day.dayOfWeek));
          return unique.size === days.length;
        },
        { message: "Duplicate dayOfWeek entries are not allowed" }
      ),
  })
  .partial();

const baseUserSchema = z.object({
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  photo: z.string().trim().optional().nullable(),
  hireDate: z.string().trim().optional().nullable(),
  terminationDate: z.string().trim().optional().nullable(),
  cpf: z.string().trim().optional().nullable(),
  birthDate: z.string().trim().optional().nullable(),
  phone: z.string().trim().optional().nullable(),
  position: z.string().trim().optional().nullable(),
  department: z.string().trim().optional().nullable(),
  contractType: z.string().trim().optional().nullable(),
  workSchedule: workScheduleSchema.optional().nullable(),
  address: addressSchema.optional().nullable(),
  managerId: z.string().trim().optional().nullable(),
  additionalNotes: z.string().trim().optional().nullable(),
  workStartTime: z.string().trim().optional().nullable(),
  workEndTime: z.string().trim().optional().nullable(),
  selectedClients: z.array(z.string().trim()).optional().nullable(),
  selectedProjects: z.array(z.string().trim()).optional().nullable(),
  personalInfo: personalInfoSchema.optional().nullable(),
  bankInfo: bankInfoSchema.optional().nullable(),
  documents: z.array(documentSchema).optional().nullable(),
  benefits: z.array(benefitSchema).optional().nullable(),
  dependents: z.array(dependentSchema).optional().nullable(),
  employmentHistory: z.array(employmentHistorySchema).optional().nullable(),
  skills: z.array(skillSchema).optional().nullable(),
});

const createUserSchema = baseUserSchema.extend({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const updateUserSchema = baseUserSchema.extend({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
});

const paramsSchema = z.object({
  id: z.string().min(1),
});

const assignRoleSchema = z.object({
  roleId: z.string().trim().min(1).optional().nullable(),
});

const ensureTenant = (req: AuthenticatedRequest) => {
  const tenantId = req.tenantId;
  if (!tenantId) {
    throw new HttpException(403, "Tenant context missing");
  }
  return tenantId;
};

export const userController = {
  async me(req: AuthenticatedRequest, res: Response) {
    const userId = req.userId;
    if (!userId) {
      throw new HttpException(401, "Unauthorized");
    }
    const tenantId = ensureTenant(req);
    const user = await userService.getUserById(tenantId, userId);
    return res.json(user);
  },

  async list(req: AuthenticatedRequest, res: Response) {
    const tenantId = ensureTenant(req);
    const filters = listQuerySchema.parse(req.query);
    const users = await userService.listUsers(tenantId, filters);
    return res.json(users);
  },

  async get(req: AuthenticatedRequest, res: Response) {
    const tenantId = ensureTenant(req);
    const { id } = paramsSchema.parse(req.params);
    const user = await userService.getUserById(tenantId, id);
    return res.json(user);
  },

  async create(req: AuthenticatedRequest, res: Response) {
    const tenantId = ensureTenant(req);
    const payload = createUserSchema.parse(req.body);
    const user = await userService.createUser(payload, tenantId);
    return res.status(201).json(user);
  },

  async update(req: AuthenticatedRequest, res: Response) {
    const tenantId = ensureTenant(req);
    const { id } = paramsSchema.parse(req.params);
    const payload = updateUserSchema.parse(req.body);
    const user = await userService.updateUser(tenantId, id, payload);
    return res.json(user);
  },

  async remove(req: AuthenticatedRequest, res: Response) {
    const tenantId = ensureTenant(req);
    const { id } = paramsSchema.parse(req.params);
    await userService.deleteUser(tenantId, id);
    return res.status(204).send();
  },

  async assignRole(req: AuthenticatedRequest, res: Response) {
    const tenantId = ensureTenant(req);
    const { id } = paramsSchema.parse(req.params);
    const { roleId } = assignRoleSchema.parse(req.body ?? {});
    const user = await userService.assignRole(tenantId, id, roleId ?? null);
    return res.json(user);
  },
};
