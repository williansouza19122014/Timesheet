import { apiFetch } from "./api-client";
import { VacationRequestStatus } from "@/types/vacations";

export interface TimeSummaryRequest {
  projectId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export interface TimeSummaryResponse {
  range: {
    startDate?: string;
    endDate?: string;
  };
  totalHours: number;
  totalEntries: number;
  byUser: Array<{
    userId: string;
    name?: string;
    email?: string;
    totalHours: number;
    totalEntries: number;
  }>;
  byProject: Array<{
    projectId: string;
    name?: string;
    totalHours: number;
  }>;
  byDay: Array<{
    date: string;
    totalHours: number;
    totalEntries: number;
  }>;
}

export interface ProjectPerformanceRequest {
  startDate?: string;
  endDate?: string;
  onlyActive?: boolean;
}

export interface ProjectPerformanceResponse {
  projects: Array<{
    projectId: string;
    name?: string;
    clientName?: string;
    startDate?: string;
    endDate?: string;
    isActive: boolean;
    totalMembers: number;
    activeMembers: number;
    totalHours: number;
    avgHoursPerMember: number;
  }>;
}

export interface VacationSummaryRequest {
  startDate?: string;
  endDate?: string;
  status?: VacationRequestStatus;
}

export interface VacationSummaryResponse {
  range: {
    startDate?: string;
    endDate?: string;
  };
  totalRequests: number;
  totalDaysTaken: number;
  byStatus: Array<{
    status: VacationRequestStatus;
    totalRequests: number;
    totalDays: number;
  }>;
  byUser: Array<{
    userId: string;
    name?: string;
    email?: string;
    totalRequests: number;
    totalDays: number;
  }>;
}

export interface UserWorkloadRequest {
  projectId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export interface UserWorkloadResponse {
  range: {
    startDate?: string;
    endDate?: string;
  };
  users: Array<{
    userId: string;
    name?: string;
    email?: string;
    totalHours: number;
    projects: Array<{
      projectId: string;
      totalHours: number;
    }>;
  }>;
}

const buildQueryString = (params: Record<string, string | number | boolean | undefined>) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export const fetchTimeSummary = (params: TimeSummaryRequest) =>
  apiFetch<TimeSummaryResponse>(`/api/reports/time-summary${buildQueryString(params)}`);

export const fetchProjectPerformance = (params: ProjectPerformanceRequest) =>
  apiFetch<ProjectPerformanceResponse>(`/api/reports/project-performance${buildQueryString(params)}`);

export const fetchVacationSummary = (params: VacationSummaryRequest) =>
  apiFetch<VacationSummaryResponse>(`/api/reports/vacation-summary${buildQueryString(params)}`);

export const fetchUserWorkload = (params: UserWorkloadRequest) =>
  apiFetch<UserWorkloadResponse>(`/api/reports/user-workload${buildQueryString(params)}`);
