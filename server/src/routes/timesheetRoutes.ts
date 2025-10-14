import { Router } from "express";
import { timeEntryController } from "../controllers/timeEntryController";
import { authMiddleware, type AuthenticatedRequest } from "../middleware/authMiddleware";
import { tenantMiddleware } from "../middleware/tenantMiddleware";
import { authorize } from "../middleware/authorize";
import { UserRole } from "../models/User";
import { timeEntryService } from "../services/timeEntryService";
import { asyncHandler } from "../utils/asyncHandler";

const timesheetRouter = Router();

const resolveEntryOwner = async (req: AuthenticatedRequest) => {
  if (!req.params?.id) {
    return undefined;
  }
  const entry = await timeEntryService.getEntryById(req.params.id);
  return entry.userId;
};

timesheetRouter.use(authMiddleware, tenantMiddleware);

timesheetRouter.get(
  "/",
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER], allowSelf: { query: ["userId"] } }),
  asyncHandler(timeEntryController.list)
);

timesheetRouter.get(
  "/:id",
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER], allowSelf: { resolver: resolveEntryOwner } }),
  asyncHandler(timeEntryController.get)
);

timesheetRouter.post(
  "/",
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER], allowSelf: { body: ["userId"] } }),
  asyncHandler(timeEntryController.create)
);

timesheetRouter.put(
  "/:id",
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER], allowSelf: { resolver: resolveEntryOwner } }),
  asyncHandler(timeEntryController.update)
);

timesheetRouter.delete(
  "/:id",
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER], allowSelf: { resolver: resolveEntryOwner } }),
  asyncHandler(timeEntryController.remove)
);

export { timesheetRouter };
