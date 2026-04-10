import { Router } from "express";
import { submitContact } from "./contact.controller.js";

const router = Router();

// Public — no auth required, anyone can send a contact message
router.post("/", submitContact);

export default router;
