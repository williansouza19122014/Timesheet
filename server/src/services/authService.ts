import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import { UserModel, UserRole, type UserDoc } from "../models/User";
import { HttpException } from "../utils/httpException";
import { TenantModel } from "../models/Tenant";
import { RoleModel } from "../models/Role";
import { generateToken, verifyToken } from "../utils/jwt";

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

const DEFAULT_ROLES = [
  { name: "ADMIN", permissions: ["*"] },
  { name: "MANAGER", permissions: [] },
  { name: "EMPLOYEE", permissions: [] },
] as const;

async function resolveUserRole(user: UserDoc) {
  if (!user.tenantId) {
    throw new HttpException(400, "User is not associated with a tenant");
  }

  const tenantId =
    user.tenantId instanceof Types.ObjectId ? user.tenantId : new Types.ObjectId(user.tenantId);

  let roleDoc = user.roleId
    ? await RoleModel.findOne({ _id: user.roleId, tenantId })
    : null;

  if (!roleDoc) {
    roleDoc = await RoleModel.findOne({ tenantId, name: user.role });
  }

  const roleName = roleDoc?.name ?? user.role ?? UserRole.EMPLOYEE;
  const permissions = roleDoc?.permissions ?? [];

  return { roleName, permissions };
}

function mapUser(user: UserDoc, roleName: string, permissions: string[]) {
  return {
    id: user.id,
    tenantId: user.tenantId?.toString(),
    name: user.name,
    email: user.email,
    role: roleName,
    permissions,
    photo: user.photo ?? undefined,
    position: user.position ?? undefined,
    department: user.department ?? undefined,
  };
}

function buildAuthResponse(user: UserDoc, token: string, roleName: string, permissions: string[]) {
  return {
    token,
    user: mapUser(user, roleName, permissions),
  };
}

export const authService = {
  async register(payload: RegisterPayload) {
    const existing = await UserModel.findOne({ email: payload.email });
    if (existing) {
      throw new HttpException(409, "Conta ja existe");
    }

    const tenant = await TenantModel.create({
      name: payload.name,
      plan: "FREE",
    });

    const createdRoles = await RoleModel.insertMany(
      DEFAULT_ROLES.map((role) => ({
        tenantId: tenant._id,
        name: role.name,
        permissions: role.permissions,
      }))
    );

    const adminRole = createdRoles.find((role) => role.name === "ADMIN");
    if (!adminRole) {
      throw new HttpException(500, "Failed to create admin role");
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);

    const user = await UserModel.create({
      tenantId: tenant._id,
      name: payload.name,
      email: payload.email,
      passwordHash,
      role: UserRole.ADMIN,
      roleId: adminRole._id,
      isMaster: true,
    });

    const tokenPayload = {
      userId: user.id,
      tenantId: tenant._id.toString(),
      role: adminRole.name,
      permissions: adminRole.permissions,
    };

    const token = generateToken(tokenPayload);

    return buildAuthResponse(user, token, tokenPayload.role, tokenPayload.permissions);
  },

  async login(payload: LoginPayload) {
    const user = await UserModel.findOne({ email: payload.email });
    if (!user) {
      throw new HttpException(401, "Invalid credentials");
    }

    const passwordMatch = await bcrypt.compare(payload.password, user.passwordHash);
    if (!passwordMatch) {
      throw new HttpException(401, "Invalid credentials");
    }

    if (!user.tenantId) {
      throw new HttpException(400, "User tenant configuration missing");
    }

    const { roleName, permissions } = await resolveUserRole(user);

    const token = generateToken({
      userId: user.id,
      tenantId: user.tenantId.toString(),
      role: roleName,
      permissions,
    });

    return buildAuthResponse(user, token, roleName, permissions);
  },

  async getProfile(token: string) {
    const payload = verifyToken(token);

    const user = await UserModel.findOne({
      _id: payload.userId,
      tenantId: payload.tenantId,
    });

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    const { roleName, permissions } = await resolveUserRole(user);

    return {
      user: mapUser(user, roleName, permissions),
    };
  },
};
