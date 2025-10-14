import { apiFetch } from "./api-client";

export interface TimeEntryAllocationApi {
  id: string;
  projectId?: string;
  projectName?: string;
  description?: string;
  hours: number;
}

export interface TimeEntryApi {
  id: string;
  userId: string;
  date: string;
  entrada1?: string;
  saida1?: string;
  entrada2?: string;
  saida2?: string;
  entrada3?: string;
  saida3?: string;
  totalHours?: string;
  notes?: string;
  allocations: TimeEntryAllocationApi[];
  createdAt: string;
  updatedAt: string;
}

export interface ListTimeEntriesParams {
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export interface TimeEntryAllocationPayload {
  projectId?: string;
  description?: string | null;
  hours: number;
}

export interface CreateTimeEntryPayload {
  userId: string;
  date: string;
  entrada1?: string | null;
  saida1?: string | null;
  entrada2?: string | null;
  saida2?: string | null;
  entrada3?: string | null;
  saida3?: string | null;
  totalHours?: string | null;
  notes?: string | null;
  allocations?: TimeEntryAllocationPayload[];
}

export type UpdateTimeEntryPayload = Partial<CreateTimeEntryPayload>;

const buildQueryString = (params: ListTimeEntriesParams) => {
  const searchParams = new URLSearchParams();
  if (params.userId) searchParams.set("userId", params.userId);
  if (params.startDate) searchParams.set("startDate", params.startDate);
  if (params.endDate) searchParams.set("endDate", params.endDate);
  return searchParams.toString();
};

export async function listTimeEntries(params: ListTimeEntriesParams = {}) {
  const query = buildQueryString(params);
  const url = query ? `/api/timesheet?${query}` : "/api/timesheet";
  return apiFetch<TimeEntryApi[]>(url);
}

export async function createTimeEntry(payload: CreateTimeEntryPayload) {
  return apiFetch<TimeEntryApi>("/api/timesheet", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateTimeEntry(entryId: string, payload: UpdateTimeEntryPayload) {
  return apiFetch<TimeEntryApi>(`/api/timesheet/${entryId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteTimeEntry(entryId: string) {
  return apiFetch<void>(`/api/timesheet/${entryId}`, {
    method: "DELETE",
    skipJson: true,
  });
}
