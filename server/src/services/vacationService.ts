/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types, FilterQuery } from "mongoose";
import {
  VacationPeriodModel,
  VacationRequestModel,
  VacationRequestStatus,
  type VacationPeriodDoc,
  type VacationRequestDoc,
} from "../models/Vacation";
import { UserModel } from "../models/User";
import { HttpException } from "../utils/httpException";

// ==================== Tipos Auxiliares (Lean) ====================
type VacationPeriodLean = {
  _id: Types.ObjectId;
  user: Types.ObjectId | { _id: Types.ObjectId; name?: string; email?: string };
  startDate: Date;
  endDate: Date;
  daysAvailable: number;
  contractType?: string;
  createdAt: Date;
  updatedAt: Date;
};

type VacationRequestLean = {
  _id: Types.ObjectId;
  user: Types.ObjectId | { _id: Types.ObjectId; name?: string; email?: string };
  vacationPeriod:
    | Types.ObjectId
    | VacationPeriodLean
    | { _id: Types.ObjectId; startDate: Date; endDate: Date };
  startDate?: Date;
  endDate?: Date;
  daysTaken: number;
  soldDays: number;
  status: VacationRequestStatus;
  comments?: string;
  createdAt: Date;
  updatedAt: Date;
};

// ==================== Funções Helper ====================
function parseDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new HttpException(400, `Invalid date: ${value}`);
  }
  return parsed;
}

function getId(ref: unknown): string {
  if (!ref) return "";
  if (ref instanceof Types.ObjectId) return ref.toString();
  if (typeof ref === "string") return ref;
  if (typeof ref === "object" && "_id" in (ref as any)) {
    const id = (ref as { _id: unknown })._id;
    if (id instanceof Types.ObjectId) return id.toString();
    if (typeof id === "string") return id;
  }
  return "";
}

async function ensureUserExists(userId: string): Promise<void> {
  if (!Types.ObjectId.isValid(userId)) {
    throw new HttpException(400, "Invalid userId");
  }
  const exists = await UserModel.exists({ _id: userId });
  if (!exists) {
    throw new HttpException(404, "User not found");
  }
}

async function ensureVacationPeriodExists(
  periodId: string,
): Promise<VacationPeriodDoc> {
  if (!Types.ObjectId.isValid(periodId)) {
    throw new HttpException(400, "Invalid vacation period ID");
  }
  const period = await VacationPeriodModel.findById(periodId);
  if (!period) {
    throw new HttpException(404, "Vacation period not found");
  }
  return period;
}

// ==================== Funções de Formatação ====================
function formatVacationPeriod(
  period: VacationPeriodDoc | VacationPeriodLean,
) {
  return {
    id: getId(period._id),
    userId: getId(period.user),
    startDate: period.startDate.toISOString(),
    endDate: period.endDate.toISOString(),
    daysAvailable: period.daysAvailable,
    contractType: period.contractType,
    createdAt: period.createdAt.toISOString(),
    updatedAt: period.updatedAt.toISOString(),
  };
}

function formatVacationRequest(
  request: VacationRequestDoc | VacationRequestLean,
) {
  return {
    id: getId(request._id),
    userId: getId(request.user),
    vacationPeriodId: getId(request.vacationPeriod),
    startDate: request.startDate?.toISOString(),
    endDate: request.endDate?.toISOString(),
    daysTaken: request.daysTaken,
    soldDays: request.soldDays,
    status: request.status,
    comments: request.comments,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
  };
}

