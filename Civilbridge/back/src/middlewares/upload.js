import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

function fileFilter(req, file, cb) {
  const allowedExtensions = new Set([".jpeg", ".jpg", ".png", ".gif", ".webp", ".pdf", ".doc", ".docx", ".xls", ".xlsx"]);
  const allowedMimeTypes = new Set([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ]);
  const extname = allowedExtensions.has(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedMimeTypes.has((file.mimetype || "").toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image, PDF, Word, and Excel files are allowed"));
  }
}

export const uploadSingle = (fieldName) =>
  multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter,
  }).single(fieldName);

export const uploadMultiple = (fieldName, maxCount = 5) =>
  multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024, files: maxCount },
    fileFilter,
  }).array(fieldName, maxCount);
