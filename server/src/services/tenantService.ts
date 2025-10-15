import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import { TenantModel } from "../models/Tenant";
import { RoleModel } from "../models/Role";
import { UserModel, UserRole, UserStatus, type UserDoc } from "../models/User";
import { HttpException } from "../utils/httpException";
import { generateToken } from "../utils/jwt";

type TenantRegisterInput = {
  companyName: string;
  masterEmail: string;
  password: string;
};

type TenantRegisterResult = {
  tenantId: string;
  userId: string;
  token: string;
  role: string;
  permissions: string[];
  user: UserDoc;
};

const DEFAULT_ROLE_SEED: Array<{ name: string; permissions: string[] }> = [
  { name: "ADMIN", permissions: ["*"] },
  {
    name: "MANAGER",
    permissions: [
      "projects.create",
      "projects.update",
      "projects.members.manage",
      "projects.view",
      "clients.create",
      "clients.update",
      "clients.view",
      "vacations.view",
      "reports.view",
    ],
  },
  {
    name: "EMPLOYEE",
    permissions: ["projects.view", "clients.view", "vacations.view"],
  },
  { name: "USER", permissions: [] },
];

const normalizeCompanyName = (name: string) => name.trim();

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const tenantService = {
  async registerTenant(input: TenantRegisterInput): Promise<TenantRegisterResult> {
    const companyName = normalizeCompanyName(input.companyName);
    if (!companyName) {
      throw new HttpException(400, "Company name is required");
    }

    const masterEmail = normalizeEmail(input.masterEmail);
    if (!masterEmail) {
      throw new HttpException(400, "Master email is required");
    }

    const existingUser = await UserModel.findOne({ email: masterEmail });
    if (existingUser) {
      throw new HttpException(409, "E-mail already registered");
    }

    const existingTenant = await TenantModel.findOne({ name: companyName });
    if (existingTenant) {
      throw new HttpException(409, "Tenant already exists");
    }

    let tenantId: Types.ObjectId | null = null;
    let createdRolesIds: Types.ObjectId[] = [];

    try {
      const tenant = await TenantModel.create({
        name: companyName,
        plan: "FREE",
      });

      tenantId =
        tenant._id instanceof Types.ObjectId
          ? tenant._id
          : new Types.ObjectId(String(tenant._id));

      const createdRoles = await RoleModel.insertMany(
        DEFAULT_ROLE_SEED.map((role) => ({
          tenantId,
          name: role.name,
          permissions: [...role.permissions],
        }))
      );
      createdRolesIds = createdRoles.map((role) => role._id as Types.ObjectId);

      const adminRole = createdRoles.find((role) => role.name === "ADMIN");
      if (!adminRole) {
        throw new HttpException(500, "Failed to create admin role");
      }

      const passwordHash = await bcrypt.hash(input.password, 10);
      const displayName = companyName || masterEmail;

      const masterUser = await UserModel.create({
        tenantId,
        email: masterEmail,
        name: displayName,
        passwordHash,
        role: UserRole.ADMIN,
        roleId: adminRole._id,
        status: UserStatus.ACTIVE,
        isMaster: true,
      });

      const tokenPayload = {
        userId: masterUser.id,
        tenantId: tenantId.toString(),
        role: adminRole.name,
        permissions: [...adminRole.permissions],
      };

      const token = generateToken(tokenPayload);

      return {
        tenantId: tenantId.toString(),
        userId: masterUser.id,
        token,
        role: adminRole.name,
        permissions: [...adminRole.permissions],
        user: masterUser,
      };
    } catch (error) {
      if (tenantId) {
        await Promise.all([
          TenantModel.deleteOne({ _id: tenantId }).catch(() => undefined),
          createdRolesIds.length
            ? RoleModel.deleteMany({ _id: { $in: createdRolesIds } }).catch(() => undefined)
            : Promise.resolve(),
        ]);
      }
      throw error;
    }
  },
};
