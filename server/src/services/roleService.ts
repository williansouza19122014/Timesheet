import { Types } from "mongoose";
import { RoleModel, type RoleDoc } from "../models/Role";
import { HttpException } from "../utils/httpException";

type RoleInput = {
  name: string;
  permissions?: string[];
};

const normalizeName = (name: string) => name.trim().toUpperCase();

const normalizePermissions = (permissions?: string[]) => {
  if (!permissions) return [];
  return Array.from(
    new Set(
      permissions
        .map((permission) => permission?.trim())
        .filter((permission): permission is string => Boolean(permission))
    )
  );
};

const mapRole = (role: RoleDoc) => {
  const rawId = role._id as unknown;
  const id =
    rawId instanceof Types.ObjectId
      ? rawId.toString()
      : typeof rawId === "string"
        ? rawId
        : String(rawId);

  return {
    id,
    name: role.name,
    permissions: [...role.permissions],
    createdAt: role.createdAt.toISOString(),
    updatedAt: role.updatedAt.toISOString(),
  };
};

export const roleService = {
  async listRoles(tenantId: string) {
    if (!Types.ObjectId.isValid(tenantId)) {
      throw new HttpException(400, "Invalid tenant context");
    }
    const roles = await RoleModel.find({ tenantId }).sort({ name: 1 });
    return roles.map((role) => mapRole(role));
  },

  async createRole(tenantId: string, input: RoleInput) {
    if (!Types.ObjectId.isValid(tenantId)) {
      throw new HttpException(400, "Invalid tenant context");
    }

    const name = normalizeName(input.name);
    if (!name) {
      throw new HttpException(400, "Role name is required");
    }

    const permissions = normalizePermissions(input.permissions);

    const existing = await RoleModel.findOne({ tenantId, name });
    if (existing) {
      throw new HttpException(409, "Role already exists for this tenant");
    }

    const role = await RoleModel.create({
      tenantId,
      name,
      permissions,
    });

    return mapRole(role);
  },
};
