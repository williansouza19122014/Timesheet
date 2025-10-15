import { Router } from "express";
import { roleController } from "../controllers/roleController";
import { authMiddleware } from "../middleware/authMiddleware";
import { tenantMiddleware } from "../middleware/tenantMiddleware";
import { authorize } from "../middleware/authorize";
import { UserRole } from "../models/User";
import { checkPermission } from "../middleware/permissionMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

const roleRouter = Router();

roleRouter.use(authMiddleware, tenantMiddleware);

roleRouter.get("/", authorize({ roles: [UserRole.ADMIN] }), checkPermission("roles.list"), asyncHandler(roleController.list));

roleRouter.post(
  "/",
  authorize({ roles: [UserRole.ADMIN] }),
  checkPermission("roles.create"),
  asyncHandler(roleController.create)
);

export { roleRouter };
