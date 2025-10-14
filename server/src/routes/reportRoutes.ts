
import { Router } from "express";
import { reportController } from "../controllers/reportController";
import { authMiddleware } from "../middleware/authMiddleware";
import { tenantMiddleware } from "../middleware/tenantMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

const reportRouter = Router();

reportRouter.use(authMiddleware, tenantMiddleware);

reportRouter.get("/time-summary", asyncHandler(reportController.timeSummary));
reportRouter.get("/project-performance", asyncHandler(reportController.projectPerformance));
reportRouter.get("/vacation-summary", asyncHandler(reportController.vacationSummary));
reportRouter.get("/user-workload", asyncHandler(reportController.userWorkload));

export { reportRouter };
