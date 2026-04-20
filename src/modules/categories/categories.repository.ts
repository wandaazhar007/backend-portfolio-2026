import { db, firestoreAdmin } from "../../config/firebaseAdmin.js";
import { COLLECTIONS } from "../../constants/collections.js";
import type { Category } from "../../types/category.js";

const collection = db.collection(COLLECTIONS.CATEGORIES);

export const categoriesRepository = {
  async create(data: Omit<Category, "createdAt" | "updatedAt">) {
    const now = firestoreAdmin.firestore.Timestamp.now();

    await collection.doc(data.uuid).set({
      ...data,
      createdAt: now,
      updatedAt: now
    });

    const snapshot = await collection.doc(data.uuid).get();
    return snapshot.data() as Category;
  },

  async findAll() {
    const snapshot = await collection.orderBy("name", "asc").get();
    return snapshot.docs.map((doc) => doc.data() as Category);
  },

  async findByUuid(uuid: string) {
    const snapshot = await collection.doc(uuid).get();
    return snapshot.exists ? (snapshot.data() as Category) : null;
  },

  async findBySlug(slug: string) {
    const snapshot = await collection.where("slug", "==", slug).limit(1).get();
    return snapshot.empty ? null : (snapshot.docs[0].data() as Category);
  },

  async update(uuid: string, data: Partial<Category>) {
    await collection.doc(uuid).update({
      ...data,
      updatedAt: firestoreAdmin.firestore.Timestamp.now()
    });

    const snapshot = await collection.doc(uuid).get();
    return snapshot.data() as Category;
  },

  async remove(uuid: string) {
    await collection.doc(uuid).delete();
  }
};