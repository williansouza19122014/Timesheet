import type { Request, Response } from "express";
import { z } from "zod";
import { authService } from "../services/authService";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function register(req: Request, res: Response) {
  const payload = registerSchema.parse(req.body);
  const result = await authService.register(payload);
  return res.status(201).json(result);
}

export async function login(req: Request, res: Response) {
  const payload = loginSchema.parse(req.body);
  const result = await authService.login(payload);
  return res.json(result);
}

export async function me(req: Request, res: Response) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }
  const token = authHeader.split(" ")[1];
  const result = await authService.getProfile(token);
  return res.json(result);
}
