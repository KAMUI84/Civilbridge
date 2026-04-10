import { Router } from "express";
import {
  deleteDocument,
  downloadDocument,
  generateProjectPackage,
  getDocuments,
  regenerateDocument,
  reviewDocument,
} from "./documents.controller.js";

const router = Router();

router.get("/", getDocuments);
router.post("/projects/:projectId/package", generateProjectPackage);
router.get("/:id/download", downloadDocument);
router.put("/:id/review", reviewDocument);
router.post("/:id/regenerate", regenerateDocument);
router.delete("/:id", deleteDocument);

export default router;
