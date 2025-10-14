
import { Types } from "mongoose";
import {
  KanbanBoardModel,
  KanbanColumnModel,
  KanbanCardModel,
  KanbanCardActivityModel,
  type KanbanBoardDoc,
  type KanbanColumnDoc,
  type KanbanCardDoc,
  type KanbanCardActivityDoc,
} from "../models/Kanban";
import { ProjectModel, ProjectMemberModel } from "../models/Client";
import { UserRole } from "../models/User";
import { HttpException } from "../utils/httpException";

type Actor = {
  id: string;
  role: UserRole;
};

type BoardFilters = {
  projectId?: string;
  includeArchived?: boolean;
};

type CreateBoardInput = {
  projectId: string;
  name: string;
  description?: string | null;
};

type UpdateBoardInput = {
  name?: string | null;
  description?: string | null;
  isArchived?: boolean;
};

type CreateColumnInput = {
  boardId: string;
  title: string;
  limit?: number | null;
};

type UpdateColumnInput = {
  title?: string | null;
  limit?: number | null;
  position?: number | null;
};

type DeleteColumnInput = {
  moveCardsToColumnId?: string | null;
};

type TimeCorrectionInput = {
  date?: string | null;
  justification?: string | null;
  documentName?: string | null;
  times?: Array<{ entrada?: string | null; saida?: string | null }> | null;
};

type CreateCardInput = {
  columnId: string;
  title: string;
  description?: string | null;
  status?: "todo" | "doing" | "review" | "done";
  tags?: string[] | string | null;
  dueDate?: string | null;
  priority?: "low" | "medium" | "high" | null;
  assignees?: (string | null | undefined)[] | null;
  position?: number | null;
  correction?: TimeCorrectionInput | null;
};

type UpdateCardInput = {
  title?: string | null;
  description?: string | null;
  status?: "todo" | "doing" | "review" | "done";
  tags?: string[] | string | null;
  dueDate?: string | null;
  priority?: "low" | "medium" | "high" | null;
  assignees?: (string | null | undefined)[] | null;
  correction?: TimeCorrectionInput | null;
};

type MoveCardInput = {
  targetColumnId: string;
  targetPosition?: number | null;
};

type CardActivityResponse = {
  id: string;
  cardId: string;
  userId: string;
  action: string;
  payload?: Record<string, unknown>;
  createdAt: string;
};

