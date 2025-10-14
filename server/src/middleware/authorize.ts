import type { Response, NextFunction } from "express";
import { HttpException } from "../utils/httpException";
import type { AuthenticatedRequest } from "./authMiddleware";
import { UserRole } from "../models/User";

type OwnershipResolver = (
  req: AuthenticatedRequest
) => Promise<string | null | undefined> | string | null | undefined;

interface OwnershipOptions {
  params?: string[];
  query?: string[];
  body?: string[];
  resolver?: OwnershipResolver;
}

interface AuthorizeOptions {
  roles?: UserRole[];
  allowSelf?: boolean | OwnershipOptions;
}

const defaultSelfOptions: OwnershipOptions = {
  params: ["id"],
  query: ["userId"],
  body: ["userId"],
};

const toComparable = (value: unknown): string | undefined => {
  if (Array.isArray(value)) {
    return value.length ? toComparable(value[0]) : undefined;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return undefined;
};

const getNestedValue = (source: unknown, keyPath: string): string | undefined => {
  if (!source || typeof source !== "object") {
    return undefined;
  }

  const rawValue = keyPath.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object" && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, source as Record<string, unknown>);

  return toComparable(rawValue);
};

const matchesSelf = (
  req: AuthenticatedRequest,
  options: OwnershipOptions,
  requesterId: string
): boolean => {
  const { params = [], query = [], body = [] } = options;

  const paramMatch = params.some((key) => toComparable(req.params?.[key]) === requesterId);
  if (paramMatch) return true;

  const queryMatch = query.some((key) => toComparable(req.query?.[key]) === requesterId);
  if (queryMatch) return true;

  const bodyMatch = body.some((key) => getNestedValue(req.body, key) === requesterId);
  return bodyMatch;
};

export const authorize = (options: AuthorizeOptions = {}) => {
  const { roles = [], allowSelf } = options;
  const ownershipOptions =
    typeof allowSelf === "boolean"
      ? allowSelf
        ? defaultSelfOptions
        : undefined
      : allowSelf;

  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const requesterId = req.userId;
      const requesterRole = req.userRole as UserRole | undefined;

      if (!requesterId || !requesterRole) {
        throw new HttpException(401, "Unauthorized");
      }

      const roleAllowed = roles.length === 0 || roles.includes(requesterRole);
      if (roleAllowed) {
        return next();
      }

      if (ownershipOptions) {
        if (matchesSelf(req, ownershipOptions, requesterId)) {
          return next();
        }

        if (ownershipOptions.resolver) {
          const ownerId = await ownershipOptions.resolver(req);
          if (ownerId && toComparable(ownerId) === requesterId) {
            return next();
          }
        }
      }

      throw new HttpException(403, "Forbidden");
    } catch (error) {
      next(error);
    }
  };
};
