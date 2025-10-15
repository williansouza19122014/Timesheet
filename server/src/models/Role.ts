import { Schema, model, type Document, type Types } from "mongoose";

export interface RoleDoc extends Document {
  tenantId: Types.ObjectId;
  name: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<RoleDoc>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    permissions: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

roleSchema.index({ tenantId: 1, name: 1 }, { unique: true });

roleSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: any) => {
    const rawId = ret._id;
    if (typeof rawId === "string") {
      ret.id = rawId;
    } else if (rawId && typeof rawId.toString === "function") {
      ret.id = rawId.toString();
    }
    delete ret._id;
    if (Array.isArray(ret.permissions)) {
      ret.permissions = [...new Set(ret.permissions)];
    }
  },
});

export const RoleModel = model<RoleDoc>("Role", roleSchema);
