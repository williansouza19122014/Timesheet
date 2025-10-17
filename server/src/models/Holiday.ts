import { Schema, model, type Document, Types } from "mongoose";

export interface HolidayDoc extends Document {
  tenantId: Types.ObjectId;
  date: Date;
  name: string;
  isRecurring: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const holidaySchema = new Schema<HolidayDoc>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    date: { type: Date, required: true },
    name: { type: String, required: true, trim: true },
    isRecurring: { type: Boolean, default: false },
  },
  { timestamps: true }
);

holidaySchema.index({ tenantId: 1, date: 1 }, { unique: true });

export const HolidayModel = model<HolidayDoc>("Holiday", holidaySchema);
