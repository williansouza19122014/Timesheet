import { Router } from "express";
import { authRouter } from "./authRoutes";
import { clientRouter } from "./clientRoutes";
import { projectRouter } from "./projectRoutes";
import { timesheetRouter } from "./timesheetRoutes";
import { vacationRouter } from "./vacationRoutes";
import { kanbanRouter } from "./kanbanRoutes";
import { reportRouter } from "./reportRoutes";
import { dashboardRouter } from "./dashboardRoutes";
import { userRouter } from "./userRoutes";
import { tenantRouter } from "./tenantRoutes";
import { roleRouter } from "./roleRoutes";

const router = Router();

router.use("/auth", authRouter);
router.use("/tenants", tenantRouter);
router.use("/clients", clientRouter);
router.use("/projects", projectRouter);
router.use("/timesheet", timesheetRouter);
router.use("/vacations", vacationRouter);
router.use("/kanban", kanbanRouter);
router.use("/reports", reportRouter);
router.use("/dashboard", dashboardRouter);
router.use("/users", userRouter);
router.use("/roles", roleRouter);

export { router };
