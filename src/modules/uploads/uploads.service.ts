import { bucket } from "../../config/firebaseAdmin.js";
import { ApiError } from "../../lib/ApiError.js";

export const uploadsService = {
  async uploadImage(params: {
    folder: "works" | "blogs" | "categories";
    entityId: string;
    file: Express.Multer.File;
  }) {
    const safeFileName = `${Date.now()}-${params.file.originalname.replace(/\s+/g, "-")}`;
    const storagePath = `${params.folder}/${params.entityId}/${safeFileName}`;

    const file = bucket.file(storagePath);

    await file.save(params.file.buffer, {
      metadata: {
        contentType: params.file.mimetype
      },
      resumable: false
    });

    await file.makePublic().catch(() => {
      throw new ApiError(500, "Failed to make uploaded file public");
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

    return {
      fileName: safeFileName,
      path: storagePath,
      url: publicUrl
    };
  }
};