import { Router } from "express";
import { register, login, me } from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";
import { tenantMiddleware } from "../middleware/tenantMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

const authRouter = Router();

authRouter.post("/register", asyncHandler(register));
authRouter.post("/login", asyncHandler(login));
authRouter.get("/me", authMiddleware, tenantMiddleware, asyncHandler(me));

export { authRouter };
