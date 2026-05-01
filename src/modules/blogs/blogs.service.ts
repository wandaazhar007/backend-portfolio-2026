//src/modules/blogs/blogs.service.ts
import { v4 as uuidv4 } from "uuid";
import { blogsRepository } from "./blogs.repository.js";
import { categoriesRepository } from "../categories/categories.repository.js";
import { createSlug } from "../../lib/slug.js";
import { normalizeText } from "../../lib/normalize.js";
import { ApiError } from "../../lib/ApiError.js";
import type { BlogImage } from "../../types/blog.js";

export const blogsService = {
  async create(payload: {
    title: string;
    desc: string;
    categoryUuid: string;
    link: string;
    author: string;
    license: string;
    isPublished: boolean;
    image?: BlogImage | null;
  }) {
    const slug = createSlug(payload.title);

    const duplicate = await blogsRepository.findBySlug(slug);
    if (duplicate) {
      throw new ApiError(409, "Blog slug already exists");
    }

    const category = await categoriesRepository.findByUuid(payload.categoryUuid);
    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    return blogsRepository.create({
      uuid: uuidv4(),
      legacyId: null,
      title: payload.title,
      slug,
      desc: payload.desc,
      categoryUuid: category.uuid,
      categoryName: category.name,
      categorySlug: category.slug,
      link: payload.link,
      author: payload.author,
      license: payload.license,
      image: payload.image ?? null,
      normalizedTitle: normalizeText(payload.title),
      isPublished: payload.isPublished
    });
  },

  async findAll(query: {
    categorySlug?: string;
    search?: string;
    isPublished?: boolean;
    limit?: number;
    cursor?: string;
  }) {
    return blogsRepository.findAll({
      ...query,
      search: query.search ? normalizeText(query.search) : undefined
    });
  },

  async findByUuid(uuid: string) {
    const blog = await blogsRepository.findByUuid(uuid);
    if (!blog) {
      throw new ApiError(404, "Blog not found");
    }
    return blog;
  },

  async findBySlug(slug: string) {
    const blog = await blogsRepository.findBySlug(slug);
    if (!blog) {
      throw new ApiError(404, "Blog not found");
    }
    return blog;
  },

  async update(
    uuid: string,
    payload: Partial<{
      title: string;
      desc: string;
      categoryUuid: string;
      link: string;
      author: string;
      license: string;
      isPublished: boolean;
      image: BlogImage | null;
    }>
  ) {
    const current = await blogsRepository.findByUuid(uuid);
    if (!current) {
      throw new ApiError(404, "Blog not found");
    }

    let nextSlug = current.slug;
    if (payload.title && payload.title !== current.title) {
      nextSlug = createSlug(payload.title);
      const duplicate = await blogsRepository.findBySlug(nextSlug);
      if (duplicate && duplicate.uuid !== uuid) {
        throw new ApiError(409, "Blog slug already exists");
      }
    }

    let categoryData = {};
    if (payload.categoryUuid) {
      const category = await categoriesRepository.findByUuid(payload.categoryUuid);
      if (!category) {
        throw new ApiError(404, "Category not found");
      }

      categoryData = {
        categoryUuid: category.uuid,
        categoryName: category.name,
        categorySlug: category.slug
      };
    }

    return blogsRepository.update(uuid, {
      ...payload,
      ...categoryData,
      ...(payload.title
        ? {
          slug: nextSlug,
          normalizedTitle: normalizeText(payload.title)
        }
        : {})
    });
  },

  async remove(uuid: string) {
    const current = await blogsRepository.findByUuid(uuid);
    if (!current) {
      throw new ApiError(404, "Blog not found");
    }

    await blogsRepository.remove(uuid);
    return true;
  }
};