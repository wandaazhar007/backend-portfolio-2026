import type { Request, Response } from "express";
import { blogsService } from "./blogs.service.js";
import { sendSuccess } from "../../lib/response.js";
import { createBlogSchema, updateBlogSchema } from "./blogs.schema.js";
import { ApiError } from "../../lib/ApiError.js";
import { getOptionalString, getSingleString } from "../../lib/request.js";

export const blogsController = {
  async create(req: Request, res: Response) {
    const parsed = createBlogSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new ApiError(422, "Invalid blog payload", parsed.error.flatten());
    }

    const blog = await blogsService.create(parsed.data);
    return sendSuccess(res, blog, "Blog created", 201);
  },

  async getAll(req: Request, res: Response) {
    const categorySlug = getOptionalString(req.query.category);
    const search = getOptionalString(req.query.search);
    const cursor = getOptionalString(req.query.cursor);
    const isPublishedRaw = getOptionalString(req.query.isPublished);
    const limitRaw = getOptionalString(req.query.limit);

    const data = await blogsService.findAll({
      categorySlug,
      search,
      cursor,
      isPublished:
        isPublishedRaw !== undefined ? isPublishedRaw === "true" : undefined,
      limit: limitRaw ? Number(limitRaw) : 10
    });

    return sendSuccess(res, data, "Blogs fetched");
  },

  async getByUuid(req: Request, res: Response) {
    const uuid = getSingleString(req.params.uuid);

    const blog = await blogsService.findByUuid(uuid);
    return sendSuccess(res, blog, "Blog fetched");
  },

  async getBySlug(req: Request, res: Response) {
    const slug = getSingleString(req.params.slug);

    const blog = await blogsService.findBySlug(slug);
    return sendSuccess(res, blog, "Blog fetched");
  },

  async update(req: Request, res: Response) {
    const uuid = getSingleString(req.params.uuid);

    const parsed = updateBlogSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new ApiError(422, "Invalid blog payload", parsed.error.flatten());
    }

    const blog = await blogsService.update(uuid, parsed.data);
    return sendSuccess(res, blog, "Blog updated");
  },

  async remove(req: Request, res: Response) {
    const uuid = getSingleString(req.params.uuid);

    await blogsService.remove(uuid);
    return sendSuccess(res, null, "Blog deleted");
  }
};