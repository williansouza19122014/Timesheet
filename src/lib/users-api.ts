import { apiFetch } from "./api-client";
import type { AuthRole } from "./auth-api";

export type UserStatus = "ACTIVE" | "INACTIVE";

export interface UserAddress {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface WorkScheduleInfo {
  startTime?: string;
  endTime?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
  status: UserStatus;
  photo?: string;
  hireDate?: string;
  terminationDate?: string;
  cpf?: string;
  birthDate?: string;
  phone?: string;
  position?: string;
  department?: string;
  contractType?: string;
  workSchedule?: WorkScheduleInfo;
  workStartTime?: string;
  workEndTime?: string;
  address?: UserAddress;
  additionalNotes?: string;
  selectedClients?: string[];
  selectedProjects?: string[];
  managerId?: string;
  createdAt: string;
  updatedAt: string;
}

export type UpdateUserPayload = Partial<{
  name: string;
  email: string;
  phone: string | null;
  position: string | null;
  department: string | null;
  contractType: string | null;
  workSchedule: WorkScheduleInfo | null;
  workStartTime: string | null;
  workEndTime: string | null;
  address: UserAddress | null;
  additionalNotes: string | null;
  photo: string | null;
  password: string;
  terminationDate: string | null;
  status: UserStatus;
}>;

export async function fetchCurrentUserProfile() {
  return apiFetch<UserProfile>("/api/users/me");
}

export async function updateUserProfile(userId: string, payload: UpdateUserPayload) {
  return apiFetch<UserProfile>(`/api/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export interface ListUsersQuery {
  status?: UserStatus;
  role?: AuthRole;
  search?: string;
}

export async function listUsers(query: ListUsersQuery = {}) {
  const searchParams = new URLSearchParams();
  if (query.status) searchParams.set("status", query.status);
  if (query.role) searchParams.set("role", query.role);
  if (query.search) searchParams.set("search", query.search);
  const queryString = searchParams.toString();
  const url = queryString ? `/api/users?${queryString}` : "/api/users";
  return apiFetch<UserProfile[]>(url);
}
