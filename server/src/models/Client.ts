import { Schema, model, type Document, Types } from "mongoose";

export interface ClientDoc extends Document {
  tenantId: Types.ObjectId;
  name: string;
  cnpj?: string;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const clientSchema = new Schema<ClientDoc>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    cnpj: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { timestamps: true }
);

export const ClientModel = model<ClientDoc>("Client", clientSchema);

export interface ProjectDoc extends Document {
  tenantId: Types.ObjectId;
  client: Types.ObjectId;
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<ProjectDoc>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    client: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    name: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { timestamps: true }
);

export const ProjectModel = model<ProjectDoc>("Project", projectSchema);

export interface ProjectMemberDoc extends Document {
  tenantId: Types.ObjectId;
  project: Types.ObjectId;
  user: Types.ObjectId;
  role?: string;
  isLeader: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const projectMemberSchema = new Schema<ProjectMemberDoc>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String },
    isLeader: { type: Boolean, default: false },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { timestamps: true }
);

clientSchema.index({ tenantId: 1, name: 1 }, { unique: true });
projectSchema.index({ tenantId: 1, client: 1, name: 1 }, { unique: true });
projectMemberSchema.index({ tenantId: 1, project: 1, user: 1 }, { unique: true });

export const ProjectMemberModel = model<ProjectMemberDoc>("ProjectMember", projectMemberSchema);
