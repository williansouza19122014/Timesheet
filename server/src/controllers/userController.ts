import type { Request, Response } from "express";
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

const workScheduleSchema = z
  .object({
    startTime: z.string().trim().optional(),
    endTime: z.string().trim().optional(),
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

export const userController = {
  async me(req: AuthenticatedRequest, res: Response) {
    const userId = req.userId;
    if (!userId) {
      throw new HttpException(401, "Unauthorized");
    }
    const user = await userService.getUserById(userId);
    return res.json(user);
  },

  async list(req: Request, res: Response) {
    const filters = listQuerySchema.parse(req.query);
    const users = await userService.listUsers(filters);
    return res.json(users);
  },

  async get(req: Request, res: Response) {
    const { id } = paramsSchema.parse(req.params);
    const user = await userService.getUserById(id);
    return res.json(user);
  },

  async create(req: AuthenticatedRequest, res: Response) {
    const tenantId = req.tenantId;
    if (!tenantId) {
      throw new HttpException(403, "Tenant context missing");
    }
    const payload = createUserSchema.parse(req.body);
    const user = await userService.createUser(payload, tenantId);
    return res.status(201).json(user);
  },

  async update(req: Request, res: Response) {
    const { id } = paramsSchema.parse(req.params);
    const payload = updateUserSchema.parse(req.body);
    const user = await userService.updateUser(id, payload);
    return res.json(user);
  },

  async remove(req: Request, res: Response) {
    const { id } = paramsSchema.parse(req.params);
    await userService.deleteUser(id);
    return res.status(204).send();
  },
};
