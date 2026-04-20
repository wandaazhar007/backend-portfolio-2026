import { z } from "zod";

export const createBlogSchema = z.object({
  title: z.string().min(2).max(200),
  desc: z.string().min(10),
  categoryUuid: z.string().min(1),
  link: z.string().url().or(z.literal("")).default(""),
  author: z.string().min(2).max(100),
  license: z.string().max(100).default("Private"),
  isPublished: z.boolean().default(true)
});

export const updateBlogSchema = createBlogSchema.partial();