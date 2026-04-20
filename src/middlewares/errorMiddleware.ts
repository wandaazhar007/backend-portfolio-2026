import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../lib/ApiError.js";

export function errorMiddleware(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      details: error.details ?? null
    });
  }

  console.error("Unhandled Error:", error);

  return res.status(500).json({
    success: false,
    message: "Internal Server Error"
  });
}