import { Router } from "express";
import categoriesRoutes from "../modules/categories/categories.routes.js";
import worksRoutes from "../modules/works/works.routes.js";
import blogsRoutes from "../modules/blogs/blogs.routes.js";
import uploadsRoutes from "../modules/uploads/uploads.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "BACKEND-PORTFOLIO API is running"
  });
});

router.use("/api/categories", categoriesRoutes);
router.use("/api/works", worksRoutes);
router.use("/api/blogs", blogsRoutes);
router.use("/api/uploads", uploadsRoutes);

export default router;