//src/modules/blogs/blogs.repository.ts
import { db, firestoreAdmin } from "../../config/firebaseAdmin.js";
import { COLLECTIONS } from "../../constants/collections.js";
import type { Blog } from "../../types/blog.js";

const collection = db.collection(COLLECTIONS.BLOGS);

export const blogsRepository = {
  async create(data: Omit<Blog, "createdAt" | "updatedAt">) {
    const now = firestoreAdmin.firestore.Timestamp.now();

    await collection.doc(data.uuid).set({
      ...data,
      createdAt: now,
      updatedAt: now
    });

    const snapshot = await collection.doc(data.uuid).get();
    return snapshot.data() as Blog;
  },

  async findAll(params: {
    categorySlug?: string;
    search?: string;
    isPublished?: boolean;
    limit?: number;
    cursor?: string;
  }) {
    let query: FirebaseFirestore.Query = collection.orderBy("createdAt", "desc");

    if (typeof params.isPublished === "boolean") {
      query = query.where("isPublished", "==", params.isPublished);
    }

    if (params.categorySlug) {
      query = query.where("categorySlug", "==", params.categorySlug);
    }

    if (params.search) {
      query = query
        .where("normalizedTitle", ">=", params.search)
        .where("normalizedTitle", "<=", `${params.search}\uf8ff`)
        .orderBy("normalizedTitle", "asc");
    }

    if (params.cursor) {
      const cursorDoc = await collection.doc(params.cursor).get();
      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      }
    }

    const snapshot = await query.limit(params.limit ?? 10).get();

    return {
      items: snapshot.docs.map((doc) => doc.data() as Blog),
      nextCursor:
        snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null
    };
  },

  async findByUuid(uuid: string) {
    const snapshot = await collection.doc(uuid).get();
    return snapshot.exists ? (snapshot.data() as Blog) : null;
  },

  async findBySlug(slug: string) {
    const snapshot = await collection.where("slug", "==", slug).limit(1).get();
    return snapshot.empty ? null : (snapshot.docs[0].data() as Blog);
  },

  async update(uuid: string, data: Partial<Blog>) {
    await collection.doc(uuid).update({
      ...data,
      updatedAt: firestoreAdmin.firestore.Timestamp.now()
    });

    const snapshot = await collection.doc(uuid).get();
    return snapshot.data() as Blog;
  },

  async remove(uuid: string) {
    await collection.doc(uuid).delete();
  }
};