// ==================== Serviço ====================
export const vacationService = {
  // ----- Períodos de Férias -----
  async listPeriods(filters: {
    userId?: string;
    startDate?: string;
    endDate?: string;
  } = {}) {
    const query: FilterQuery<VacationPeriodDoc> = {};

    if (filters.userId) {
      if (!Types.ObjectId.isValid(filters.userId)) {
        throw new HttpException(400, "Invalid userId filter");
      }
      query.user = new Types.ObjectId(filters.userId);
    }

    if (filters.startDate || filters.endDate) {
      const dateConditions: { $gte?: Date; $lte?: Date } = {};
      if (filters.startDate) {
        const start = parseDate(filters.startDate);
        if (start) dateConditions.$gte = start;
      }
      if (filters.endDate) {
        const end = parseDate(filters.endDate);
        if (end) dateConditions.$lte = end;
      }
      if (Object.keys(dateConditions).length > 0) {
        query.startDate = dateConditions;
      }
    }

    const periods = await VacationPeriodModel.find(query)
      .populate("user", "name email")
      .sort({ startDate: -1 })
      .lean<VacationPeriodLean[]>();

    return periods.map((period) => ({
      ...formatVacationPeriod(period),
      user:
        typeof period.user === "object" && "name" in period.user
          ? {
              id: getId((period.user as { _id: Types.ObjectId })._id),
              name: (period.user as { name?: string }).name,
              email: (period.user as { email?: string }).email,
            }
          : undefined,
    }));
  },

  async getPeriodById(id: string) {
    const period = await ensureVacationPeriodExists(id);
    await period.populate("user", "name email");

    const populated = period.toObject() as VacationPeriodLean;
    return {
      ...formatVacationPeriod(populated),
      user:
        populated.user &&
        typeof populated.user === "object" &&
        "name" in populated.user
          ? {
              id: getId((populated.user as { _id: Types.ObjectId })._id),
              name: (populated.user as { name?: string }).name,
              email: (populated.user as { email?: string }).email,
            }
          : undefined,
    };
  },

  async createPeriod(input: {
    userId: string;
    startDate: string;
    endDate: string;
    daysAvailable: number;
    contractType?: string;
  }) {
    await ensureUserExists(input.userId);

    const startDate = parseDate(input.startDate);
    const endDate = parseDate(input.endDate);

    if (!startDate || !endDate) {
      throw new HttpException(400, "Start date and end date are required");
    }
    if (startDate >= endDate) {
      throw new HttpException(400, "End date must be after start date");
    }

    const overlapping = await VacationPeriodModel.findOne({
      user: input.userId,
      $or: [{ startDate: { $lte: endDate }, endDate: { $gte: startDate } }],
    });
    if (overlapping) {
      throw new HttpException(
        409,
        "A vacation period already exists for this date range",
      );
    }

    const period = await VacationPeriodModel.create({
      user: input.userId,
      startDate,
      endDate,
      daysAvailable: input.daysAvailable,
      contractType: input.contractType || "CLT",
    });

    return this.getPeriodById(period.id);
    },

  async updatePeriod(
    id: string,
    input: Partial<{
      userId: string;
      startDate: string;
      endDate: string;
      daysAvailable: number;
      contractType?: string;
    }>,
  ) {
    const period = await ensureVacationPeriodExists(id);

    if (input.userId) {
      await ensureUserExists(input.userId);
      period.user = new Types.ObjectId(input.userId);
    }
    if (input.startDate) {
      const startDate = parseDate(input.startDate);
      if (startDate) period.startDate = startDate;
    }
    if (input.endDate) {
      const endDate = parseDate(input.endDate);
      if (endDate) period.endDate = endDate;
    }
    if (period.startDate >= period.endDate) {
      throw new HttpException(400, "End date must be after start date");
    }
    if (input.daysAvailable !== undefined) {
      period.daysAvailable = input.daysAvailable;
    }
    if (input.contractType !== undefined) {
      period.contractType = input.contractType;
    }

    await period.save();
    return this.getPeriodById(period.id);
  },

  async deletePeriod(id: string) {
    const period = await ensureVacationPeriodExists(id);
    const requestCount = await VacationRequestModel.countDocuments({
      vacationPeriod: period._id,
    });
    if (requestCount > 0) {
      throw new HttpException(
        409,
        "Cannot delete period with associated vacation requests",
      );
    }
    await period.deleteOne();
  },

  // ----- Vacation Requests -----
  async listRequests(filters: {
    userId?: string;
    status?: VacationRequestStatus;
    vacationPeriodId?: string;
  } = {}) {
    const query: FilterQuery<VacationRequestDoc> = {};

    if (filters.userId) {
      if (!Types.ObjectId.isValid(filters.userId)) {
        throw new HttpException(400, "Invalid userId filter");
      }
      query.user = new Types.ObjectId(filters.userId);
    }
    if (filters.status) query.status = filters.status;
    if (filters.vacationPeriodId) {
      if (!Types.ObjectId.isValid(filters.vacationPeriodId)) {
        throw new HttpException(400, "Invalid vacationPeriodId filter");
      }
      query.vacationPeriod = new Types.ObjectId(filters.vacationPeriodId);
    }

    const requests = await VacationRequestModel.find(query)
      .populate("user", "name email")
      .populate("vacationPeriod")
      .sort({ createdAt: -1 })
      .lean<VacationRequestLean[]>();

    return requests.map((request) => ({
      ...formatVacationRequest(request),
      user:
        typeof request.user === "object" && "name" in request.user
          ? {
              id: getId((request.user as { _id: Types.ObjectId })._id),
              name: (request.user as { name?: string }).name,
              email: (request.user as { email?: string }).email,
            }
          : undefined,
      vacationPeriod:
        typeof request.vacationPeriod === "object" &&
        "startDate" in request.vacationPeriod
          ? formatVacationPeriod(request.vacationPeriod as VacationPeriodLean)
          : undefined,
    }));
  },

  async getRequestById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException(400, "Invalid vacation request ID");
    }
    const request = await VacationRequestModel.findById(id)
      .populate("user", "name email")
      .populate("vacationPeriod")
      .lean<VacationRequestLean | null>();

    if (!request) {
      throw new HttpException(404, "Vacation request not found");
    }

    return {
      ...formatVacationRequest(request),
      user:
        typeof request.user === "object" && "name" in request.user
          ? {
              id: getId((request.user as { _id: Types.ObjectId })._id),
              name: (request.user as { name?: string }).name,
              email: (request.user as { email?: string }).email,
            }
          : undefined,
      vacationPeriod:
        typeof request.vacationPeriod === "object" &&
        "startDate" in request.vacationPeriod
          ? formatVacationPeriod(request.vacationPeriod as VacationPeriodLean)
          : undefined,
    };
  },

  async createRequest(input: {
    userId: string;
    vacationPeriodId: string;
    startDate?: string;
    endDate?: string;
    daysTaken: number;
    soldDays?: number;
    comments?: string;
  }) {
    await ensureUserExists(input.userId);
    const period = await ensureVacationPeriodExists(input.vacationPeriodId);

    if (period.user.toString() !== input.userId) {
      throw new HttpException(
        403,
        "You can only request vacations from your own periods",
      );
    }

    const startDate = input.startDate ? parseDate(input.startDate) : undefined;
    const endDate = input.endDate ? parseDate(input.endDate) : undefined;
    if (startDate && endDate && startDate >= endDate) {
      throw new HttpException(400, "End date must be after start date");
    }

    const usedDays = await VacationRequestModel.aggregate([
      {
        $match: {
          vacationPeriod: period._id,
          status: {
            $in: [
              VacationRequestStatus.APPROVED,
              VacationRequestStatus.PENDING,
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalDays: { $sum: "$daysTaken" },
          totalSold: { $sum: "$soldDays" },
        },
      },
    ]);

    const totalUsed = usedDays[0]?.totalDays || 0;
    const totalSold = usedDays[0]?.totalSold || 0;
    const totalRequested = (input.daysTaken || 0) + (input.soldDays || 0);

    if (totalUsed + totalSold + totalRequested > period.daysAvailable) {
      throw new HttpException(
        400,
        `Insufficient vacation days. Available: ${
          period.daysAvailable - totalUsed - totalSold
        }, Requested: ${totalRequested}`,
      );
    }

    const request = await VacationRequestModel.create({
      user: input.userId,
      vacationPeriod: input.vacationPeriodId,
      startDate,
      endDate,
      daysTaken: input.daysTaken,
      soldDays: input.soldDays || 0,
      status: VacationRequestStatus.PENDING,
      comments: input.comments,
    });

    return this.getRequestById(request.id);
  },

  async updateRequest(
    id: string,
    input: Partial<{
      startDate?: string;
      endDate?: string;
      daysTaken: number;
      soldDays: number;
      comments?: string;
      status?: VacationRequestStatus;
    }>,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException(400, "Invalid vacation request ID");
    }
    const request = await VacationRequestModel.findById(id);
    if (!request) {
      throw new HttpException(404, "Vacation request not found");
    }

    if (
      request.status === VacationRequestStatus.CANCELLED ||
      request.status === VacationRequestStatus.REJECTED
    ) {
      throw new HttpException(
        400,
        "Cannot update cancelled or rejected requests",
      );
    }

    if (input.startDate) {
      const startDate = parseDate(input.startDate);
      if (startDate) request.startDate = startDate;
    }
    if (input.endDate) {
      const endDate = parseDate(input.endDate);
      if (endDate) request.endDate = endDate;
    }
    if (request.startDate && request.endDate && request.startDate >= request.endDate) {
      throw new HttpException(400, "End date must be after start date");
    }

    if (input.daysTaken !== undefined) {
      request.daysTaken = input.daysTaken;
    }
    if (input.soldDays !== undefined) {
      request.soldDays = input.soldDays;
    }
    if (input.status) {
      request.status = input.status;
    }
    if (input.comments !== undefined) {
      request.comments = input.comments;
    }

    await request.save();
    return this.getRequestById(request.id);
  },

  async cancelRequest(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException(400, "Invalid vacation request ID");
    }
    const request = await VacationRequestModel.findById(id);
    if (!request) {
      throw new HttpException(404, "Vacation request not found");
    }
    if (request.status === VacationRequestStatus.CANCELLED) {
      throw new HttpException(400, "Request is already cancelled");
    }

    request.status = VacationRequestStatus.CANCELLED;
    await request.save();
    return this.getRequestById(request.id);
  },

  async deleteRequest(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException(400, "Invalid vacation request ID");
    }
    const request = await VacationRequestModel.findByIdAndDelete(id);
    if (!request) {
      throw new HttpException(404, "Vacation request not found");
    }
  },
};
