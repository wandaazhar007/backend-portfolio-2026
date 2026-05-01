//app/src/modules/categories/categories.routes.ts
import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { categoriesController } from "./categories.controller.js";
import { requireAdmin } from "../../middlewares/authMiddleware.js";

const router = Router();

router.get("/", asyncHandler(categoriesController.getAll));
router.get("/slug/:slug", asyncHandler(categoriesController.getBySlug));
router.get("/:uuid", asyncHandler(categoriesController.getByUuid));

router.post("/", requireAdmin, asyncHandler(categoriesController.create));
router.put("/:uuid", requireAdmin, asyncHandler(categoriesController.update));
router.delete("/:uuid", requireAdmin, asyncHandler(categoriesController.remove));

export default router;