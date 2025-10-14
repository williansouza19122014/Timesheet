import type { Document, Types } from "mongoose";
import { Schema, model } from "mongoose";

export interface KanbanBoardDoc extends Document {
  project: Types.ObjectId;
  name: string;
  description?: string;
  isArchived: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const kanbanBoardSchema = new Schema<KanbanBoardDoc>(
  {
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    isArchived: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const KanbanBoardModel = model<KanbanBoardDoc>("KanbanBoard", kanbanBoardSchema);

export interface KanbanColumnDoc extends Document {
  board: Types.ObjectId;
  title: string;
  position: number;
  limit?: number;
  createdAt: Date;
  updatedAt: Date;
}

const kanbanColumnSchema = new Schema<KanbanColumnDoc>(
  {
    board: { type: Schema.Types.ObjectId, ref: "KanbanBoard", required: true },
    title: { type: String, required: true, trim: true },
    position: { type: Number, required: true },
    limit: { type: Number },
  },
  { timestamps: true }
);

kanbanColumnSchema.index({ board: 1, position: 1 }, { unique: true });

export const KanbanColumnModel = model<KanbanColumnDoc>("KanbanColumn", kanbanColumnSchema);

export interface TimeCorrectionEntry {
  entrada?: string;
  saida?: string;
}

export interface TimeCorrectionInfo {
  date?: Date;
  justification?: string;
  documentName?: string;
  times: TimeCorrectionEntry[];
}

const correctionTimeEntrySchema = new Schema<TimeCorrectionEntry>(
  {
    entrada: { type: String, trim: true },
    saida: { type: String, trim: true },
  },
  { _id: false }
);

const correctionSchema = new Schema<TimeCorrectionInfo>(
  {
    date: { type: Date },
    justification: { type: String, trim: true },
    documentName: { type: String, trim: true },
    times: { type: [correctionTimeEntrySchema], default: [] },
  },
  { _id: false }
);

export interface KanbanCardDoc extends Document {
  board: Types.ObjectId;
  column: Types.ObjectId;
  project: Types.ObjectId;
  title: string;
  description?: string;
  position: number;
  status: "todo" | "doing" | "review" | "done";
  assignees: Types.ObjectId[];
  tags: string[];
  dueDate?: Date;
  priority?: "low" | "medium" | "high";
  createdBy: Types.ObjectId;
  correction?: TimeCorrectionInfo;
  createdAt: Date;
  updatedAt: Date;
}

const kanbanCardSchema = new Schema<KanbanCardDoc>(
  {
    board: { type: Schema.Types.ObjectId, ref: "KanbanBoard", required: true },
    column: { type: Schema.Types.ObjectId, ref: "KanbanColumn", required: true },
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    position: { type: Number, required: true },
    status: {
      type: String,
      enum: ["todo", "doing", "review", "done"],
      default: "todo",
    },
    assignees: [{ type: Schema.Types.ObjectId, ref: "User" }],
    tags: [{ type: String, trim: true }],
    dueDate: { type: Date },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    correction: correctionSchema,
  },
  { timestamps: true }
);

kanbanCardSchema.index({ column: 1, position: 1 }, { unique: true });

export const KanbanCardModel = model<KanbanCardDoc>("KanbanCard", kanbanCardSchema);

export interface KanbanCardActivityDoc extends Document {
  card: Types.ObjectId;
  user: Types.ObjectId;
  action: string;
  payload?: Record<string, unknown>;
  createdAt: Date;
}

const kanbanCardActivitySchema = new Schema<KanbanCardActivityDoc>(
  {
    card: { type: Schema.Types.ObjectId, ref: "KanbanCard", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    payload: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const KanbanCardActivityModel = model<KanbanCardActivityDoc>(
  "KanbanCardActivity",
  kanbanCardActivitySchema
);
