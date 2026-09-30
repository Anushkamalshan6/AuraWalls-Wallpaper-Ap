import type { NextFunction, Request, Response } from "express";

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Sign in to upload wallpapers." });
    return;
  }

  const adminEmail = process.env.AURAWALLS_ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail) {
    res.status(503).json({ error: "Wallpaper uploads are not configured yet." });
    return;
  }

  if (req.user.email?.trim().toLowerCase() !== adminEmail) {
    res.status(403).json({ error: "This account cannot upload wallpapers." });
    return;
  }

  next();
}

export function isAllowedWallpaperFile(
  contentType: string,
  size: number,
): boolean {
  return (
    ALLOWED_IMAGE_TYPES.has(contentType.toLowerCase()) &&
    Number.isInteger(size) &&
    size > 0 &&
    size <= MAX_UPLOAD_BYTES
  );
}