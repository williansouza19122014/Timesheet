import { Schema, model, type Document, Types } from "mongoose";

export interface TimeEntryDoc extends Document {
  tenantId: Types.ObjectId;
  user: Types.ObjectId;
  date: Date;
  entrada1?: string;
  saida1?: string;
  entrada2?: string;
  saida2?: string;
  entrada3?: string;
  saida3?: string;
  totalHoras?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const timeEntrySchema = new Schema<TimeEntryDoc>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    entrada1: String,
    saida1: String,
    entrada2: String,
    saida2: String,
    entrada3: String,
    saida3: String,
    totalHoras: String,
    notes: String,
  },
  { timestamps: true }
);

export const TimeEntryModel = model<TimeEntryDoc>("TimeEntry", timeEntrySchema);

export interface TimeEntryAllocationDoc extends Document {
  tenantId: Types.ObjectId;
  timeEntry: Types.ObjectId;
  project?: Types.ObjectId;
  description?: string;
  hours: number;
  createdAt: Date;
  updatedAt: Date;
}

const allocationSchema = new Schema<TimeEntryAllocationDoc>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    timeEntry: { type: Schema.Types.ObjectId, ref: "TimeEntry", required: true },
    project: { type: Schema.Types.ObjectId, ref: "Project" },
    description: String,
    hours: { type: Number, required: true },
  },
  { timestamps: true }
);

export const TimeEntryAllocationModel = model<TimeEntryAllocationDoc>(
  "TimeEntryAllocation",
  allocationSchema
);

timeEntrySchema.index({ tenantId: 1, user: 1, date: 1 }, { unique: true });
allocationSchema.index({ tenantId: 1, timeEntry: 1, project: 1 });
