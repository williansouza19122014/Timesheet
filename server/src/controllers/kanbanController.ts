
import type { Response } from "express";
import { z } from "zod";
import { kanbanService } from "../services/kanbanService";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";
import { UserRole } from "../models/User";
import { HttpException } from "../utils/httpException";

const listBoardsSchema = z.object({
  projectId: z.string().optional(),
  includeArchived: z.coerce.boolean().optional(),
});

const createBoardSchema = z.object({
  projectId: z.string().min(1, "projectId is required"),
  name: z.string().min(2),
  description: z.string().optional().nullable(),
});

const updateBoardSchema = z.object({
  name: z.string().min(2).optional().nullable(),
  description: z.string().optional().nullable(),
  isArchived: z.coerce.boolean().optional(),
});

const archiveBoardSchema = z.object({
  isArchived: z.coerce.boolean().optional(),
});

const nonNegativeInt = z.number().int().nonnegative();

const createColumnSchema = z.object({
  boardId: z.string().min(1),
  title: z.string().min(1),
  limit: z.union([nonNegativeInt, z.null()]).optional(),
});

const updateColumnSchema = z.object({
  title: z.string().min(1).optional().nullable(),
  limit: z.union([nonNegativeInt, z.null()]).optional(),
  position: z.union([nonNegativeInt, z.null()]).optional(),
});

const deleteColumnSchema = z.object({
  moveCardsToColumnId: z.string().optional().nullable(),
});

const correctionTimeSchema = z.object({
  entrada: z.string().optional().nullable(),
  saida: z.string().optional().nullable(),
});

const correctionSchema = z
  .object({
    date: z.string().optional().nullable(),
    justification: z.string().optional().nullable(),
    documentName: z.string().optional().nullable(),
    times: z.array(correctionTimeSchema).optional().nullable(),
  })
  .optional()
  .nullable();

const createCardSchema = z.object({
  columnId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  status: z.enum(["todo", "doing", "review", "done"]).optional(),
  tags: z.union([z.array(z.string()), z.string()]).optional().nullable(),
  dueDate: z.string().optional().nullable(),
  priority: z.enum(["low", "medium", "high"]).optional().nullable(),
  assignees: z.array(z.string()).optional().nullable(),
  position: z.union([z.coerce.number().int().nonnegative(), z.null()]).optional(),
  correction: correctionSchema,
});

const updateCardSchema = z.object({
  title: z.string().min(1).optional().nullable(),
  description: z.string().optional().nullable(),
  status: z.enum(["todo", "doing", "review", "done"]).optional(),
  tags: z.union([z.array(z.string()), z.string()]).optional().nullable(),
  dueDate: z.string().optional().nullable(),
  priority: z.enum(["low", "medium", "high"]).optional().nullable(),
  assignees: z.array(z.string()).optional().nullable(),
  correction: correctionSchema,
});

const moveCardSchema = z.object({
  targetColumnId: z.string().min(1),
  targetPosition: z.union([z.coerce.number().int().nonnegative(), z.null()]).optional(),
});

const activityParamsSchema = z.object({
  cardId: z.string().min(1),
});
const boardParamSchema = z.object({ boardId: z.string().min(1) });
const columnParamSchema = z.object({ columnId: z.string().min(1) });
const cardParamSchema = z.object({ cardId: z.string().min(1) });

const getActor = (req: AuthenticatedRequest) => {
  if (!req.userId || !req.userRole) {
    throw new HttpException(401, "Unauthorized");
  }
  return { id: req.userId, role: req.userRole as UserRole };
};

export const kanbanController = {
  async listBoards(req: AuthenticatedRequest, res: Response) {
    const { projectId, includeArchived } = listBoardsSchema.parse(req.query);
    const actor = getActor(req);
    const boards = await kanbanService.listBoards({ projectId, includeArchived }, actor);
    return res.json(boards);
  },

  async createBoard(req: AuthenticatedRequest, res: Response) {
    const payload = createBoardSchema.parse(req.body);
    const actor = getActor(req);
    const board = await kanbanService.createBoard(payload, actor);
    return res.status(201).json(board);
  },

  async updateBoard(req: AuthenticatedRequest, res: Response) {
    const { boardId } = boardParamSchema.parse(req.params);
    const payload = updateBoardSchema.parse(req.body);
    const actor = getActor(req);
    const board = await kanbanService.updateBoard(boardId, payload, actor);
    return res.json(board);
  },

  async archiveBoard(req: AuthenticatedRequest, res: Response) {
    const { boardId } = boardParamSchema.parse(req.params);
    const { isArchived = true } = archiveBoardSchema.parse(req.body ?? {});
    const actor = getActor(req);
    const board = await kanbanService.setBoardArchiveStatus(boardId, isArchived, actor);
    return res.json(board);
  },

  async createColumn(req: AuthenticatedRequest, res: Response) {
    const payload = createColumnSchema.parse(req.body);
    const actor = getActor(req);
    const column = await kanbanService.createColumn(payload, actor);
    return res.status(201).json(column);
  },

  async updateColumn(req: AuthenticatedRequest, res: Response) {
    const { columnId } = columnParamSchema.parse(req.params);
    const payload = updateColumnSchema.parse(req.body ?? {});
    const actor = getActor(req);
    const column = await kanbanService.updateColumn(columnId, payload, actor);
    return res.json(column);
  },

  async deleteColumn(req: AuthenticatedRequest, res: Response) {
    const { columnId } = columnParamSchema.parse(req.params);
    const payload = deleteColumnSchema.parse(req.body ?? {});
    const actor = getActor(req);
    await kanbanService.deleteColumn(columnId, payload, actor);
    return res.status(204).send();
  },

  async createCard(req: AuthenticatedRequest, res: Response) {
    const payload = createCardSchema.parse(req.body);
    const actor = getActor(req);
    const card = await kanbanService.createCard(payload, actor);
    return res.status(201).json(card);
  },

  async updateCard(req: AuthenticatedRequest, res: Response) {
    const { cardId } = cardParamSchema.parse(req.params);
    const payload = updateCardSchema.parse(req.body ?? {});
    const actor = getActor(req);
    const card = await kanbanService.updateCard(cardId, payload, actor);
    return res.json(card);
  },

  async moveCard(req: AuthenticatedRequest, res: Response) {
    const { cardId } = cardParamSchema.parse(req.params);
    const payload = moveCardSchema.parse(req.body ?? {});
    const actor = getActor(req);
    const card = await kanbanService.moveCard(cardId, payload, actor);
    return res.json(card);
  },

  async deleteCard(req: AuthenticatedRequest, res: Response) {
    const { cardId } = cardParamSchema.parse(req.params);
    const actor = getActor(req);
    await kanbanService.deleteCard(cardId, actor);
    return res.status(204).send();
  },

  async listCardActivity(req: AuthenticatedRequest, res: Response) {
    const { cardId } = activityParamsSchema.parse(req.params);
    const actor = getActor(req);
    const activity = await kanbanService.listCardActivity(cardId, actor);
    return res.json(activity);
  },
};
