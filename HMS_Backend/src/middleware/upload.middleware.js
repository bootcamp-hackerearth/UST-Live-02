const fs = require("node:fs");
const path = require("node:path");
const multer = require("multer");

const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "uploads";

    if (req.baseUrl.includes("health-records")) {
      if (req.path.includes("lab-reports")) {
        folder = "uploads/lab-reports";
      }

      if (req.path.includes("medical-documents")) {
        folder = "uploads/medical-documents";
      }
    }

    const absolutePath = path.join(process.cwd(), folder);

    fs.mkdirSync(absolutePath, {
      recursive: true,
    });

    cb(null, absolutePath);
  },
  filename: (req, file, cb) => {
 const fileName = `${Date.now()}-${crypto.randomUUID()}-${path.basename(file.originalname)}`;

    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and Images are allowed"));
  }
};

module.exports = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_UPLOAD_SIZE_BYTES,
  },
});
