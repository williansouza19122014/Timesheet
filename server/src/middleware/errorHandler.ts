import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { MongoServerError } from "mongodb";
import { Error as MongooseError } from "mongoose";
import { HttpException } from "../utils/httpException";

const isMongoDuplicateError = (error: MongoServerError) => error.code === 11000;

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpException) {
    return res.status(err.statusCode).json({
      message: err.message,
      details: err.details,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Invalid request payload",
      issues: err.flatten(),
    });
  }

  if (err instanceof MongooseError.ValidationError) {
    return res.status(400).json({
      message: "Validation failed",
      details: err.errors,
    });
  }

  if (err instanceof MongoServerError) {
    if (isMongoDuplicateError(err)) {
      return res.status(409).json({
        message: "A record with the same value already exists",
        details: err.keyValue,
      });
    }

    if (err.code === 13) {
      return res.status(403).json({
        message: "Database permission denied",
        details: err.errmsg ?? err.message,
      });
    }

    console.error("Mongo error", err);
    return res.status(500).json({
      message: "Database operation failed",
    });
  }

  console.error("Unexpected error", err);
  return res.status(500).json({
    message: "Internal server error",
  });
}
