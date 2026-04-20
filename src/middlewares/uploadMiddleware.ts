import multer from "multer";
import { ApiError } from "../lib/ApiError.js";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter(_req, file, cb) {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

    if (!allowed.includes(file.mimetype)) {
      return cb(new ApiError(422, "Only jpg, jpeg, png, and webp files are allowed"));
    }

    cb(null, true);
  }
});