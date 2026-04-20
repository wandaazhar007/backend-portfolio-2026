import { v4 as uuidv4 } from "uuid";
import { categoriesRepository } from "./categories.repository.js";
import { createSlug } from "../../lib/slug.js";
import { ApiError } from "../../lib/ApiError.js";

export const categoriesService = {
  async create(payload: { name: string }) {
    const slug = createSlug(payload.name);

    const existing = await categoriesRepository.findBySlug(slug);
    if (existing) {
      throw new ApiError(409, "Category slug already exists");
    }

    return categoriesRepository.create({
      uuid: uuidv4(),
      legacyId: null,
      name: payload.name,
      slug
    });
  },

  async findAll() {
    return categoriesRepository.findAll();
  },

  async findByUuid(uuid: string) {
    const category = await categoriesRepository.findByUuid(uuid);
    if (!category) {
      throw new ApiError(404, "Category not found");
    }
    return category;
  },

  async findBySlug(slug: string) {
    const category = await categoriesRepository.findBySlug(slug);
    if (!category) {
      throw new ApiError(404, "Category not found");
    }
    return category;
  },

  async update(uuid: string, payload: { name?: string }) {
    const current = await categoriesRepository.findByUuid(uuid);
    if (!current) {
      throw new ApiError(404, "Category not found");
    }

    const nextSlug = payload.name ? createSlug(payload.name) : current.slug;

    if (payload.name && nextSlug !== current.slug) {
      const duplicate = await categoriesRepository.findBySlug(nextSlug);
      if (duplicate && duplicate.uuid !== uuid) {
        throw new ApiError(409, "Category slug already exists");
      }
    }

    return categoriesRepository.update(uuid, {
      ...(payload.name ? { name: payload.name, slug: nextSlug } : {})
    });
  },

  async remove(uuid: string) {
    const current = await categoriesRepository.findByUuid(uuid);
    if (!current) {
      throw new ApiError(404, "Category not found");
    }

    await categoriesRepository.remove(uuid);
    return true;
  }
};