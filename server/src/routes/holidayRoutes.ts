import { Router } from "express";
import { holidayController } from "../controllers/holidayController";
import { authMiddleware } from "../middleware/authMiddleware";
import { tenantMiddleware } from "../middleware/tenantMiddleware";
import { authorize } from "../middleware/authorize";
import { UserRole } from "../models/User";
import { asyncHandler } from "../utils/asyncHandler";

const holidayRouter = Router();

holidayRouter.use(authMiddleware, tenantMiddleware);

holidayRouter.get(
  "/",
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER] }),
  asyncHandler(holidayController.list)
);

holidayRouter.post(
  "/",
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER] }),
  asyncHandler(holidayController.create)
);

holidayRouter.put(
  "/:id",
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER] }),
  asyncHandler(holidayController.update)
);

holidayRouter.delete(
  "/:id",
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER] }),
  asyncHandler(holidayController.remove)
);

export { holidayRouter };
