import { sign, verify, type JwtPayload, type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { HttpException } from "./httpException";

const TOKEN_EXPIRATION = process.env.JWT_EXPIRATION ?? "8h";

export interface TokenPayload {
  userId: string;
  tenantId: string;
  role: string;
  permissions: string[];
}

export function generateToken(payload: TokenPayload): string {
  const { userId, ...claims } = payload;
  const options: SignOptions = {
    subject: userId,
  };

  if (TOKEN_EXPIRATION) {
    options.expiresIn = TOKEN_EXPIRATION as SignOptions["expiresIn"];
  }

  return sign({ ...claims, userId }, env.JWT_SECRET, options);
}

export function verifyToken(token: string): TokenPayload {
  try {
    const decoded = verify(token, env.JWT_SECRET) as JwtPayload & Partial<TokenPayload>;

    const userId =
      decoded.userId ?? (typeof decoded.sub === "string" ? decoded.sub : undefined);
    const tenantId = decoded.tenantId;
    const role = decoded.role;
    const permissions = Array.isArray(decoded.permissions) ? decoded.permissions : [];

    if (!userId || typeof tenantId !== "string" || typeof role !== "string") {
      throw new HttpException(401, "Invalid token payload");
    }

    return {
      userId,
      tenantId,
      role,
      permissions,
    };
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }
    throw new HttpException(401, "Invalid or expired token", error);
  }
}
