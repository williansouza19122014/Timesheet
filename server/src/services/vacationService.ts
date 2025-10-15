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

const validateTenant = (tenantId: string) => {
  if (!tenantId || !Types.ObjectId.isValid(tenantId)) {
    throw new HttpException(400, "Invalid tenant context");
  }
};

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

async function ensureUserExists(tenantId: string, userId: string): Promise<void> {
  validateTenant(tenantId);
  if (!Types.ObjectId.isValid(userId)) {
    throw new HttpException(400, "Invalid userId");
  }
  const tenantObjectId = new Types.ObjectId(tenantId);
  const exists = await UserModel.exists({ _id: userId, tenantId: tenantObjectId });
  if (!exists) {
    throw new HttpException(404, "User not found");
  }
}

async function ensureVacationPeriodExists(
  tenantId: string,
  periodId: string,
): Promise<VacationPeriodDoc> {
  validateTenant(tenantId);
  if (!Types.ObjectId.isValid(periodId)) {
    throw new HttpException(400, "Invalid vacation period ID");
  }
  const tenantObjectId = new Types.ObjectId(tenantId);
  const period = await VacationPeriodModel.findOne({ _id: periodId, tenantId: tenantObjectId });
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
  async listPeriods(
    tenantId: string,
    filters: { userId?: string; startDate?: string; endDate?: string } = {}
  ) {
    validateTenant(tenantId);
    const tenantObjectId = new Types.ObjectId(tenantId);
    const query: FilterQuery<VacationPeriodDoc> = { tenantId: tenantObjectId };

    if (filters.userId) {
      if (!Types.ObjectId.isValid(filters.userId)) {
        throw new HttpException(400, "Invalid userId filter");
      }
      await ensureUserExists(tenantId, filters.userId);
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
      .populate({
        path: "user",
        select: "name email",
        match: { tenantId: tenantObjectId },
      })
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

  async getPeriodById(tenantId: string, id: string) {
    const period = await ensureVacationPeriodExists(tenantId, id);
    await period.populate({
      path: "user",
      select: "name email",
      match: { tenantId: new Types.ObjectId(tenantId) },
    });

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

  async createPeriod(
    tenantId: string,
    input: {
      userId: string;
      startDate: string;
      endDate: string;
      daysAvailable: number;
      contractType?: string;
    }
  ) {
    validateTenant(tenantId);
    const tenantObjectId = new Types.ObjectId(tenantId);
    await ensureUserExists(tenantId, input.userId);

    const startDate = parseDate(input.startDate);
    const endDate = parseDate(input.endDate);

    if (!startDate || !endDate) {
      throw new HttpException(400, "Start date and end date are required");
    }
    if (startDate >= endDate) {
      throw new HttpException(400, "End date must be after start date");
    }

    const overlapping = await VacationPeriodModel.findOne({
      tenantId: tenantObjectId,
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
      tenantId: tenantObjectId,
      user: input.userId,
      startDate,
      endDate,
      daysAvailable: input.daysAvailable,
      contractType: input.contractType || "CLT",
    });

    return this.getPeriodById(tenantId, period.id);
  },

  async updatePeriod(
    tenantId: string,
    id: string,
    input: Partial<{
      userId: string;
      startDate: string;
      endDate: string;
      daysAvailable: number;
      contractType?: string;
    }>
  ) {
    validateTenant(tenantId);
    const period = await ensureVacationPeriodExists(tenantId, id);

    if (input.userId) {
      await ensureUserExists(tenantId, input.userId);
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
    return this.getPeriodById(tenantId, period.id);
  },

  async deletePeriod(tenantId: string, id: string) {
    validateTenant(tenantId);
    const tenantObjectId = new Types.ObjectId(tenantId);
    const period = await ensureVacationPeriodExists(tenantId, id);
    const requestCount = await VacationRequestModel.countDocuments({
      tenantId: tenantObjectId,
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
  async listRequests(
    tenantId: string,
    filters: {
      userId?: string;
      status?: VacationRequestStatus;
      vacationPeriodId?: string;
    } = {}
  ) {
    validateTenant(tenantId);
    const tenantObjectId = new Types.ObjectId(tenantId);
    const query: FilterQuery<VacationRequestDoc> = { tenantId: tenantObjectId };

    if (filters.userId) {
      if (!Types.ObjectId.isValid(filters.userId)) {
        throw new HttpException(400, "Invalid userId filter");
      }
      await ensureUserExists(tenantId, filters.userId);
      query.user = new Types.ObjectId(filters.userId);
    }
    if (filters.status) query.status = filters.status;
    if (filters.vacationPeriodId) {
      if (!Types.ObjectId.isValid(filters.vacationPeriodId)) {
        throw new HttpException(400, "Invalid vacationPeriodId filter");
      }
      await ensureVacationPeriodExists(tenantId, filters.vacationPeriodId);
      query.vacationPeriod = new Types.ObjectId(filters.vacationPeriodId);
    }

    const requests = await VacationRequestModel.find(query)
      .populate({
        path: "user",
        select: "name email",
        match: { tenantId: tenantObjectId },
      })
      .populate({
        path: "vacationPeriod",
        match: { tenantId: tenantObjectId },
      })
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

  async getRequestById(tenantId: string, id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException(400, "Invalid vacation request ID");
    }
    const tenantObjectId = new Types.ObjectId(tenantId);
    const request = await VacationRequestModel.findOne({
      _id: id,
      tenantId: tenantObjectId,
    })
      .populate({
        path: "user",
        select: "name email",
        match: { tenantId: tenantObjectId },
      })
      .populate({
        path: "vacationPeriod",
        match: { tenantId: tenantObjectId },
      })
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

  async createRequest(
    tenantId: string,
    input: {
      userId: string;
      vacationPeriodId: string;
      startDate?: string;
      endDate?: string;
      daysTaken: number;
      soldDays?: number;
      comments?: string;
    }
  ) {
    validateTenant(tenantId);
    const tenantObjectId = new Types.ObjectId(tenantId);
    await ensureUserExists(tenantId, input.userId);
    const period = await ensureVacationPeriodExists(tenantId, input.vacationPeriodId);

    if (period.user.toString() !== input.userId) {
      throw new HttpException(
        403,
        "You can only request vacations from your own periods"
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
          tenantId: tenantObjectId,
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
        }, Requested: ${totalRequested}`
      );
    }

    const request = await VacationRequestModel.create({
      tenantId: tenantObjectId,
      user: input.userId,
      vacationPeriod: input.vacationPeriodId,
      startDate,
      endDate,
      daysTaken: input.daysTaken,
      soldDays: input.soldDays || 0,
      status: VacationRequestStatus.PENDING,
      comments: input.comments,
    });

    return this.getRequestById(tenantId, request.id);
  },

  async updateRequest(
    tenantId: string,
    id: string,
    input: Partial<{
      startDate?: string;
      endDate?: string;
      daysTaken: number;
      soldDays: number;
      comments?: string;
      status?: VacationRequestStatus;
    }>
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException(400, "Invalid vacation request ID");
    }
    const tenantObjectId = new Types.ObjectId(tenantId);
    const request = await VacationRequestModel.findOne({
      _id: id,
      tenantId: tenantObjectId,
    });
    if (!request) {
      throw new HttpException(404, "Vacation request not found");
    }

    if (
      request.status === VacationRequestStatus.CANCELLED ||
      request.status === VacationRequestStatus.REJECTED
    ) {
      throw new HttpException(
        400,
        "Cannot update cancelled or rejected requests"
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
    return this.getRequestById(tenantId, request.id);
  },

  async cancelRequest(tenantId: string, id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException(400, "Invalid vacation request ID");
    }
    const tenantObjectId = new Types.ObjectId(tenantId);
    const request = await VacationRequestModel.findOne({
      _id: id,
      tenantId: tenantObjectId,
    });
    if (!request) {
      throw new HttpException(404, "Vacation request not found");
    }
    if (request.status === VacationRequestStatus.CANCELLED) {
      throw new HttpException(400, "Request is already cancelled");
    }

    request.status = VacationRequestStatus.CANCELLED;
    await request.save();
    return this.getRequestById(tenantId, request.id);
  },

  async deleteRequest(tenantId: string, id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException(400, "Invalid vacation request ID");
    }
    const tenantObjectId = new Types.ObjectId(tenantId);
    const request = await VacationRequestModel.findOneAndDelete({
      _id: id,
      tenantId: tenantObjectId,
    });
    if (!request) {
      throw new HttpException(404, "Vacation request not found");
    }
  },
};
