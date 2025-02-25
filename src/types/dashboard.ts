
export interface Notification {
  id: string;
  title: string;
  message: string;
  date: Date;
  read: boolean;
  type: "info" | "warning" | "success" | "error";
}

export interface MonthlyData {
  month: string;
  capacit: number;
  hoursWorked: number;
  projectHours: number;
  average: number;
}

export interface HoursBreakdown {
  internalProjects: number;
  vacation: number;
  medicalLeave: number;
}
