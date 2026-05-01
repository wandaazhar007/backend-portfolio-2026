//src/modules/works/works.controller.ts
import type { Request, Response } from "express";
import { worksService } from "./works.service.js";
import { sendSuccess } from "../../lib/response.js";
import { createWorkSchema, updateWorkSchema } from "./works.schema.js";
import { ApiError } from "../../lib/ApiError.js";
import { getOptionalString, getSingleString } from "../../lib/request.js";

export const worksController = {
  async create(req: Request, res: Response) {
    const parsed = createWorkSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new ApiError(422, "Invalid work payload", parsed.error.flatten());
    }

    const work = await worksService.create(parsed.data);
    return sendSuccess(res, work, "Work created", 201);
  },

  async getAll(req: Request, res: Response) {
    const type = getOptionalString(req.query.type);
    const search = getOptionalString(req.query.search);
    const cursor = getOptionalString(req.query.cursor);
    const isPublishedRaw = getOptionalString(req.query.isPublished);
    const limitRaw = getOptionalString(req.query.limit);

    const data = await worksService.findAll({
      type,
      search,
      cursor,
      isPublished:
        isPublishedRaw !== undefined ? isPublishedRaw === "true" : undefined,
      limit: limitRaw ? Number(limitRaw) : 10
    });

    return sendSuccess(res, data, "Works fetched");
  },

  async getByUuid(req: Request, res: Response) {
    const uuid = getSingleString(req.params.uuid);

    const work = await worksService.findByUuid(uuid);
    return sendSuccess(res, work, "Work fetched");
  },

  async getBySlug(req: Request, res: Response) {
    const slug = getSingleString(req.params.slug);

    const work = await worksService.findBySlug(slug);
    return sendSuccess(res, work, "Work fetched");
  },

  async update(req: Request, res: Response) {
    const uuid = getSingleString(req.params.uuid);

    const parsed = updateWorkSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new ApiError(422, "Invalid work payload", parsed.error.flatten());
    }

    const work = await worksService.update(uuid, parsed.data);
    return sendSuccess(res, work, "Work updated");
  },

  async remove(req: Request, res: Response) {
    const uuid = getSingleString(req.params.uuid);

    await worksService.remove(uuid);
    return sendSuccess(res, null, "Work deleted");
  }
};