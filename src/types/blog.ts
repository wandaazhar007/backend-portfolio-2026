export interface BlogImage {
  fileName: string;
  path: string;
  url: string;
}

export interface Blog {
  uuid: string;
  legacyId: number | null;
  title: string;
  slug: string;
  desc: string;
  categoryUuid: string;
  categoryName: string;
  categorySlug: string;
  link: string;
  author: string;
  license: string;
  image: BlogImage | null;
  normalizedTitle: string;
  isPublished: boolean;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}