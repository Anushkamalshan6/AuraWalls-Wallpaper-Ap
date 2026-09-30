import {
  CreateWallpaperBody,
  CreateWallpaperResponse,
  ListWallpapersResponse,
} from "@workspace/api-zod";
import { db, usersTable, wallpapersTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { Router, type IRouter, type Request, type Response } from "express";

import { isAllowedWallpaperFile, requireAdmin } from "../middlewares/adminMiddleware";
import { ObjectStorageService } from "../lib/objectStorage";

const router: IRouter = Router();
const objectStorage = new ObjectStorageService();

const UUID_SEGMENT = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

router.get("/wallpapers", async (_req: Request, res: Response): Promise<void> => {
  const rows = await db
    .select({
      id: wallpapersTable.id,
      title: wallpapersTable.title,
      category: wallpapersTable.category,
      tags: wallpapersTable.tags,
      imagePath: wallpapersTable.imagePath,
      creatorId: wallpapersTable.creatorId,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
      createdAt: wallpapersTable.createdAt,
    })
    .from(wallpapersTable)
    .innerJoin(usersTable, eq(wallpapersTable.creatorId, usersTable.id))
    .orderBy(desc(wallpapersTable.createdAt));

  const wallpapers = rows.map((wallpaper) => ({
    id: wallpaper.id,
    title: wallpaper.title,
    category: wallpaper.category,
    tags: wallpaper.tags,
    imageUrl: `/api/storage${wallpaper.imagePath}`,
    creatorId: wallpaper.creatorId,
    creatorName:
      [wallpaper.firstName, wallpaper.lastName].filter(Boolean).join(" ") ||
      "AuraWalls curator",
    createdAt: wallpaper.createdAt.toISOString(),
  }));

  res.json(ListWallpapersResponse.parse(wallpapers));
});

router.post(
  "/wallpapers",
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    if (!req.isAuthenticated()) {
      res.status(401).json({ error: "Sign in to upload wallpapers." });
      return;
    }
    const user = req.user;

    const parsed = CreateWallpaperBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Check the wallpaper details and try again." });
      return;
    }

    const { title, category, tags, objectPath } = parsed.data;
    const objectId = objectPath.match(/^\/objects\/uploads\/([^/]+)$/)?.[1];
    if (!objectId || !UUID_SEGMENT.test(objectId)) {
      res.status(400).json({ error: "The uploaded image path is invalid." });
      return;
    }

    try {
      const file = await objectStorage.getObjectEntityFile(objectPath);
      const [metadata] = await file.getMetadata();
      const contentType = String(metadata.contentType ?? "");
      const size = Number(metadata.size ?? 0);
      if (!isAllowedWallpaperFile(contentType, size)) {
        res.status(400).json({ error: "Choose a supported image under 20 MB." });
        return;
      }

      await objectStorage.trySetObjectEntityAclPolicy(objectPath, {
        owner: user.id,
        visibility: "public",
      });

      const [wallpaper] = await db
        .insert(wallpapersTable)
        .values({
          title: title.trim(),
          category,
          tags: [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))],
          imagePath: objectPath,
          creatorId: user.id,
        })
        .returning({
          id: wallpapersTable.id,
          title: wallpapersTable.title,
          category: wallpapersTable.category,
          tags: wallpapersTable.tags,
          imagePath: wallpapersTable.imagePath,
          creatorId: wallpapersTable.creatorId,
          createdAt: wallpapersTable.createdAt,
        });

      const response = {
        id: wallpaper.id,
        title: wallpaper.title,
        category: wallpaper.category,
        tags: wallpaper.tags,
        imageUrl: `/api/storage${wallpaper.imagePath}`,
        creatorId: wallpaper.creatorId,
        creatorName:
          [user.firstName, user.lastName].filter(Boolean).join(" ") ||
          "AuraWalls curator",
        createdAt: wallpaper.createdAt.toISOString(),
      };

      res.status(201).json(CreateWallpaperResponse.parse(response));
    } catch (error) {
      req.log.error({ err: error }, "Could not publish uploaded wallpaper");
      res.status(500).json({ error: "Could not publish this wallpaper. Try again." });
    }
  },
);

export default router;