
import { Router } from "express";
import { reportController } from "../controllers/reportController";
import { authMiddleware } from "../middleware/authMiddleware";
import { tenantMiddleware } from "../middleware/tenantMiddleware";
import { authorize } from "../middleware/authorize";
import { UserRole } from "../models/User";
import { checkPermission } from "../middleware/permissionMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

const reportRouter = Router();

reportRouter.use(authMiddleware, tenantMiddleware);
reportRouter.use(authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER] }));

reportRouter.get(
  "/time-summary",
  checkPermission("reports.view"),
  asyncHandler(reportController.timeSummary)
);
reportRouter.get(
  "/project-performance",
  checkPermission("reports.view"),
  asyncHandler(reportController.projectPerformance)
);
reportRouter.get(
  "/vacation-summary",
  checkPermission("reports.view"),
  asyncHandler(reportController.vacationSummary)
);
reportRouter.get(
  "/user-workload",
  checkPermission("reports.view"),
  asyncHandler(reportController.userWorkload)
);

export { reportRouter };
