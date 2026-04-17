import { Router } from "express";
import { lookupUpi } from "./upi.controller.js";

const router = Router();

router.get("/lookup", lookupUpi);

export default router;
