import { apiFetch } from "./api-client";

export type DashboardScope = "self" | "team";

export interface DashboardSummary {
  capacityHours: number;
  hoursWorked: number;
  projectHours: number;
  nonProjectHours: number;
}

export interface DashboardBreakdown {
  internalProjects: number;
  vacation: number;
  medicalLeave: number;
}

export interface DashboardMonthlyPoint {
  month: string;
  capacit: number;
  hoursWorked: number;
  projectHours: number;
  average: number;
}

export interface DashboardDailyPoint {
  day: number;
  capacit: number;
  hoursWorked: number;
  projectHours: number;
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: "info" | "warning" | "success" | "error";
}

export interface DashboardOverview {
  month: number;
  year: number;
  scope: DashboardScope;
  summary: DashboardSummary;
  breakdown: DashboardBreakdown;
  monthlySeries: DashboardMonthlyPoint[];
  dailySeries: DashboardDailyPoint[];
  notifications: DashboardNotification[];
}

export interface DashboardQuery {
  month?: number;
  year?: number;
  scope?: DashboardScope;
  userId?: string;
}

export async function fetchDashboardOverview(query: DashboardQuery = {}) {
  const searchParams = new URLSearchParams();
  if (query.month !== undefined) searchParams.set("month", String(query.month));
  if (query.year !== undefined) searchParams.set("year", String(query.year));
  if (query.scope) searchParams.set("scope", query.scope);
  if (query.userId) searchParams.set("userId", query.userId);

  const queryString = searchParams.toString();
  const url = queryString ? `/api/dashboard/overview?${queryString}` : "/api/dashboard/overview";

  return apiFetch<DashboardOverview>(url);
}