type KanbanCardResponse = {
  id: string;
  boardId: string;
  columnId: string;
  projectId: string;
  title: string;
  description?: string;
  position: number;
  status: "todo" | "doing" | "review" | "done";
  tags: string[];
  dueDate?: string;
  priority: "low" | "medium" | "high";
  assignees: string[];
  correction?: {
    date?: string;
    justification?: string;
    documentName?: string;
    times: Array<{ entrada?: string; saida?: string }>;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

type KanbanColumnResponse = {
  id: string;
  boardId: string;
  title: string;
  position: number;
  limit?: number;
  cards: KanbanCardResponse[];
  createdAt: string;
  updatedAt: string;
};

type KanbanBoardResponse = {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  isArchived: boolean;
  createdBy: string;
  columns: KanbanColumnResponse[];
  createdAt: string;
  updatedAt: string;
};

type BoardLean = {
  _id: Types.ObjectId;
  project: Types.ObjectId;
  name: string;
  description?: string;
  isArchived: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

type ColumnLean = {
  _id: Types.ObjectId;
  board: Types.ObjectId;
  title: string;
  position: number;
  limit?: number;
  createdAt: Date;
  updatedAt: Date;
};

type CardLean = {
  _id: Types.ObjectId;
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
  correction?: {
    date?: Date;
    justification?: string;
    documentName?: string;
    times?: Array<{ entrada?: string; saida?: string }>;
  };
  createdAt: Date;
  updatedAt: Date;
};

type ActivityLean = {
  _id: Types.ObjectId;
  card: Types.ObjectId;
  user: Types.ObjectId;
  action: string;
  payload?: Record<string, unknown>;
  createdAt: Date;
};

const sanitizeString = (value?: string | null) => {
  if (value === undefined || value === null) return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

const parseDateInput = (value?: string | null, label = "date") => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new HttpException(400, `Invalid ${label}`);
  }
  return parsed;
};

const normalizeTags = (tags?: string[] | string | null): string[] => {
  if (tags === undefined || tags === null) return [];
  const values = Array.isArray(tags) ? tags : tags.split(",");
  const sanitized = values
    .map((item) => sanitizeString(item))
    .filter((item): item is string => Boolean(item));
  return Array.from(new Set(sanitized));
};

const canManageBoards = (actor: Actor) =>
  actor.role === UserRole.ADMIN || actor.role === UserRole.MANAGER;

const ensureBoardManager = (actor: Actor) => {
  if (!canManageBoards(actor)) {
    throw new HttpException(403, "Only managers or admins can manage boards");
  }
};

const activeMemberFilter = {
  $or: [{ endDate: { $exists: false } }, { endDate: null }],
};

const ensureObjectId = (value: string, label: string) => {
  if (!Types.ObjectId.isValid(value)) {
    throw new HttpException(400, `Invalid ${label}`);
  }
  return new Types.ObjectId(value);
};

const ensureProjectAccess = async (projectId: string, actor: Actor) => {
  const projectObjectId = ensureObjectId(projectId, "projectId");
  const exists = await ProjectModel.exists({ _id: projectObjectId });
  if (!exists) {
    throw new HttpException(404, "Project not found");
  }

  if (canManageBoards(actor)) {
    return projectObjectId;
  }

  const membership = await ProjectMemberModel.exists({
    project: projectObjectId,
    user: ensureObjectId(actor.id, "userId"),
    ...activeMemberFilter,
  });

  if (!membership) {
    throw new HttpException(403, "You are not part of this project");
  }

  return projectObjectId;
};

const ensureBoardAccess = async (boardId: string, actor: Actor) => {
  const boardObjectId = ensureObjectId(boardId, "boardId");
  const board = await KanbanBoardModel.findById(boardObjectId);
  if (!board) {
    throw new HttpException(404, "Board not found");
  }
  await ensureProjectAccess(board.project.toString(), actor);
  return board;
};

const ensureColumnAccess = async (columnId: string, actor: Actor) => {
  const columnObjectId = ensureObjectId(columnId, "columnId");
  const column = await KanbanColumnModel.findById(columnObjectId);
  if (!column) {
    throw new HttpException(404, "Column not found");
  }
  await ensureBoardAccess(column.board.toString(), actor);
  return column;
};

const ensureCardAccess = async (cardId: string, actor: Actor) => {
  const cardObjectId = ensureObjectId(cardId, "cardId");
  const card = await KanbanCardModel.findById(cardObjectId);
  if (!card) {
    throw new HttpException(404, "Card not found");
  }
  await ensureBoardAccess(card.board.toString(), actor);
  return card;
};

const normalizeAssignees = async (
  projectId: Types.ObjectId,
  rawAssignees?: (string | null | undefined)[] | null
): Promise<Types.ObjectId[] | undefined> => {
  if (rawAssignees === undefined) return undefined;
  const sanitized = (rawAssignees ?? [])
    .map((value) => (value ? value.trim() : undefined))
    .filter((value): value is string => Boolean(value));

  if (!sanitized.length) {
    return [];
  }

  const uniqueSanitized = Array.from(new Set(sanitized));
  const assigneeIds = uniqueSanitized.map((item) => ensureObjectId(item, "assigneeId"));
  const memberCount = await ProjectMemberModel.countDocuments({
    project: projectId,
    user: { $in: assigneeIds },
    ...activeMemberFilter,
  });
  if (memberCount !== assigneeIds.length) {
    throw new HttpException(400, "Some assignees are not active members of the project");
  }
  return assigneeIds;
};

const normalizePriority = (
  value?: "low" | "medium" | "high" | null
): "low" | "medium" | "high" => {
  if (!value) return "medium";
  return ["low", "medium", "high"].includes(value) ? value : "medium";
};

const normalizeCorrection = (value?: TimeCorrectionInput | null) => {
  if (!value) return undefined;
  const date = parseDateInput(value.date ?? undefined, "correction.date");
  const justification = sanitizeString(value.justification ?? undefined);
  const documentName = sanitizeString(value.documentName ?? undefined);
  const times =
    value.times
      ?.map((time) => ({
        entrada: sanitizeString(time?.entrada ?? undefined),
        saida: sanitizeString(time?.saida ?? undefined),
      }))
      .filter((item) => item.entrada || item.saida) ?? [];

  if (!date && !justification && !documentName && times.length === 0) {
    return undefined;
  }

  return {
    date,
    justification,
    documentName,
    times,
  };
};

const formatCard = (card: CardLean): KanbanCardResponse => ({
  id: card._id.toString(),
  boardId: card.board.toString(),
  columnId: card.column.toString(),
  projectId: card.project.toString(),
  title: card.title,
  description: card.description ?? undefined,
  position: card.position,
  status: card.status,
  tags: card.tags ?? [],
  dueDate: card.dueDate?.toISOString(),
  priority: card.priority ?? "medium",
  assignees: (card.assignees ?? []).map((assignee) => assignee.toString()),
  correction: card.correction
    ? {
        date: card.correction.date?.toISOString(),
        justification: card.correction.justification ?? undefined,
        documentName: card.correction.documentName ?? undefined,
        times: (card.correction.times ?? []).map((time) => ({
          entrada: time?.entrada ?? undefined,
          saida: time?.saida ?? undefined,
        })),
      }
    : undefined,
  createdBy: card.createdBy.toString(),
  createdAt: card.createdAt.toISOString(),
  updatedAt: card.updatedAt.toISOString(),
});

const formatColumn = (
  column: ColumnLean,
  cards: CardLean[]
): KanbanColumnResponse => ({
  id: column._id.toString(),
  boardId: column.board.toString(),
  title: column.title,
  position: column.position,
  limit: column.limit ?? undefined,
  cards: cards.map(formatCard),
  createdAt: column.createdAt.toISOString(),
  updatedAt: column.updatedAt.toISOString(),
});


const buildBoardResponse = async (board: KanbanBoardDoc): Promise<KanbanBoardResponse> => {
  const boardLean = board.toObject() as BoardLean;
  const columns = await KanbanColumnModel.find({ board: board._id })
    .sort({ position: 1 })
    .lean<ColumnLean[]>();
  const cards = await KanbanCardModel.find({ board: board._id })
    .sort({ position: 1 })
    .lean<CardLean[]>();
  return formatBoard(boardLean, columns, cards);
};

const formatBoard = (
  board: BoardLean,
  columns: ColumnLean[],
  cards: CardLean[]
): KanbanBoardResponse => {
  const columnsById = new Map<string, ColumnLean>(
    columns.map((column) => [column._id.toString(), column])
  );

  const cardsByColumn = new Map<string, CardLean[]>();
  cards.forEach((card) => {
    const key = card.column.toString();
    const list = cardsByColumn.get(key) ?? [];
    list.push(card);
    cardsByColumn.set(key, list);
  });

  const formattedColumns = Array.from(columnsById.values())
    .sort((a, b) => a.position - b.position)
    .map((column) => {
      const columnCards = (cardsByColumn.get(column._id.toString()) ?? []).sort(
        (a, b) => a.position - b.position
      );
      return formatColumn(column, columnCards);
    });

  return {
    id: board._id.toString(),
    projectId: board.project.toString(),
    name: board.name,
    description: board.description ?? undefined,
    isArchived: board.isArchived,
    createdBy: board.createdBy.toString(),
    columns: formattedColumns,
    createdAt: board.createdAt.toISOString(),
    updatedAt: board.updatedAt.toISOString(),
  };
};

const formatActivity = (activity: ActivityLean): CardActivityResponse => ({
  id: activity._id.toString(),
  cardId: activity.card.toString(),
  userId: activity.user.toString(),
  action: activity.action,
  payload: activity.payload ?? undefined,
  createdAt: activity.createdAt.toISOString(),
});

const logActivity = async (
  cardId: Types.ObjectId,
  userId: Types.ObjectId,
  action: string,
  payload?: Record<string, unknown>
) => {
  await KanbanCardActivityModel.create({
    card: cardId,
    user: userId,
    action,
    payload,
  });
};

const shiftColumnPositions = async (
  boardId: Types.ObjectId,
  from: number,
  to: number
) => {
  if (from === to) return;
  if (from > to) {
    await KanbanColumnModel.updateMany(
      {
        board: boardId,
        position: { $gte: to, $lt: from },
      },
      { $inc: { position: 1 } }
    );
  } else {
    await KanbanColumnModel.updateMany(
      {
        board: boardId,
        position: { $gt: from, $lte: to },
      },
      { $inc: { position: -1 } }
    );
  }
};

const shiftCardPositions = async (
  columnId: Types.ObjectId,
  from: number,
  to: number
) => {
  if (from === to) return;
  if (from > to) {
    await KanbanCardModel.updateMany(
      {
        column: columnId,
        position: { $gte: to, $lt: from },
      },
      { $inc: { position: 1 } }
    );
  } else {
    await KanbanCardModel.updateMany(
      {
        column: columnId,
        position: { $gt: from, $lte: to },
      },
      { $inc: { position: -1 } }
    );
  }
};

const appendCardToColumn = async (
  columnId: Types.ObjectId,
  targetPosition?: number | null
) => {
  const count = await KanbanCardModel.countDocuments({ column: columnId });
  if (targetPosition === undefined || targetPosition === null || targetPosition >= count) {
    return count;
  }
  const position = Math.max(0, Math.floor(targetPosition));
  await KanbanCardModel.updateMany(
    {
      column: columnId,
      position: { $gte: position },
    },
    { $inc: { position: 1 } }
  );
  return position;
};

const ensureColumnIsEmpty = async (columnId: Types.ObjectId) => {
  const count = await KanbanCardModel.countDocuments({ column: columnId });
  if (count > 0) {
    throw new HttpException(400, "Column must be empty or specify moveCardsToColumnId");
  }
};

const ensureCardArrays = (
  input: CreateCardInput | UpdateCardInput
) => {
  const tags = normalizeTags(input.tags ?? undefined);
  const status = input.status ?? "todo";
  if (!(["todo", "doing", "review", "done"] as const).includes(status)) {
    throw new HttpException(400, "Invalid status");
  }
  return { tags, status };
};

const buildBoardQuery = async (filters: BoardFilters, actor: Actor) => {
  const query: Record<string, unknown> = {};
  if (filters.projectId) {
    const projectId = await ensureProjectAccess(filters.projectId, actor);
    query.project = projectId;
  } else if (!canManageBoards(actor)) {
    const memberships = await ProjectMemberModel.find({
      user: ensureObjectId(actor.id, "userId"),
      ...activeMemberFilter,
    }).select("project");
    const projectIds = memberships.map((member) => member.project);
    if (!projectIds.length) {
      query.project = new Types.ObjectId(); // will result in empty list
    } else {
      query.project = { $in: projectIds };
    }
  }
  if (!filters.includeArchived) {
    query.isArchived = false;
  }
  return query;
};

export const kanbanService = {
  async listBoards(filters: BoardFilters, actor: Actor): Promise<KanbanBoardResponse[]> {
    const query = await buildBoardQuery(filters, actor);

    const boards = await KanbanBoardModel.find(query).sort({ createdAt: 1 }).lean<BoardLean[]>();
    if (!boards.length) {
      return [];
    }

    const boardIds = boards.map((board) => board._id);

    const columns = await KanbanColumnModel.find({ board: { $in: boardIds } })
      .sort({ position: 1 })
      .lean<ColumnLean[]>();

    const cards = await KanbanCardModel.find({ board: { $in: boardIds } })
      .sort({ position: 1 })
      .lean<CardLean[]>();

    return boards.map((board) => {
      const boardColumns = columns.filter((column) => column.board.equals(board._id));
      const boardCards = cards.filter((card) => card.board.equals(board._id));
      return formatBoard(board, boardColumns, boardCards);
    });
  },

  async createBoard(input: CreateBoardInput, actor: Actor): Promise<KanbanBoardResponse> {
    ensureBoardManager(actor);
    const projectId = await ensureProjectAccess(input.projectId, actor);
    const name = sanitizeString(input.name);
    if (!name) {
      throw new HttpException(400, "Board name is required");
    }

    const board = await KanbanBoardModel.create({
      project: projectId,
      name,
      description: sanitizeString(input.description ?? undefined),
      createdBy: ensureObjectId(actor.id, "userId"),
    });

    const defaultColumns = ["Backlog", "Em andamento", "Concluido"];
    await Promise.all(
      defaultColumns.map((title, index) =>
        KanbanColumnModel.create({
          board: board._id,
          title,
          position: index,
        })
      )
    );

    return buildBoardResponse(board);
  },

  async getBoard(boardId: string, actor: Actor): Promise<KanbanBoardResponse> {
    const board = await ensureBoardAccess(boardId, actor);
    return buildBoardResponse(board);
  },

  async updateBoard(boardId: string, input: UpdateBoardInput, actor: Actor): Promise<KanbanBoardResponse> {
    const board = await ensureBoardAccess(boardId, actor);
    ensureBoardManager(actor);

    if (input.name !== undefined) {
      const name = sanitizeString(input.name);
      if (!name) {
        throw new HttpException(400, "Board name is required");
      }
      board.name = name;
    }

    if (input.description !== undefined) {
      board.description = sanitizeString(input.description);
    }

    if (input.isArchived !== undefined) {
      board.isArchived = Boolean(input.isArchived);
    }

    await board.save();
    return buildBoardResponse(board);
  },

  async setBoardArchiveStatus(boardId: string, isArchived: boolean, actor: Actor): Promise<KanbanBoardResponse> {
    return this.updateBoard(boardId, { isArchived }, actor);
  },

  async createColumn(input: CreateColumnInput, actor: Actor): Promise<KanbanColumnResponse> {
    ensureBoardManager(actor);
    const board = await ensureBoardAccess(input.boardId, actor);
    const title = sanitizeString(input.title);
    if (!title) {
      throw new HttpException(400, "Column title is required");
    }
    const count = await KanbanColumnModel.countDocuments({ board: board._id });
    const column = await KanbanColumnModel.create({
      board: board._id,
      title,
      position: count,
      limit: input.limit ?? undefined,
    });
    return formatColumn(column.toObject() as ColumnLean, []);
  },

  async updateColumn(columnId: string, input: UpdateColumnInput, actor: Actor): Promise<KanbanColumnResponse> {
    ensureBoardManager(actor);
    const column = await ensureColumnAccess(columnId, actor);
    const columnObjectId = column._id as Types.ObjectId;

    if (input.title !== undefined) {
      const title = sanitizeString(input.title);
      if (!title) {
        throw new HttpException(400, "Column title is required");
      }
      column.title = title;
    }

    if (input.limit !== undefined) {
      if (input.limit === null) {
        column.limit = undefined;
      } else if (input.limit < 0) {
        throw new HttpException(400, "Column limit cannot be negative");
      } else {
        column.limit = input.limit;
      }
    }

    if (input.position !== undefined && input.position !== null) {
      const target = Math.max(0, Math.floor(input.position));
      const columnsCount = await KanbanColumnModel.countDocuments({ board: column.board });
      const maxPosition = columnsCount - 1;
      const position = Math.min(target, maxPosition);
      await shiftColumnPositions(column.board as Types.ObjectId, column.position, position);
      column.position = position;
    }

    await column.save();
    const cards = await KanbanCardModel.find({ column: columnObjectId }).sort({ position: 1 }).lean<CardLean[]>();
    return formatColumn(column.toObject() as ColumnLean, cards);
  },

  async deleteColumn(columnId: string, input: DeleteColumnInput, actor: Actor): Promise<void> {
    ensureBoardManager(actor);
    const column = await ensureColumnAccess(columnId, actor);
    const columnIdObj = column._id as Types.ObjectId;
    const boardId = column.board as Types.ObjectId;

    if (input.moveCardsToColumnId) {
      const targetColumn = await ensureColumnAccess(input.moveCardsToColumnId, actor);
      const targetColumnId = targetColumn._id as Types.ObjectId;
      if (!targetColumn.board.equals(boardId)) {
        throw new HttpException(400, "Target column must belong to the same board");
      }

      const targetCount = await KanbanCardModel.countDocuments({ column: targetColumnId });
      await KanbanCardModel.updateMany(
        { column: columnIdObj },
        {
          $set: {
            column: targetColumnId,
            board: boardId,
          },
          $inc: { position: targetCount },
        }
      );
    } else {
      await ensureColumnIsEmpty(columnIdObj);
    }

    const deletedPosition = column.position;
    await column.deleteOne();

    await KanbanColumnModel.updateMany(
      {
        board: boardId,
        position: { $gt: deletedPosition },
      },
      { $inc: { position: -1 } }
    );
  },

  async createCard(input: CreateCardInput, actor: Actor): Promise<KanbanCardResponse> {
    const column = await ensureColumnAccess(input.columnId, actor);
    const columnId = column._id as Types.ObjectId;
    const boardId = column.board as Types.ObjectId;
    const board = await KanbanBoardModel.findById(boardId);
    if (!board) {
      throw new HttpException(404, "Board not found");
    }
    await ensureProjectAccess(board.project.toString(), actor);

    const { tags, status } = ensureCardArrays(input);
    const dueDate = parseDateInput(input.dueDate, "dueDate");
    const projectId = board.project as Types.ObjectId;
    const assignees = await normalizeAssignees(projectId, input.assignees);
    const position = await appendCardToColumn(columnId, input.position ?? undefined);
    const title = sanitizeString(input.title);
    if (!title) {
      throw new HttpException(400, "Card title is required");
    }
    const correction = normalizeCorrection(input.correction ?? undefined);

    const card = await KanbanCardModel.create({
      board: boardId,
      column: columnId,
      project: projectId,
      title,
      description: sanitizeString(input.description),
      position,
      status,
      tags,
      dueDate,
      priority: normalizePriority(input.priority ?? undefined),
      assignees: assignees ?? [],
      createdBy: ensureObjectId(actor.id, "userId"),
      ...(correction ? { correction } : {}),
    });

    const cardId = card._id as Types.ObjectId;
    await logActivity(cardId, ensureObjectId(actor.id, "userId"), "card_created", {
      title: card.title,
      columnId: columnId.toString(),
    });

    return formatCard(card.toObject() as CardLean);
  },

  async updateCard(cardId: string, input: UpdateCardInput, actor: Actor): Promise<KanbanCardResponse> {
    const card = await ensureCardAccess(cardId, actor);
    const cardObjectId = card._id as Types.ObjectId;
    const board = await KanbanBoardModel.findById(card.board);
    if (!board) {
      throw new HttpException(404, "Board not found");
    }

    if (input.title !== undefined) {
      const title = sanitizeString(input.title);
      if (!title) {
        throw new HttpException(400, "Card title is required");
      }
      card.title = title;
    }

    if (input.description !== undefined) {
      card.description = sanitizeString(input.description);
    }

    if (input.status !== undefined) {
      const status = input.status;
      if (!(["todo", "doing", "review", "done"] as const).includes(status)) {
        throw new HttpException(400, "Invalid status");
      }
      card.status = status;
    }

    if (input.tags !== undefined) {
      card.tags = normalizeTags(input.tags);
    }

    if (input.dueDate !== undefined) {
      card.dueDate = parseDateInput(input.dueDate, "dueDate");
    }

    if (input.priority !== undefined) {
      card.priority = normalizePriority(input.priority);
    }

    if (input.assignees !== undefined) {
      const assignees = await normalizeAssignees(board.project as Types.ObjectId, input.assignees);
      card.assignees = assignees ?? [];
    }

    if (input.correction !== undefined) {
      const normalizedCorrection = normalizeCorrection(input.correction ?? undefined);
      card.correction = normalizedCorrection ?? undefined;
    }

    await card.save();

    await logActivity(cardObjectId, ensureObjectId(actor.id, "userId"), "card_updated", {
      cardId: card.id,
    });

    return formatCard(card.toObject() as CardLean);
  },

  async moveCard(cardId: string, input: MoveCardInput, actor: Actor): Promise<KanbanCardResponse> {
    const card = await ensureCardAccess(cardId, actor);
    const cardObjectId = card._id as Types.ObjectId;
    const currentColumnId = card.column;
    const targetColumn = await ensureColumnAccess(input.targetColumnId, actor);
    const targetColumnId = targetColumn._id as Types.ObjectId;
    const targetBoardId = targetColumn.board as Types.ObjectId;

    const currentBoardId = card.board as Types.ObjectId;
    if (!targetBoardId.equals(currentBoardId)) {
      throw new HttpException(400, "Target column must belong to the same board");
    }

    const targetPosition = input.targetPosition ?? undefined;

    await KanbanCardModel.updateMany(
      {
        column: currentColumnId,
        position: { $gt: card.position },
      },
      { $inc: { position: -1 } }
    );

    let newPosition: number;
    if (targetPosition === undefined || targetPosition === null) {
      const count = await KanbanCardModel.countDocuments({ column: targetColumnId });
      newPosition = count;
    } else {
      const normalized = Math.max(0, Math.floor(targetPosition));
      const count = await KanbanCardModel.countDocuments({ column: targetColumnId });
      const capped = Math.min(normalized, count);
      await KanbanCardModel.updateMany(
        {
          column: targetColumnId,
          position: { $gte: capped },
        },
        { $inc: { position: 1 } }
      );
      newPosition = capped;
    }

    card.column = targetColumnId;
    card.position = newPosition;

    if (card.status === "todo" && targetColumn.title.toLowerCase().includes("rev")) {
      card.status = "review";
    }

    await card.save();

    await logActivity(cardObjectId, ensureObjectId(actor.id, "userId"), "card_moved", {
      fromColumnId: currentColumnId.toString(),
      toColumnId: targetColumnId.toString(),
      position: newPosition,
    });

    return formatCard(card.toObject() as CardLean);
  },

  async deleteCard(cardId: string, actor: Actor): Promise<void> {
    const card = await ensureCardAccess(cardId, actor);
    const cardObjectId = card._id as Types.ObjectId;
    await KanbanCardModel.updateMany(
      {
        column: card.column as Types.ObjectId,
        position: { $gt: card.position },
      },
      { $inc: { position: -1 } }
    );
    await logActivity(cardObjectId, ensureObjectId(actor.id, "userId"), "card_deleted", {
      title: card.title,
    });
    await card.deleteOne();
  },

  async listCardActivity(cardId: string, actor: Actor): Promise<CardActivityResponse[]> {
    const card = await ensureCardAccess(cardId, actor);
    const cardObjectId = card._id as Types.ObjectId;
    const activities = await KanbanCardActivityModel.find({ card: cardObjectId })
      .sort({ createdAt: -1 })
      .lean<ActivityLean[]>();
    return activities.map(formatActivity);
  },
};
