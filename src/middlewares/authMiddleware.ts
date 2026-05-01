//src/middlewares/authMiddleware.ts
import type { NextFunction, Request, Response } from "express";
import { auth } from "../config/firebaseAdmin.js";
import { ApiError } from "../lib/ApiError.js";
import { env } from "../config/env.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    isAdmin: boolean;
  };
}

export async function requireAdmin(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return next(new ApiError(401, "Unauthorized: No token provided"));
  }

  const token = authorization.split(" ")[1];

  try {
    const decoded = await auth.verifyIdToken(token);
    const email = decoded.email?.toLowerCase();
    const isAdmin =
      Boolean(decoded.admin) || (email ? env.ADMIN_EMAILS.includes(email) : false);

    if (!isAdmin) {
      return next(new ApiError(403, "Forbidden: Admin access required"));
    }

    req.user = {
      uid: decoded.uid,
      email,
      isAdmin
    };

    next();
  } catch {
    next(new ApiError(401, "Unauthorized: Invalid or expired token"));
  }
}