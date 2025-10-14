import { FilterQuery, Types } from "mongoose";
import {
  TimeEntryModel,
  TimeEntryAllocationModel,
  type TimeEntryDoc,
} from "../models/TimeEntry";
import { ProjectModel } from "../models/Client";
import { UserModel } from "../models/User";
import { HttpException } from "../utils/httpException";

/* ======================
   Types
   ====================== */
type AllocationPayload = {
  projectId?: string;
  description?: string | null;
  hours: number;
};

type TimeEntryCreateInput = {
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
  allocations?: AllocationPayload[];
};

type TimeEntryUpdateInput = Partial<TimeEntryCreateInput>;

type TimeEntryFilters = {
  userId?: string;
  startDate?: string;
  endDate?: string;
};

type PopulatedUser = {
  _id: Types.ObjectId | string;
  name?: string;
  email?: string;
} | null;

type PopulatedProject = {
  _id: Types.ObjectId | string;
  name?: string;
} | null;

interface TimeEntryLean {
  _id: Types.ObjectId;
  user: Types.ObjectId | PopulatedUser;
  date: Date;
  entrada1?: string | null;
  saida1?: string | null;
  entrada2?: string | null;
  saida2?: string | null;
  entrada3?: string | null;
  saida3?: string | null;
  totalHoras?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface TimeEntryAllocationLean {
  _id: Types.ObjectId;
  timeEntry: Types.ObjectId;
  project?: Types.ObjectId | PopulatedProject;
  description?: string | null;
  hours: number;
}

interface TimeEntryResponse {
  id: string;
  userId: string;
  user?: { id: string; name?: string; email?: string };
  date: string;
  entrada1?: string;
  saida1?: string;
  entrada2?: string;
  saida2?: string;
  entrada3?: string;
  saida3?: string;
  totalHours?: string;
  notes?: string;
  allocations: Array<{
    id: string;
    projectId?: string;
    projectName?: string;
    description?: string;
    hours: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

/* ======================
   Helpers
   ====================== */
function parseDate(value?: string) {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new HttpException(400, `Invalid date: ${value}`);
  }
  return parsed;
}

function getReferenceId(ref: unknown): string | undefined {
  if (!ref) return undefined;

  if (ref instanceof Types.ObjectId) return ref.toString();
  if (typeof ref === "string") return ref;

  if (typeof ref === "object" && ref !== null && "_id" in ref) {
    const id = (ref as { _id: unknown })._id;
    if (id instanceof Types.ObjectId) return id.toString();
    if (typeof id === "string") return id;
  }

  return undefined;
}

const parseTimeToMinutes = (value?: string | null) => {
  if (!value) return 0;
  const parts = value.split(":");
  if (parts.length < 2) return 0;
  const [hours, minutes] = parts.map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return 0;
  }
  return hours * 60 + minutes;
};

const calculatePairMinutes = (start?: string | null, end?: string | null) => {
  if (!start || !end) return 0;
  const [startHours, startMinutes] = start.split(":").map(Number);
  const [endHours, endMinutes] = end.split(":").map(Number);
  if ([startHours, startMinutes, endHours, endMinutes].some((value) => Number.isNaN(value))) {
    return 0;
  }
  const startTotal = startHours * 60 + startMinutes;
  const endTotal = endHours * 60 + endMinutes;
  return Math.max(endTotal - startTotal, 0);
};

const computeTotalMinutesFromValues = (values: {
  entrada1?: string | null;
  saida1?: string | null;
  entrada2?: string | null;
  saida2?: string | null;
  entrada3?: string | null;
  saida3?: string | null;
}) =>
  calculatePairMinutes(values.entrada1, values.saida1) +
  calculatePairMinutes(values.entrada2, values.saida2) +
  calculatePairMinutes(values.entrada3, values.saida3);

const computeTotalMinutesFromPayload = (payload: {
  entrada1?: string | null;
  saida1?: string | null;
  entrada2?: string | null;
  saida2?: string | null;
  entrada3?: string | null;
  saida3?: string | null;
  totalHours?: string | null;
}) => {
  if (payload.totalHours) {
    const parsed = parseTimeToMinutes(payload.totalHours);
    if (parsed > 0) {
      return parsed;
    }
  }
  return computeTotalMinutesFromValues(payload);
};

const formatMinutesToTime = (minutes: number) => {
  const safeMinutes = Number.isFinite(minutes) && minutes >= 0 ? Math.round(minutes) : 0;
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;
  return `${hours.toString().padStart(2, "0")}:${remainingMinutes.toString().padStart(2, "0")}`;
};

async function ensureUserExists(userId: string) {
  if (!Types.ObjectId.isValid(userId)) {
    throw new HttpException(400, "Invalid userId");
  }
  const exists = await UserModel.exists({ _id: userId });
  if (!exists) {
    throw new HttpException(404, "User not found");
  }
}

async function ensureProjectsExist(allocations?: AllocationPayload[]) {
  if (!allocations?.length) return;

  const projectIds = allocations
    .map((item) => item.projectId)
    .filter((id): id is string => Boolean(id));

  if (!projectIds.length) return;

  const uniqueIds = Array.from(new Set(projectIds));
  const count = await ProjectModel.countDocuments({ _id: { $in: uniqueIds } });

  if (count !== uniqueIds.length) {
    throw new HttpException(400, "One or more projects not found");
  }
}

function buildTimeEntryResponse(
  entry: TimeEntryLean,
  allocations: TimeEntryAllocationLean[]
): TimeEntryResponse {
  const userId = getReferenceId(entry.user);
  if (!userId) {
    throw new HttpException(500, "Time entry missing user reference");
  }

  const user =
    entry.user && typeof entry.user === "object" && "_id" in entry.user
      ? {
          id: getReferenceId(entry.user) ?? userId,
          name: (entry.user as PopulatedUser | undefined)?.name,
          email: (entry.user as PopulatedUser | undefined)?.email,
        }
      : undefined;

  return {
    id: entry._id.toString(),
    userId,
    user,
    date: entry.date.toISOString(),
    entrada1: entry.entrada1 ?? undefined,
    saida1: entry.saida1 ?? undefined,
    entrada2: entry.entrada2 ?? undefined,
    saida2: entry.saida2 ?? undefined,
    entrada3: entry.entrada3 ?? undefined,
    saida3: entry.saida3 ?? undefined,
    totalHours: entry.totalHoras ?? undefined,
    notes: entry.notes ?? undefined,
    allocations: allocations.map((allocation) => ({
      id: allocation._id.toString(),
      projectId: getReferenceId(allocation.project),
      projectName:
        allocation.project &&
        typeof allocation.project === "object" &&
        "name" in allocation.project
          ? (allocation.project as PopulatedProject | undefined)?.name
          : undefined,
      description: allocation.description ?? undefined,
      hours: allocation.hours,
    })),
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  };
}

async function fetchEntryWithAllocations(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new HttpException(400, "Invalid time entry id");
  }

