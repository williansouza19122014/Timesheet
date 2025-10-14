import { Types, type FilterQuery } from "mongoose";
import { TimeEntryModel, TimeEntryAllocationModel, type TimeEntryDoc } from "../models/TimeEntry";
import { VacationRequestModel, VacationRequestStatus, type VacationRequestDoc } from "../models/Vacation";
import { UserModel, UserRole, UserStatus, type UserDoc } from "../models/User";
import type { KanbanCardActivityDoc } from "../models/Kanban";
import { KanbanCardActivityModel } from "../models/Kanban";
import { HttpException } from "../utils/httpException";

type DashboardScope = "self" | "team";

type Actor = {
  id: string;
  role: UserRole;
};

type OverviewOptions = {
  month?: number;
  year?: number;
  scope?: DashboardScope;
  userId?: string;
};

type OverviewSummary = {
  capacityHours: number;
  hoursWorked: number;
  projectHours: number;
  nonProjectHours: number;
};

type HoursBreakdown = {
  internalProjects: number;
  vacation: number;
  medicalLeave: number;
};

type MonthlyPoint = {
  month: string;
  capacit: number;
  hoursWorked: number;
  projectHours: number;
  average: number;
};

type DailyPoint = {
  day: number;
  capacit: number;
  hoursWorked: number;
  projectHours: number;
};

type NotificationDTO = {
  id: string;
  title: string;
  message: string;
  date: string;
  type: "info" | "warning" | "success" | "error";
};

type OverviewResponse = {
  month: number;
  year: number;
  scope: DashboardScope;
  summary: OverviewSummary;
  breakdown: HoursBreakdown;
  monthlySeries: MonthlyPoint[];
  dailySeries: DailyPoint[];
  notifications: NotificationDTO[];
};

const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const MINUTES_IN_HOUR = 60;
const DAILY_CAPACITY_HOURS = 8;

const ensureObjectId = (value: string, label: string) => {
  if (!Types.ObjectId.isValid(value)) {
    throw new HttpException(400, `Invalid ${label}`);
  }
  return new Types.ObjectId(value);
};

const toNumber = (value: number) => Math.round(value * 100) / 100;

const parseTimeStringToMinutes = (value?: string | null) => {
  if (!value) return 0;
  const parts = value.split(":");
  if (parts.length < 2) return 0;
  const [hours, minutes] = parts.map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0;
  return hours * MINUTES_IN_HOUR + minutes;
};

const calculatePairMinutes = (start?: string | null, end?: string | null) => {
  if (!start || !end) return 0;
  const [startHours, startMinutes] = start.split(":").map(Number);
  const [endHours, endMinutes] = end.split(":").map(Number);
  if ([startHours, startMinutes, endHours, endMinutes].some((value) => Number.isNaN(value))) {
    return 0;
  }
  const startTotal = startHours * MINUTES_IN_HOUR + startMinutes;
  const endTotal = endHours * MINUTES_IN_HOUR + endMinutes;
  return Math.max(endTotal - startTotal, 0);
};

const computeEntryMinutes = (entry: Pick<TimeEntryDoc, "totalHoras" | "entrada1" | "saida1" | "entrada2" | "saida2" | "entrada3" | "saida3">) => {
  if (entry.totalHoras) {
    const minutes = parseTimeStringToMinutes(entry.totalHoras);
    if (minutes > 0) {
      return minutes;
    }
  }
  return (
    calculatePairMinutes(entry.entrada1, entry.saida1) +
    calculatePairMinutes(entry.entrada2, entry.saida2) +
    calculatePairMinutes(entry.entrada3, entry.saida3)
  );
};

const getWorkingDaysInMonth = (year: number, monthIndex: number) => {
  const date = new Date(Date.UTC(year, monthIndex, 1));
  let workingDays = 0;
  while (date.getUTCMonth() === monthIndex) {
    const weekDay = date.getUTCDay();
    if (weekDay !== 0 && weekDay !== 6) {
      workingDays += 1;
    }
    date.setUTCDate(date.getUTCDate() + 1);
  }
  return workingDays;
};

const calculateOverlapHours = (start: Date, end: Date, rangeStart: Date, rangeEnd: Date) => {
  const effectiveStart = start > rangeStart ? start : rangeStart;
  const effectiveEnd = end < rangeEnd ? end : rangeEnd;
  if (effectiveEnd < effectiveStart) {
    return 0;
  }
  const diffMs = effectiveEnd.getTime() - effectiveStart.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  return diffDays * DAILY_CAPACITY_HOURS;
};

