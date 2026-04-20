import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { uploadsController } from "./uploads.controller.js";
import { requireAdmin } from "../../middlewares/authMiddleware.js";
import { upload } from "../../middlewares/uploadMiddleware.js";

const router = Router();

router.post(
  "/image",
  requireAdmin,
  upload.single("file"),
  asyncHandler(uploadsController.uploadImage)
);

export default router;