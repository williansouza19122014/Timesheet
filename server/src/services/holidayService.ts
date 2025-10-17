import { Types } from "mongoose";
import { HolidayModel, type HolidayDoc } from "../models/Holiday";
import { HttpException } from "../utils/httpException";

export type HolidayInput = {
  name: string;
  date: string;
  isRecurring?: boolean;
};

export type HolidayFilters = {
  year?: number;
};

export type HolidayResponse = {
  id: string;
  name: string;
  date: string;
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
};

const validateTenant = (tenantId: string): Types.ObjectId => {
  if (!tenantId || !Types.ObjectId.isValid(tenantId)) {
    throw new HttpException(400, "Invalid tenant context");
  }
  return new Types.ObjectId(tenantId);
};

const parseHolidayDate = (value: string): Date => {
  if (!value) {
    throw new HttpException(400, "Holiday date is required");
  }

  let parsed: Date | null = null;

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [dayStr, monthStr, yearStr] = value.split("/");
    const day = Number(dayStr);
    const month = Number(monthStr);
    const year = Number(yearStr);
    if (
      Number.isInteger(day) &&
      Number.isInteger(month) &&
      Number.isInteger(year) &&
      day >= 1 &&
      day <= 31 &&
      month >= 1 &&
      month <= 12 &&
      year >= 1900
    ) {
      parsed = new Date(Date.UTC(year, month - 1, day));
    }
  }

  if (!parsed) {
    const fallback = new Date(value);
    if (!Number.isNaN(fallback.getTime())) {
      parsed = fallback;
    }
  }

  if (!parsed || Number.isNaN(parsed.getTime())) {
    throw new HttpException(400, "Invalid holiday date");
  }

  return parsed;
};

const serializeHoliday = (holiday: HolidayDoc): HolidayResponse => ({
  id: holiday._id.toString(),
  name: holiday.name,
  date: holiday.date.toISOString(),
  isRecurring: Boolean(holiday.isRecurring),
  createdAt: holiday.createdAt.toISOString(),
  updatedAt: holiday.updatedAt.toISOString(),
});

export const holidayService = {
  async listHolidays(tenantId: string, filters: HolidayFilters = {}) {
    const tenantObjectId = validateTenant(tenantId);

    const query: Record<string, unknown> = {
      tenantId: tenantObjectId,
    };

    if (typeof filters.year === "number") {
      const yearStart = new Date(Date.UTC(filters.year, 0, 1));
      const yearEnd = new Date(Date.UTC(filters.year + 1, 0, 1));
      query.date = { $gte: yearStart, $lt: yearEnd };
    }

    const holidays = await HolidayModel.find(query).sort({ date: 1 }).lean<HolidayDoc[]>();
    return holidays.map((holiday) => serializeHoliday(holiday));
  },

  async createHoliday(tenantId: string, input: HolidayInput) {
    const tenantObjectId = validateTenant(tenantId);

    const name = (input.name ?? "").trim();
    if (!name) {
      throw new HttpException(400, "Holiday name is required");
    }

    const date = parseHolidayDate(input.date);

    const existing = await HolidayModel.findOne({
      tenantId: tenantObjectId,
      date,
    });

    if (existing) {
      throw new HttpException(409, "Holiday already exists for the selected date");
    }

    const holiday = await HolidayModel.create({
      tenantId: tenantObjectId,
      name,
      date,
      isRecurring: Boolean(input.isRecurring),
    });

    return serializeHoliday(holiday);
  },

  async updateHoliday(tenantId: string, id: string, input: HolidayInput) {
    const tenantObjectId = validateTenant(tenantId);
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException(400, "Invalid holiday id");
    }

    const holiday = await HolidayModel.findOne({ _id: id, tenantId: tenantObjectId });
    if (!holiday) {
      throw new HttpException(404, "Holiday not found");
    }

    if (input.name !== undefined) {
      const name = input.name.trim();
      if (!name) {
        throw new HttpException(400, "Holiday name is required");
      }
      holiday.name = name;
    }

    if (input.date !== undefined) {
      const date = parseHolidayDate(input.date);
      const duplicate = await HolidayModel.findOne({
        tenantId: tenantObjectId,
        date,
        _id: { $ne: holiday._id },
      });
      if (duplicate) {
        throw new HttpException(409, "Holiday already exists for the selected date");
      }
      holiday.date = date;
    }

    if (input.isRecurring !== undefined) {
      holiday.isRecurring = Boolean(input.isRecurring);
    }

    await holiday.save();
    return serializeHoliday(holiday);
  },

  async deleteHoliday(tenantId: string, id: string) {
    const tenantObjectId = validateTenant(tenantId);
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException(400, "Invalid holiday id");
    }

    const deleted = await HolidayModel.findOneAndDelete({
      _id: id,
      tenantId: tenantObjectId,
    });

    if (!deleted) {
      throw new HttpException(404, "Holiday not found");
    }
  },
};
