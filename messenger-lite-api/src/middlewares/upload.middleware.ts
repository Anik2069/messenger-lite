import multer, { FileFilterCallback } from "multer";
import fs from "fs";
import path from "path";
import { Request } from "express";

// Main uploads folder
const uploadDir = path.join(process.cwd(), "uploads");

// Create folder if it doesn’t exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, `${base}-${unique}`);
  },
});

// Allowed file types
const allowedTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

// Allowed audio (voice message) types
const allowedAudioTypes = [
  "audio/mpeg", // mp3
  "audio/wav",
  "audio/ogg",
  "audio/webm",
];

// File filter
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (
    file.mimetype.startsWith("image/") || // allow all images
    file.mimetype.startsWith("video/") || // allow all videos
    allowedTypes.includes(file.mimetype) || // PDFs, Word, Excel, CSV
    allowedAudioTypes.includes(file.mimetype) // voice messages
  ) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"));
  }
};

// Export upload instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});
