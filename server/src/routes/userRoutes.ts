import { Router } from "express";
import { userController } from "../controllers/userController";
import { authMiddleware } from "../middleware/authMiddleware";
import { tenantMiddleware } from "../middleware/tenantMiddleware";
import { authorize } from "../middleware/authorize";
import { checkPermission } from "../middleware/permissionMiddleware";
import { UserRole } from "../models/User";
import { asyncHandler } from "../utils/asyncHandler";

const userRouter = Router();

userRouter.use(authMiddleware, tenantMiddleware);

userRouter.get("/me", asyncHandler(userController.me));
userRouter.get(
  "/",
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER] }),
  checkPermission("users.list"),
  asyncHandler(userController.list)
);
userRouter.get(
  "/:id",
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER], allowSelf: { params: ["id"] } }),
  asyncHandler(userController.get)
);
userRouter.post(
  "/",
  authorize({ roles: [UserRole.ADMIN] }),
  checkPermission("users.create"),
  asyncHandler(userController.create)
);
userRouter.put(
  "/:id",
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER], allowSelf: { params: ["id"] } }),
  asyncHandler(userController.update)
);
userRouter.patch(
  "/:id/role",
  authorize({ roles: [UserRole.ADMIN] }),
  checkPermission("roles.assign"),
  asyncHandler(userController.assignRole)
);
userRouter.delete(
  "/:id",
  authorize({ roles: [UserRole.ADMIN] }),
  checkPermission("users.delete"),
  asyncHandler(userController.remove)
);

export { userRouter };
