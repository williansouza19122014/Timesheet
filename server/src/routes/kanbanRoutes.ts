
import { Router } from "express";
import { kanbanController } from "../controllers/kanbanController";
import { authMiddleware } from "../middleware/authMiddleware";
import { tenantMiddleware } from "../middleware/tenantMiddleware";
import { authorize } from "../middleware/authorize";
import { UserRole } from "../models/User";
import { asyncHandler } from "../utils/asyncHandler";

const kanbanRouter = Router();

kanbanRouter.use(authMiddleware, tenantMiddleware);

kanbanRouter.get("/boards", asyncHandler(kanbanController.listBoards));
kanbanRouter.post(
  "/boards",
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER] }),
  asyncHandler(kanbanController.createBoard)
);
kanbanRouter.put(
  "/boards/:boardId",
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER] }),
  asyncHandler(kanbanController.updateBoard)
);
kanbanRouter.post(
  "/boards/:boardId/archive",
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER] }),
  asyncHandler(kanbanController.archiveBoard)
);

kanbanRouter.post(
  "/columns",
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER] }),
  asyncHandler(kanbanController.createColumn)
);
kanbanRouter.put(
  "/columns/:columnId",
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER] }),
  asyncHandler(kanbanController.updateColumn)
);
kanbanRouter.delete(
  "/columns/:columnId",
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER] }),
  asyncHandler(kanbanController.deleteColumn)
);

kanbanRouter.post("/cards", asyncHandler(kanbanController.createCard));
kanbanRouter.put("/cards/:cardId", asyncHandler(kanbanController.updateCard));
kanbanRouter.post("/cards/:cardId/move", asyncHandler(kanbanController.moveCard));
kanbanRouter.delete("/cards/:cardId", asyncHandler(kanbanController.deleteCard));
kanbanRouter.get("/cards/:cardId/activity", asyncHandler(kanbanController.listCardActivity));

export { kanbanRouter };
