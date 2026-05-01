//src/types/work.ts
export interface WorkImage {
  fileName: string;
  path: string;
  url: string;
}

export interface Work {
  uuid: string;
  legacyId: number | null;
  slug: string;
  name: string;
  desc: string;
  preview: string;
  github: string;
  tags: string[];
  license: string;
  type: string;
  image: WorkImage | null;
  normalizedName: string;
  isPublished: boolean;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}