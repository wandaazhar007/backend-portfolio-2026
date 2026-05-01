//app/src/modules/works/works.routes.ts
import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { worksController } from "./works.controller.js";
import { requireAdmin } from "../../middlewares/authMiddleware.js";

const router = Router();

router.get("/", asyncHandler(worksController.getAll));
router.get("/slug/:slug", asyncHandler(worksController.getBySlug));
router.get("/:uuid", asyncHandler(worksController.getByUuid));

router.post("/", requireAdmin, asyncHandler(worksController.create));
router.put("/:uuid", requireAdmin, asyncHandler(worksController.update));
router.delete("/:uuid", requireAdmin, asyncHandler(worksController.remove));

export default router;