import { apiFetch } from "./api-client";

export type RoleResponse = {
  id: string;
  name: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
};

export type CreateRolePayload = {
  name: string;
  permissions?: string[];
};

export const listRoles = () => apiFetch<RoleResponse[]>("/api/roles");

export const createRole = (payload: CreateRolePayload) =>
  apiFetch<RoleResponse>("/api/roles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
