import { Router, type Response, type NextFunction } from "express";
import { vacationController } from "../controllers/vacationController";
import { authMiddleware, type AuthenticatedRequest } from "../middleware/authMiddleware";
import { tenantMiddleware } from "../middleware/tenantMiddleware";
import { authorize } from "../middleware/authorize";
import { UserRole } from "../models/User";
import { vacationService } from "../services/vacationService";
import { asyncHandler } from "../utils/asyncHandler";

const vacationRouter = Router();

const resolvePeriodOwner = async (req: AuthenticatedRequest) => {
  if (!req.params?.id || !req.tenantId) {
    return undefined;
  }
  const period = await vacationService.getPeriodById(req.tenantId, req.params.id);
  return period.userId;
};

const resolveRequestOwner = async (req: AuthenticatedRequest) => {
  if (!req.params?.id || !req.tenantId) {
    return undefined;
  }
  const request = await vacationService.getRequestById(req.tenantId, req.params.id);
  return request.userId;
};

const ensureSelfFilter = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  if (req.userRole === UserRole.ADMIN || req.userRole === UserRole.MANAGER) {
    return next();
  }
  req.query.userId = req.userId ?? "";
  return next();
};

// Apply authentication to all vacation routes
vacationRouter.use(authMiddleware, tenantMiddleware);

// ==================== VACATION PERIODS ====================
vacationRouter.get(
  "/periods",
  ensureSelfFilter,
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER], allowSelf: { query: ["userId"] } }),
  asyncHandler(vacationController.listPeriods)
);
vacationRouter.get(
  "/periods/:id",
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER], allowSelf: { resolver: resolvePeriodOwner } }),
  asyncHandler(vacationController.getPeriod)
);
vacationRouter.post(
  "/periods",
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER] }),
  asyncHandler(vacationController.createPeriod)
);
vacationRouter.put(
  "/periods/:id",
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER] }),
  asyncHandler(vacationController.updatePeriod)
);
vacationRouter.delete(
  "/periods/:id",
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER] }),
  asyncHandler(vacationController.deletePeriod)
);

// ==================== VACATION REQUESTS ====================
vacationRouter.get(
  "/requests",
  ensureSelfFilter,
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER], allowSelf: { query: ["userId"] } }),
  asyncHandler(vacationController.listRequests)
);
vacationRouter.get(
  "/requests/:id",
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER], allowSelf: { resolver: resolveRequestOwner } }),
  asyncHandler(vacationController.getRequest)
);
vacationRouter.post(
  "/requests",
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER], allowSelf: { body: ["userId"] } }),
  asyncHandler(vacationController.createRequest)
);
vacationRouter.put(
  "/requests/:id",
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER], allowSelf: { resolver: resolveRequestOwner } }),
  asyncHandler(vacationController.updateRequest)
);
vacationRouter.post(
  "/requests/:id/cancel",
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER], allowSelf: { resolver: resolveRequestOwner } }),
  asyncHandler(vacationController.cancelRequest)
);
vacationRouter.delete(
  "/requests/:id",
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER], allowSelf: { resolver: resolveRequestOwner } }),
  asyncHandler(vacationController.deleteRequest)
);

export { vacationRouter };
