import { apiFetch } from "./api-client";

export interface ProjectCreatePayload {
  clientId: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface ProjectApi {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export async function createProject(payload: ProjectCreatePayload) {
  return apiFetch<ProjectApi>("/api/projects", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
