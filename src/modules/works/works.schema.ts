import { z } from "zod";

export const createWorkSchema = z.object({
  name: z.string().min(2).max(200),
  desc: z.string().min(10),
  preview: z.string().url().or(z.literal("")),
  github: z.string().url().or(z.literal("")),
  tags: z.array(z.string().min(1)).default([]),
  license: z.string().max(100).default("Private"),
  type: z.string().max(100).default("Web Development"),
  isPublished: z.boolean().default(true)
});

export const updateWorkSchema = createWorkSchema.partial();