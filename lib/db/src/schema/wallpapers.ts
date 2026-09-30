import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { index, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

import { usersTable } from "./auth";

export const wallpapersTable = pgTable(
  "wallpapers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 80 }).notNull(),
    category: varchar("category", { length: 40 }).notNull(),
    tags: text("tags").array().notNull().default(sql`ARRAY[]::text[]`),
    imagePath: text("image_path").notNull(),
    creatorId: varchar("creator_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("wallpapers_category_idx").on(table.category),
    index("wallpapers_created_at_idx").on(table.createdAt),
  ],
);

export const insertWallpaperSchema = createInsertSchema(wallpapersTable).omit({
  id: true,
  createdAt: true,
});

export type InsertWallpaper = z.infer<typeof insertWallpaperSchema>;
export type Wallpaper = typeof wallpapersTable.$inferSelect;