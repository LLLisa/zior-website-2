import multer from "multer";

// Files are kept in memory then written to Postgres as BYTEA — no disk needed.
const storage = multer.memoryStorage();

export const imageUpload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(null, /^image\/(png|jpe?g|webp|gif)$/.test(file.mimetype));
  },
});

export const pdfUpload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(null, file.mimetype === "application/pdf");
  },
});
