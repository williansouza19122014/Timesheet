import { Router } from "express";
import { clientController } from "../controllers/clientController";
import { authMiddleware } from "../middleware/authMiddleware";
import { tenantMiddleware } from "../middleware/tenantMiddleware";
import { authorize } from "../middleware/authorize";
import { checkPermission } from "../middleware/permissionMiddleware";
import { UserRole } from "../models/User";
import { asyncHandler } from "../utils/asyncHandler";

const clientRouter = Router();

clientRouter.use(authMiddleware, tenantMiddleware);

clientRouter.get("/", asyncHandler(clientController.list));
clientRouter.get("/:id", asyncHandler(clientController.get));
clientRouter.post(
  "/",
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER] }),
  checkPermission("clients.create"),
  asyncHandler(clientController.create)
);
clientRouter.put(
  "/:id",
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER] }),
  checkPermission("clients.update"),
  asyncHandler(clientController.update)
);
clientRouter.delete(
  "/:id",
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER] }),
  checkPermission("clients.delete"),
  asyncHandler(clientController.remove)
);

export { clientRouter };
