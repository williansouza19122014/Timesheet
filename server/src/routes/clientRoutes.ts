import { Router } from "express";
import { clientController } from "../controllers/clientController";
import { authMiddleware } from "../middleware/authMiddleware";
import { tenantMiddleware } from "../middleware/tenantMiddleware";
import { authorize } from "../middleware/authorize";
import { UserRole } from "../models/User";
import { asyncHandler } from "../utils/asyncHandler";

const clientRouter = Router();

clientRouter.use(authMiddleware, tenantMiddleware);

clientRouter.get("/", asyncHandler(clientController.list));
clientRouter.get("/:id", asyncHandler(clientController.get));
clientRouter.post(
  "/",
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER] }),
  asyncHandler(clientController.create)
);
clientRouter.put(
  "/:id",
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER] }),
  asyncHandler(clientController.update)
);
clientRouter.delete(
  "/:id",
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER] }),
  asyncHandler(clientController.remove)
);

export { clientRouter };
