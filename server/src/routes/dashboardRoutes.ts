import { Router } from "express";
import { dashboardController } from "../controllers/dashboardController";
import { authMiddleware } from "../middleware/authMiddleware";
import { tenantMiddleware } from "../middleware/tenantMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

const dashboardRouter = Router();

dashboardRouter.use(authMiddleware, tenantMiddleware);

dashboardRouter.get("/overview", asyncHandler(dashboardController.overview));

export { dashboardRouter };
