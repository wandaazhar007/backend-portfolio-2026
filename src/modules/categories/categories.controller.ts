import type { Request, Response } from "express";
import { categoriesService } from "./categories.service.js";
import { sendSuccess } from "../../lib/response.js";
import { createCategorySchema, updateCategorySchema } from "./categories.schema.js";
import { ApiError } from "../../lib/ApiError.js";
import { getSingleString } from "../../lib/request.js";

export const categoriesController = {
  async create(req: Request, res: Response) {
    const parsed = createCategorySchema.safeParse(req.body);

    if (!parsed.success) {
      throw new ApiError(422, "Invalid category payload", parsed.error.flatten());
    }

    const category = await categoriesService.create(parsed.data);
    return sendSuccess(res, category, "Category created", 201);
  },

  async getAll(_req: Request, res: Response) {
    const categories = await categoriesService.findAll();
    return sendSuccess(res, categories, "Categories fetched");
  },

  async getByUuid(req: Request, res: Response) {
    const uuid = getSingleString(req.params.uuid);

    const category = await categoriesService.findByUuid(uuid);
    return sendSuccess(res, category, "Category fetched");
  },

  async getBySlug(req: Request, res: Response) {
    const slug = getSingleString(req.params.slug);

    const category = await categoriesService.findBySlug(slug);
    return sendSuccess(res, category, "Category fetched");
  },

  async update(req: Request, res: Response) {
    const uuid = getSingleString(req.params.uuid);

    const parsed = updateCategorySchema.safeParse(req.body);

    if (!parsed.success) {
      throw new ApiError(422, "Invalid category payload", parsed.error.flatten());
    }

    const category = await categoriesService.update(uuid, parsed.data);
    return sendSuccess(res, category, "Category updated");
  },

  async remove(req: Request, res: Response) {
    const uuid = getSingleString(req.params.uuid);

    await categoriesService.remove(uuid);
    return sendSuccess(res, null, "Category deleted");
  }
};