  const entry = await TimeEntryModel.findById(id)
    .populate("user", "name email")
    .lean<TimeEntryLean | null>();

  if (!entry) {
    throw new HttpException(404, "Time entry not found");
  }

  const allocations = await TimeEntryAllocationModel.find({ timeEntry: id })
    .populate("project", "name")
    .lean<TimeEntryAllocationLean[]>();

  return buildTimeEntryResponse(entry, allocations);
}

/* ======================
   Service
   ====================== */
export const timeEntryService = {
  async listEntries(filters: TimeEntryFilters = {}) {
    const query: FilterQuery<TimeEntryDoc> = {};

    if (filters.userId) {
      if (!Types.ObjectId.isValid(filters.userId)) {
        throw new HttpException(400, "Invalid userId filter");
      }
      query.user = new Types.ObjectId(filters.userId);
    }

    const dateConditions: { $gte?: Date; $lte?: Date } = {};
    if (filters.startDate) {
      const start = parseDate(filters.startDate);
      if (start) dateConditions.$gte = start;
    }
    if (filters.endDate) {
      const end = parseDate(filters.endDate);
      if (end) {
        end.setUTCHours(23, 59, 59, 999);
        dateConditions.$lte = end;
      }
    }
    if (Object.keys(dateConditions).length > 0) {
      query.date = dateConditions;
    }

    const entries = await TimeEntryModel.find(query)
      .populate("user", "name email")
      .sort({ date: -1 })
      .lean<TimeEntryLean[]>();

    const entryIds = entries.map((entry) => entry._id);

    const allocations =
      entryIds.length === 0
        ? []
        : await TimeEntryAllocationModel.find({ timeEntry: { $in: entryIds } })
            .populate("project", "name")
            .lean<TimeEntryAllocationLean[]>();

    const allocationsByEntry = new Map<string, TimeEntryAllocationLean[]>();
    allocations.forEach((allocation) => {
      const key = allocation.timeEntry.toString();
      const list = allocationsByEntry.get(key);
      if (list) {
        list.push(allocation);
      } else {
        allocationsByEntry.set(key, [allocation]);
      }
    });

    return entries.map((entry) =>
      buildTimeEntryResponse(entry, allocationsByEntry.get(entry._id.toString()) ?? [])
    );
  },

  async getEntryById(id: string) {
    return fetchEntryWithAllocations(id);
  },

  async createEntry(payload: TimeEntryCreateInput) {
    await ensureUserExists(payload.userId);
    await ensureProjectsExist(payload.allocations);

    const date = parseDate(payload.date);
    if (!date) {
      throw new HttpException(400, "Date is required");
    }

    const computedMinutes = computeTotalMinutesFromPayload(payload);
    const providedTotal = typeof payload.totalHours === "string" ? payload.totalHours.trim() : "";
    const totalHoursValue = providedTotal.length > 0 ? providedTotal : formatMinutesToTime(computedMinutes);

    const entry = await TimeEntryModel.create({
      user: new Types.ObjectId(payload.userId),
      date,
      entrada1: payload.entrada1 ?? undefined,
      saida1: payload.saida1 ?? undefined,
      entrada2: payload.entrada2 ?? undefined,
      saida2: payload.saida2 ?? undefined,
      entrada3: payload.entrada3 ?? undefined,
      saida3: payload.saida3 ?? undefined,
      totalHoras: totalHoursValue,
      notes: payload.notes ?? undefined,
    });

    if (payload.allocations?.length) {
      const docs = payload.allocations.map((allocation) => ({
        timeEntry: entry._id,
        project: allocation.projectId,
        description: allocation.description ?? undefined,
        hours: allocation.hours,
      }));
      await TimeEntryAllocationModel.insertMany(docs);
    }

    return fetchEntryWithAllocations(entry.id);
  },

  async updateEntry(id: string, payload: TimeEntryUpdateInput) {
    const entry = await TimeEntryModel.findById(id);
    if (!entry) {
      throw new HttpException(404, "Time entry not found");
    }

    if (payload.userId) {
      await ensureUserExists(payload.userId);
      entry.user = new Types.ObjectId(payload.userId);
    }

    if (payload.date) {
      const date = parseDate(payload.date);
      if (!date) throw new HttpException(400, "Date is required");
      entry.date = date;
    }

    const fieldMap: Array<{
      key: keyof TimeEntryUpdateInput;
      set: (value: string | null | undefined) => void;
    }> = [
      { key: "entrada1", set: (v) => (entry.entrada1 = v ?? undefined) },
      { key: "saida1", set: (v) => (entry.saida1 = v ?? undefined) },
      { key: "entrada2", set: (v) => (entry.entrada2 = v ?? undefined) },
      { key: "saida2", set: (v) => (entry.saida2 = v ?? undefined) },
      { key: "entrada3", set: (v) => (entry.entrada3 = v ?? undefined) },
      { key: "saida3", set: (v) => (entry.saida3 = v ?? undefined) },
      {
        key: "totalHours",
        set: (v) => {
          if (typeof v === "string") {
            const trimmed = v.trim();
            entry.totalHoras = trimmed.length > 0 ? trimmed : undefined;
          } else {
            entry.totalHoras = undefined;
          }
        },
      },
      { key: "notes", set: (v) => (entry.notes = v ?? undefined) },
    ];

    fieldMap.forEach(({ key, set }) => {
      if (Object.prototype.hasOwnProperty.call(payload, key)) {
        set(payload[key] as string | null | undefined);
      }
    });

    if (
      !Object.prototype.hasOwnProperty.call(payload, "totalHours") ||
      entry.totalHoras === undefined
    ) {
      const updatedMinutes = computeTotalMinutesFromValues({
        entrada1: entry.entrada1 ?? null,
        saida1: entry.saida1 ?? null,
        entrada2: entry.entrada2 ?? null,
        saida2: entry.saida2 ?? null,
        entrada3: entry.entrada3 ?? null,
        saida3: entry.saida3 ?? null,
      });
      entry.totalHoras = formatMinutesToTime(updatedMinutes);
    }

    await entry.save();

    if (payload.allocations !== undefined) {
      await ensureProjectsExist(payload.allocations);
      await TimeEntryAllocationModel.deleteMany({ timeEntry: entry._id });

      if (payload.allocations.length > 0) {
        const docs = payload.allocations.map((allocation) => ({
          timeEntry: entry._id,
          project: allocation.projectId,
          description: allocation.description ?? undefined,
          hours: allocation.hours,
        }));
        await TimeEntryAllocationModel.insertMany(docs);
      }
    }

    return fetchEntryWithAllocations(entry.id);
  },

  async deleteEntry(id: string) {
    const entry = await TimeEntryModel.findByIdAndDelete(id);
    if (!entry) {
      throw new HttpException(404, "Time entry not found");
    }
    await TimeEntryAllocationModel.deleteMany({ timeEntry: entry._id });
  },
};
