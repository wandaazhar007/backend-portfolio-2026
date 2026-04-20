// import mysql from "mysql2/promise";
// import { db, firestoreAdmin } from "../config/firebaseAdmin.js";
// import { COLLECTIONS } from "../constants/collections.js";
// import { normalizeText } from "../lib/normalize.js";

// async function runMigration() {
//   const connection = await mysql.createConnection({
//     host: "127.0.0.1",
//     user: "root",
//     password: "your_password",
//     database: "your_old_sql_db"
//   });

//   try {
//     const [categoriesRows] = await connection.query("SELECT * FROM categories");
//     const [worksRows] = await connection.query("SELECT * FROM mywork");
//     const [blogsRows] = await connection.query("SELECT * FROM myblog");

//     const categoryMap = new Map<number, { uuid: string; name: string; slug: string }>();

//     for (const row of categoriesRows as any[]) {
//       const categoryDoc = {
//         uuid: row.uuid,
//         legacyId: row.id,
//         name: row.name,
//         slug: row.slug,
//         createdAt: firestoreAdmin.firestore.Timestamp.fromDate(new Date(row.createdAt)),
//         updatedAt: firestoreAdmin.firestore.Timestamp.fromDate(new Date(row.updatedAt))
//       };

//       await db.collection(COLLECTIONS.CATEGORIES).doc(row.uuid).set(categoryDoc);
//       categoryMap.set(row.id, {
//         uuid: row.uuid,
//         name: row.name,
//         slug: row.slug
//       });
//     }

//     for (const row of worksRows as any[]) {
//       const workDoc = {
//         uuid: row.uuid,
//         legacyId: row.id,
//         slug: row.name
//           .toLowerCase()
//           .replace(/[^\w\s-]/g, "")
//           .replace(/\s+/g, "-"),
//         name: row.name,
//         desc: row.desc,
//         preview: row.preview ?? "",
//         github: row.github ?? "",
//         tags: row.tag ? String(row.tag).split(",").map((item) => item.trim()) : [],
//         license: row.license ?? "",
//         type: row.type ?? "",
//         image: row.image || row.urlImage
//           ? {
//             fileName: row.image ?? "",
//             path: "",
//             url: row.urlImage ?? ""
//           }
//           : null,
//         normalizedName: normalizeText(row.name),
//         isPublished: true,
//         createdAt: firestoreAdmin.firestore.Timestamp.fromDate(new Date(row.createdAt)),
//         updatedAt: firestoreAdmin.firestore.Timestamp.fromDate(new Date(row.updatedAt))
//       };

//       await db.collection(COLLECTIONS.WORKS).doc(row.uuid).set(workDoc);
//     }

//     for (const row of blogsRows as any[]) {
//       const category = categoryMap.get(row.categoryId);

//       const blogDoc = {
//         uuid: row.uuid,
//         legacyId: row.id,
//         title: row.title,
//         slug: row.slug,
//         desc: row.desc,
//         categoryUuid: category?.uuid ?? "",
//         categoryName: category?.name ?? "",
//         categorySlug: category?.slug ?? "",
//         link: row.link ?? "",
//         author: row.author ?? "",
//         license: row.license ?? "",
//         image: row.image || row.urlImage
//           ? {
//             fileName: row.image ?? "",
//             path: "",
//             url: row.urlImage ?? ""
//           }
//           : null,
//         normalizedTitle: normalizeText(row.title),
//         isPublished: true,
//         createdAt: firestoreAdmin.firestore.Timestamp.fromDate(new Date(row.createdAt)),
//         updatedAt: firestoreAdmin.firestore.Timestamp.fromDate(new Date(row.updatedAt))
//       };

//       await db.collection(COLLECTIONS.BLOGS).doc(row.uuid).set(blogDoc);
//     }

//     console.log("Migration completed successfully");
//   } finally {
//     await connection.end();
//   }
// }

// runMigration().catch((error) => {
//   console.error("Migration failed:", error);
//   process.exit(1);
// });


import mysql from "mysql2/promise";
import { db, firestoreAdmin } from "../config/firebaseAdmin.js";
import { env } from "../config/env.js";
import { COLLECTIONS } from "../constants/collections.js";
import { normalizeText } from "../lib/normalize.js";
import { createSlug } from "../lib/slug.js";

