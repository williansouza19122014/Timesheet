import { Router } from "express";
import { projectController } from "../controllers/projectController";
import { authMiddleware } from "../middleware/authMiddleware";
import { tenantMiddleware } from "../middleware/tenantMiddleware";
import { authorize } from "../middleware/authorize";
import { UserRole } from "../models/User";
import { asyncHandler } from "../utils/asyncHandler";

const projectRouter = Router();

// Apply authentication to all project routes
projectRouter.use(authMiddleware, tenantMiddleware);

// ==================== PROJECTS ====================
projectRouter.get("/", asyncHandler(projectController.listProjects));
projectRouter.get("/:id", asyncHandler(projectController.getProject));
projectRouter.post(
  "/",
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER] }),
  asyncHandler(projectController.createProject)
);
projectRouter.put(
  "/:id",
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER] }),
  asyncHandler(projectController.updateProject)
);
projectRouter.delete(
  "/:id",
  authorize({ roles: [UserRole.ADMIN] }),
  asyncHandler(projectController.deleteProject)
);

// ==================== PROJECT MEMBERS ====================
projectRouter.get("/:id/members", asyncHandler(projectController.listMembers));
projectRouter.get("/:id/members/active", asyncHandler(projectController.listActiveMembers));
projectRouter.post(
  "/:id/members",
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER] }),
  asyncHandler(projectController.addMember)
);
projectRouter.get("/:projectId/members/:memberId", asyncHandler(projectController.getMember));
projectRouter.put(
  "/:projectId/members/:memberId",
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER] }),
  asyncHandler(projectController.updateMember)
);
projectRouter.delete(
  "/:projectId/members/:memberId",
  authorize({ roles: [UserRole.ADMIN, UserRole.MANAGER] }),
  asyncHandler(projectController.removeMember)
);

export { projectRouter };