const buildNotifications = (activities: KanbanCardActivityDoc[], timeEntryDates: Array<{ id: string; date: Date }>) => {
  const notifications: NotificationDTO[] = [];

  const timeNotifications = timeEntryDates
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5)
    .map((entry) => ({
      id: entry.id,
      title: "Registro de ponto",
      message: `Registro de horas em ${entry.date.toLocaleDateString("pt-BR")}`,
      date: entry.date.toISOString(),
      type: "success" as const,
    }));

  notifications.push(...timeNotifications);

  const kanbanNotifications = activities
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)
    .map((activity) => ({
      id:
        typeof activity._id === "string"
          ? activity._id
          : (activity._id as Types.ObjectId | undefined)?.toString() ?? activity.card.toString(),
      title: "Atualização no Kanban",
      message: `Atividade ${activity.action} registrada`,
      date: activity.createdAt.toISOString(),
      type: "info" as const,
    }));

  notifications.push(...kanbanNotifications);

  return notifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
};

export const dashboardService = {
  async getOverview(options: OverviewOptions = {}, actor: Actor): Promise<OverviewResponse> {
    const now = new Date();
    const year = options.year ?? now.getUTCFullYear();
    const month = options.month ?? now.getUTCMonth() + 1;
    const scope: DashboardScope = options.scope ?? "self";
    const monthIndex = month - 1;

    const monthStart = new Date(Date.UTC(year, monthIndex, 1));
    const monthEnd = new Date(Date.UTC(year, monthIndex + 1, 0, 23, 59, 59, 999));
    const yearStart = new Date(Date.UTC(year, 0, 1));
    const yearEnd = new Date(Date.UTC(year + 1, 0, 0, 23, 59, 59, 999));

    const actorId = ensureObjectId(actor.id, "actor");
    let userIds: Types.ObjectId[] = [actorId];

    if (options.userId && (actor.role === UserRole.ADMIN || actor.role === UserRole.MANAGER)) {
      userIds = [ensureObjectId(options.userId, "userId")];
    } else if (scope === "team" && (actor.role === UserRole.ADMIN || actor.role === UserRole.MANAGER)) {
      const filter: FilterQuery<UserDoc> = { status: UserStatus.ACTIVE };
      if (actor.role === UserRole.MANAGER) {
        filter.$or = [{ _id: actorId }, { manager: actorId }];
      }
      const team = await UserModel.find(filter).select("_id").lean();
      const ids = new Set<string>(team.map((user) => user._id.toString()));
      ids.add(actorId.toString());
      userIds = Array.from(ids).map((id) => new Types.ObjectId(id));
    }

    const entryQuery: FilterQuery<TimeEntryDoc> = {
      date: { $gte: yearStart, $lte: yearEnd },
    };

    if (scope === "team" && (actor.role === UserRole.ADMIN || actor.role === UserRole.MANAGER)) {
      if (userIds.length > 0) {
        entryQuery.user = { $in: userIds };
      }
    } else {
      entryQuery.user = { $in: userIds };
    }

    const entries = await TimeEntryModel.find(entryQuery).lean();
    const entryIds = entries.map((entry) => entry._id);
    const allocations = entryIds.length
      ? await TimeEntryAllocationModel.find({ timeEntry: { $in: entryIds } }).lean()
      : [];

    const allocationMinutesByEntry = new Map<string, number>();
    allocations.forEach((allocation) => {
      const key = allocation.timeEntry.toString();
      const minutes = Math.round(allocation.hours * MINUTES_IN_HOUR);
      allocationMinutesByEntry.set(key, (allocationMinutesByEntry.get(key) ?? 0) + minutes);
    });

    const monthlyTotals = Array.from({ length: 12 }, () => ({
      hoursWorked: 0,
      projectMinutes: 0,
    }));

    const monthEntries = entries.filter(
      (entry) => entry.date >= monthStart && entry.date <= monthEnd
    );

    const dailyCount = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
    const dailySeries: DailyPoint[] = Array.from({ length: dailyCount }, (_, dayIndex) => {
      const date = new Date(Date.UTC(year, monthIndex, dayIndex + 1));
      const isWeekend = [0, 6].includes(date.getUTCDay());
      const capacity = isWeekend ? 0 : DAILY_CAPACITY_HOURS;
      return {
        day: dayIndex + 1,
        capacit: capacity,
        hoursWorked: 0,
        projectHours: 0,
      };
    });

    const timeEntryDatesForNotifications: Array<{ id: string; date: Date }> = [];

    entries.forEach((entry) => {
      const entryMinutes = computeEntryMinutes(entry);
      const projectMinutes = allocationMinutesByEntry.get(entry._id.toString()) ?? 0;
      const entryMonthIndex = entry.date.getUTCMonth();
      monthlyTotals[entryMonthIndex].hoursWorked += entryMinutes;
      monthlyTotals[entryMonthIndex].projectMinutes += projectMinutes;

      if (entry.date >= monthStart && entry.date <= monthEnd) {
        const dayIndex = entry.date.getUTCDate() - 1;
        if (dailySeries[dayIndex]) {
          dailySeries[dayIndex].hoursWorked += toNumber(entryMinutes / MINUTES_IN_HOUR);
          dailySeries[dayIndex].projectHours += toNumber(projectMinutes / MINUTES_IN_HOUR);
        }
        timeEntryDatesForNotifications.push({ id: entry._id.toString(), date: entry.updatedAt ?? entry.createdAt });
      }
    });

    const monthlySeries: MonthlyPoint[] = monthlyTotals.map((totals, index) => {
      const workingDays = getWorkingDaysInMonth(year, index);
      const capacity = workingDays * DAILY_CAPACITY_HOURS;
      const hoursWorked = toNumber(totals.hoursWorked / MINUTES_IN_HOUR);
      const projectHours = toNumber(totals.projectMinutes / MINUTES_IN_HOUR);
      return {
        month: MONTH_LABELS[index],
        capacit: capacity,
        hoursWorked,
        projectHours,
        average: 0,
      };
    });

    const monthsWithData = monthlySeries.filter((item) => item.hoursWorked > 0);
    const average =
      monthsWithData.length > 0
        ? toNumber(
            monthsWithData.reduce((sum, item) => sum + item.hoursWorked, 0) / monthsWithData.length
          )
        : 0;

    monthlySeries.forEach((item) => {
      item.average = average;
    });

    const monthSummary = monthlySeries[monthIndex];

    const monthProjectMinutes =
      allocationMinutesByEntry.size > 0
        ? monthEntries.reduce(
            (sum, entry) => sum + (allocationMinutesByEntry.get(entry._id.toString()) ?? 0),
            0
          )
        : 0;

    const monthWorkedMinutes = monthEntries.reduce(
      (sum, entry) => sum + computeEntryMinutes(entry),
      0
    );

    const vacationQuery: FilterQuery<VacationRequestDoc> = {
      status: VacationRequestStatus.APPROVED,
    };

    if (!(scope === "team" && (actor.role === UserRole.ADMIN || actor.role === UserRole.MANAGER))) {
      vacationQuery.user = userIds[0];
    } else if (userIds.length > 0) {
      vacationQuery.user = { $in: userIds };
    }

    const vacationRequests = await VacationRequestModel.find(vacationQuery).lean();

    const vacationHours = vacationRequests.reduce((total, request) => {
      const start = request.startDate ?? request.createdAt;
      const end = request.endDate ?? request.startDate ?? request.createdAt;
      if (!start || !end) {
        return total;
      }
      if (end < monthStart || start > monthEnd) {
        return total;
      }
      return total + calculateOverlapHours(start, end, monthStart, monthEnd);
    }, 0);

    const medicalMinutes = monthEntries.reduce((total, entry) => {
      const notes = entry.notes?.toLowerCase() ?? "";
      if (notes.includes("atestado") || notes.includes("licenca")) {
        return total + computeEntryMinutes(entry);
      }
      return total;
    }, 0);

    const medicalHours = toNumber(medicalMinutes / MINUTES_IN_HOUR);
    const projectHours = toNumber(monthProjectMinutes / MINUTES_IN_HOUR);
    const hoursWorked = toNumber(monthWorkedMinutes / MINUTES_IN_HOUR);
    const capacityHours = monthSummary?.capacit ?? getWorkingDaysInMonth(year, monthIndex) * DAILY_CAPACITY_HOURS;
    const nonProjectHours = Math.max(hoursWorked - projectHours, 0);
    const vacationHoursRounded = toNumber(vacationHours);
    const internalProjectsHours = Math.max(
      toNumber(nonProjectHours - vacationHoursRounded - medicalHours),
      0
    );

    const kanbanActivities = await KanbanCardActivityModel.find(
      scope === "team" && (actor.role === UserRole.ADMIN || actor.role === UserRole.MANAGER)
        ? { createdAt: { $gte: monthStart, $lte: monthEnd } }
        : {
            createdAt: { $gte: monthStart, $lte: monthEnd },
            user: { $in: userIds },
          }
    )
      .sort({ createdAt: -1 })
      .limit(10)
      .lean<KanbanCardActivityDoc[]>();

    const notifications = buildNotifications(kanbanActivities, timeEntryDatesForNotifications);

    return {
      month,
      year,
      scope,
      summary: {
        capacityHours: toNumber(capacityHours),
        hoursWorked,
        projectHours,
        nonProjectHours: toNumber(nonProjectHours),
      },
      breakdown: {
        internalProjects: internalProjectsHours,
        vacation: vacationHoursRounded,
        medicalLeave: medicalHours,
      },
      monthlySeries,
      dailySeries: dailySeries.map((item) => ({
        ...item,
        hoursWorked: toNumber(item.hoursWorked),
        projectHours: toNumber(item.projectHours),
      })),
      notifications,
    };
  },
};
