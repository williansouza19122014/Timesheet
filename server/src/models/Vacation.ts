import { Schema, model, type Document, Types } from "mongoose";

export enum VacationRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

export interface VacationPeriodDoc extends Document {
  tenantId: Types.ObjectId;
  user: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  daysAvailable: number;
  contractType: string;
  createdAt: Date;
  updatedAt: Date;
}

const vacationPeriodSchema = new Schema<VacationPeriodDoc>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    daysAvailable: { type: Number, required: true },
    contractType: { type: String, default: "CLT" },
  },
  { timestamps: true }
);

export const VacationPeriodModel = model<VacationPeriodDoc>(
  "VacationPeriod",
  vacationPeriodSchema
);

export interface VacationRequestDoc extends Document {
  tenantId: Types.ObjectId;
  user: Types.ObjectId;
  vacationPeriod: Types.ObjectId;
  startDate?: Date;
  endDate?: Date;
  daysTaken: number;
  soldDays: number;
  status: VacationRequestStatus;
  comments?: string;
  createdAt: Date;
  updatedAt: Date;
}

const vacationRequestSchema = new Schema<VacationRequestDoc>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    vacationPeriod: { type: Schema.Types.ObjectId, ref: "VacationPeriod", required: true },
    startDate: Date,
    endDate: Date,
    daysTaken: { type: Number, default: 0 },
    soldDays: { type: Number, default: 0 },
    status: {
      type: String,
      enum: Object.values(VacationRequestStatus),
      default: VacationRequestStatus.PENDING,
    },
    comments: String,
  },
  { timestamps: true }
);

export const VacationRequestModel = model<VacationRequestDoc>(
  "VacationRequest",
  vacationRequestSchema
);

vacationPeriodSchema.index({ tenantId: 1, user: 1, startDate: 1, endDate: 1 }, { unique: true });
vacationRequestSchema.index({ tenantId: 1, user: 1, createdAt: -1 });
