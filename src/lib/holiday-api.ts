import { apiFetch } from "./api-client";

export interface Holiday {
  id: string;
  name: string;
  date: string;
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HolidayInput {
  name: string;
  date: string;
  isRecurring?: boolean;
}

export const listHolidays = (year: number) => {
  const searchParams = new URLSearchParams();
  searchParams.set("year", String(year));
  return apiFetch<Holiday[]>(`/api/holidays?${searchParams.toString()}`);
};

export const createHoliday = (payload: HolidayInput) =>
  apiFetch<Holiday>("/api/holidays", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateHoliday = (holidayId: string, payload: HolidayInput) =>
  apiFetch<Holiday>(`/api/holidays/${holidayId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const deleteHoliday = (holidayId: string) =>
  apiFetch<void>(`/api/holidays/${holidayId}`, {
    method: "DELETE",
  });
