export interface Category {
  uuid: string;
  legacyId: number | null;
  name: string;
  slug: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}