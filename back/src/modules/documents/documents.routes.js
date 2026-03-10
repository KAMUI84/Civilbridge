import { Router } from "express";
import { getDocuments, deleteDocument, downloadDocument } from "./documents.controller.js";

const router = Router();

router.get("/", getDocuments);
router.get("/:id/download", downloadDocument);
router.delete("/:id", deleteDocument);

export default router;
