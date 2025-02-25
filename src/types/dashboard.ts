
export interface DailyData {
  day: number;
  capacit: number;
  hoursWorked: number;
  projectHours: number;
}

export interface MonthlyData {
  month: string;
  capacit: number;
  hoursWorked: number;
  projectHours: number;
  average: number;
  dailyData?: DailyData[];
}

export interface HoursBreakdown {
  internalProjects: number;
  vacation: number;
  medicalLeave: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: Date;
  read: boolean;
  type: "info" | "warning" | "success" | "error";
}
