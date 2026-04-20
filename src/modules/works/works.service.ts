import { v4 as uuidv4 } from "uuid";
import { worksRepository } from "./works.repository.js";
import { createSlug } from "../../lib/slug.js";
import { normalizeText } from "../../lib/normalize.js";
import { ApiError } from "../../lib/ApiError.js";
import type { WorkImage } from "../../types/work.js";

export const worksService = {
  async create(payload: {
    name: string;
    desc: string;
    preview: string;
    github: string;
    tags: string[];
    license: string;
    type: string;
    isPublished: boolean;
    image?: WorkImage | null;
  }) {
    const slug = createSlug(payload.name);

    const duplicate = await worksRepository.findBySlug(slug);
    if (duplicate) {
      throw new ApiError(409, "Work slug already exists");
    }

    return worksRepository.create({
      uuid: uuidv4(),
      legacyId: null,
      slug,
      name: payload.name,
      desc: payload.desc,
      preview: payload.preview,
      github: payload.github,
      tags: payload.tags,
      license: payload.license,
      type: payload.type,
      image: payload.image ?? null,
      normalizedName: normalizeText(payload.name),
      isPublished: payload.isPublished
    });
  },

  async findAll(query: {
    type?: string;
    search?: string;
    isPublished?: boolean;
    limit?: number;
    cursor?: string;
  }) {
    return worksRepository.findAll({
      ...query,
      search: query.search ? normalizeText(query.search) : undefined
    });
  },

  async findByUuid(uuid: string) {
    const work = await worksRepository.findByUuid(uuid);
    if (!work) {
      throw new ApiError(404, "Work not found");
    }
    return work;
  },

  async findBySlug(slug: string) {
    const work = await worksRepository.findBySlug(slug);
    if (!work) {
      throw new ApiError(404, "Work not found");
    }
    return work;
  },

  async update(
    uuid: string,
    payload: Partial<{
      name: string;
      desc: string;
      preview: string;
      github: string;
      tags: string[];
      license: string;
      type: string;
      isPublished: boolean;
      image: WorkImage | null;
    }>
  ) {
    const current = await worksRepository.findByUuid(uuid);
    if (!current) {
      throw new ApiError(404, "Work not found");
    }

    let slug = current.slug;
    if (payload.name && payload.name !== current.name) {
      slug = createSlug(payload.name);
      const duplicate = await worksRepository.findBySlug(slug);
      if (duplicate && duplicate.uuid !== uuid) {
        throw new ApiError(409, "Work slug already exists");
      }
    }

    return worksRepository.update(uuid, {
      ...payload,
      ...(payload.name
        ? {
          slug,
          normalizedName: normalizeText(payload.name)
        }
        : {})
    });
  },

  async remove(uuid: string) {
    const current = await worksRepository.findByUuid(uuid);
    if (!current) {
      throw new ApiError(404, "Work not found");
    }

    await worksRepository.remove(uuid);
    return true;
  }
};