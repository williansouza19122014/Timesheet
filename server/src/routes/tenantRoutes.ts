import { Router } from "express";
import { tenantController } from "../controllers/tenantController";
import { asyncHandler } from "../utils/asyncHandler";

const tenantRouter = Router();

tenantRouter.post("/register", asyncHandler(tenantController.register));

export { tenantRouter };
