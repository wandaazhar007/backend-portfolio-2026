//app/src/modules/blogs/blogs.routes.ts
import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { blogsController } from "./blogs.controller.js";
import { requireAdmin } from "../../middlewares/authMiddleware.js";

const router = Router();

router.get("/", asyncHandler(blogsController.getAll));
router.get("/slug/:slug", asyncHandler(blogsController.getBySlug));
router.get("/:uuid", asyncHandler(blogsController.getByUuid));

router.post("/", requireAdmin, asyncHandler(blogsController.create));
router.put("/:uuid", requireAdmin, asyncHandler(blogsController.update));
router.delete("/:uuid", requireAdmin, asyncHandler(blogsController.remove));

export default router;