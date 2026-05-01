//src/modules/uploads/uploads.controller.ts
import type { Request, Response } from "express";
import { uploadsService } from "./uploads.service.js";
import { sendSuccess } from "../../lib/response.js";
import { ApiError } from "../../lib/ApiError.js";

export const uploadsController = {
  async uploadImage(req: Request, res: Response) {
    const folder = req.body.folder as "works" | "blogs" | "categories";
    const entityId = req.body.entityId as string;
    const file = req.file;

    if (!folder || !entityId || !file) {
      throw new ApiError(422, "folder, entityId, and file are required");
    }

    const result = await uploadsService.uploadImage({
      folder,
      entityId,
      file
    });

    return sendSuccess(res, result, "Image uploaded", 201);
  }
};