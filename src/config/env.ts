import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("5015"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.string().min(1),
  FIREBASE_PRIVATE_KEY: z.string().min(1),
  FIREBASE_STORAGE_BUCKET: z.string().min(1),
  FRONTEND_URL: z.string().min(1),
  ADMIN_EMAILS: z.string().optional(),
  OLD_DB_HOST: z.string().optional(),
  OLD_DB_PORT: z.string().optional(),
  OLD_DB_USER: z.string().optional(),
  OLD_DB_PASSWORD: z.string().optional(),
  OLD_DB_NAME: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  PORT: Number(parsed.data.PORT),
  OLD_DB_PORT: parsed.data.OLD_DB_PORT ? Number(parsed.data.OLD_DB_PORT) : undefined,
  FIREBASE_PRIVATE_KEY: parsed.data.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  ADMIN_EMAILS: parsed.data.ADMIN_EMAILS
    ? parsed.data.ADMIN_EMAILS.split(",").map((email) => email.trim().toLowerCase())
    : []
};