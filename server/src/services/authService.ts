import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import { UserModel, UserRole, type UserDoc } from "../models/User";
import { RoleModel } from "../models/Role";
import { HttpException } from "../utils/httpException";
import { generateToken, verifyToken } from "../utils/jwt";
import { tenantService } from "./tenantService";

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

async function resolveUserRole(user: UserDoc) {
  if (!user.tenantId) {
    throw new HttpException(400, "User is not associated with a tenant");
  }

  const tenantId =
    user.tenantId instanceof Types.ObjectId ? user.tenantId : new Types.ObjectId(user.tenantId);

  const roleDoc = user.roleId
    ? await RoleModel.findOne({ _id: user.roleId, tenantId })
    : await RoleModel.findOne({ tenantId, name: user.role });

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
    isMaster: Boolean(user.isMaster),
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
    const result = await tenantService.registerTenant({
      companyName: payload.name,
      masterEmail: payload.email,
      password: payload.password,
    });

    return buildAuthResponse(result.user, result.token, result.role, result.permissions);
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
      permissions: [...permissions],
    });

    return buildAuthResponse(user, token, roleName, [...permissions]);
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

    const normalizedPermissions = [...permissions];

    return {
      user: mapUser(user, roleName, normalizedPermissions),
    };
  },
};