type SqlCategory = {
  id: number;
  uuid: string;
  name: string;
  slug: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type SqlWork = {
  id: number;
  uuid: string;
  name: string;
  desc: string;
  preview: string | null;
  github: string | null;
  tag: string | null;
  license: string | null;
  type: string | null;
  image: string | null;
  urlImage: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type SqlBlog = {
  id: number;
  uuid: string;
  title: string;
  slug: string | null;
  desc: string;
  categoryId: number | null;
  link: string | null;
  author: string | null;
  license: string | null;
  image: string | null;
  urlImage: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

function toTimestamp(value: string | Date) {
  return firestoreAdmin.firestore.Timestamp.fromDate(new Date(value));
}

function parseTags(tagValue: string | null): string[] {
  if (!tagValue) return [];

  return String(tagValue)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function runMigration() {
  if (
    !env.OLD_DB_HOST ||
    !env.OLD_DB_USER ||
    !env.OLD_DB_NAME ||
    !env.OLD_DB_PORT
  ) {
    throw new Error("OLD_DB env variables are incomplete");
  }

  const connection = await mysql.createConnection({
    host: env.OLD_DB_HOST,
    port: env.OLD_DB_PORT,
    user: env.OLD_DB_USER,
    password: env.OLD_DB_PASSWORD,
    database: env.OLD_DB_NAME
  });

  console.log("Connected to old SQL database");

  try {
    const [categoriesRows] = await connection.query(
      "SELECT id, uuid, name, slug, createdAt, updatedAt FROM categories ORDER BY id ASC"
    );

    const [worksRows] = await connection.query(
      "SELECT id, uuid, name, `desc`, preview, github, tag, license, type, image, urlImage, createdAt, updatedAt FROM mywork ORDER BY id ASC"
    );

    const [blogsRows] = await connection.query(
      "SELECT id, uuid, title, slug, `desc`, categoryId, link, author, license, image, urlImage, createdAt, updatedAt FROM myblog ORDER BY id ASC"
    );

    const categories = categoriesRows as SqlCategory[];
    const works = worksRows as SqlWork[];
    const blogs = blogsRows as SqlBlog[];

    console.log(`Categories found: ${categories.length}`);
    console.log(`Works found: ${works.length}`);
    console.log(`Blogs found: ${blogs.length}`);

    const categoryMap = new Map<
      number,
      {
        uuid: string;
        name: string;
        slug: string;
      }
    >();

    console.log("Migrating categories...");

    for (const row of categories) {
      const categorySlug = row.slug?.trim() || createSlug(row.name);

      const categoryDoc = {
        uuid: row.uuid,
        legacyId: row.id,
        name: row.name,
        slug: categorySlug,
        createdAt: toTimestamp(row.createdAt),
        updatedAt: toTimestamp(row.updatedAt)
      };

      await db.collection(COLLECTIONS.CATEGORIES).doc(row.uuid).set(categoryDoc);

      categoryMap.set(row.id, {
        uuid: row.uuid,
        name: row.name,
        slug: categorySlug
      });

      console.log(`Category migrated: ${row.name}`);
    }

    console.log("Migrating works...");

    for (const row of works) {
      const workSlug = createSlug(row.name);

      const workDoc = {
        uuid: row.uuid,
        legacyId: row.id,
        slug: workSlug,
        name: row.name,
        desc: row.desc ?? "",
        preview: row.preview ?? "",
        github: row.github ?? "",
        tags: parseTags(row.tag),
        license: row.license ?? "",
        type: row.type ?? "",
        image:
          row.image || row.urlImage
            ? {
              fileName: row.image ?? "",
              path: "",
              url: row.urlImage ?? ""
            }
            : null,
        normalizedName: normalizeText(row.name),
        isPublished: true,
        createdAt: toTimestamp(row.createdAt),
        updatedAt: toTimestamp(row.updatedAt)
      };

      await db.collection(COLLECTIONS.WORKS).doc(row.uuid).set(workDoc);

      console.log(`Work migrated: ${row.name}`);
    }

    console.log("Migrating blogs...");

    for (const row of blogs) {
      const category = row.categoryId ? categoryMap.get(row.categoryId) : undefined;
      const blogSlug = row.slug?.trim() || createSlug(row.title);

      const blogDoc = {
        uuid: row.uuid,
        legacyId: row.id,
        title: row.title,
        slug: blogSlug,
        desc: row.desc ?? "",
        categoryUuid: category?.uuid ?? "",
        categoryName: category?.name ?? "",
        categorySlug: category?.slug ?? "",
        link: row.link ?? "",
        author: row.author ?? "",
        license: row.license ?? "",
        image:
          row.image || row.urlImage
            ? {
              fileName: row.image ?? "",
              path: "",
              url: row.urlImage ?? ""
            }
            : null,
        normalizedTitle: normalizeText(row.title),
        isPublished: true,
        createdAt: toTimestamp(row.createdAt),
        updatedAt: toTimestamp(row.updatedAt)
      };

      await db.collection(COLLECTIONS.BLOGS).doc(row.uuid).set(blogDoc);

      console.log(`Blog migrated: ${row.title}`);
    }

    console.log("Migration completed successfully");
  } finally {
    await connection.end();
    console.log("Old SQL connection closed");
  }
}

runMigration().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});