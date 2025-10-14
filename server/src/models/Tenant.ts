import { Schema, model, type Document } from "mongoose";

export type TenantPlan = "FREE" | "PRO" | "ENTERPRISE";

export interface TenantDoc extends Document {
  name: string;
  plan: TenantPlan;
  createdAt: Date;
  updatedAt: Date;
}

const tenantSchema = new Schema<TenantDoc>(
  {
    name: { type: String, required: true, trim: true },
    plan: {
      type: String,
      enum: ["FREE", "PRO", "ENTERPRISE"],
      default: "FREE",
    },
  },
  { timestamps: true }
);

tenantSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
  },
});

tenantSchema.index({ name: 1 }, { unique: true });

export const TenantModel = model<TenantDoc>("Tenant", tenantSchema);
