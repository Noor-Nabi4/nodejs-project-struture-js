import multer, { type FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import type { Request } from "express";

const createFolderIfNotExist = (folderPath: string): void => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

const uploadDir = "uploads/";

const getRouteSegment = (originalUrl: string): string => {
  const segments = originalUrl.split("/").filter(Boolean);
  return segments[2] || "default";
};

const getFileTypeFolder = (mimetype: string): string => {
  if (mimetype.startsWith("video/")) return "videos";
  if (mimetype.startsWith("image/")) return "images";
  if (mimetype === "application/pdf") return "documents";
  if (mimetype.startsWith("audio/")) return "sounds";
  return "others";
};

const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    const routeSegment = getRouteSegment(req.originalUrl);
    const fileTypeFolder = getFileTypeFolder(file.mimetype);
    const fullUploadPath = path.join(uploadDir, routeSegment, fileTypeFolder);
    createFolderIfNotExist(fullUploadPath);
    cb(null, fullUploadPath);
  },

  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = uuidv4() + ext;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 500 * 1024 * 1024,
  },

  fileFilter: (_req, file, cb: FileFilterCallback) => {
    const allowedImageTypes = /jpg|jpeg|webp|png/;
    const allowedVideoTypes = /mp4|mov|avi|mkv/;
    const allowedAudioTypes = /mp3|wav|ogg/;
    const allowedDocTypes = /pdf/;

    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    const mime = file.mimetype;

    const isImage = mime.startsWith("image/") && allowedImageTypes.test(ext);
    const isVideo = mime.startsWith("video/") && allowedVideoTypes.test(ext);
    const isAudio = mime.startsWith("audio/") && allowedAudioTypes.test(ext);
    const isPdf = mime === "application/pdf" && allowedDocTypes.test(ext);

    if (isImage || isVideo || isPdf || isAudio) {
      cb(null, true);
    } else {
      const reject: FileFilterCallback = cb;
      reject(new Error("Only images, videos, or PDF documents are allowed!"));
    }
  },
});

export default upload;
