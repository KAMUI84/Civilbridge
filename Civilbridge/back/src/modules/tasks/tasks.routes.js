import { Router } from "express";
import { listTasks, createTask, updateTask, deleteTask } from "./tasks.controller.js";

const router = Router();

router.get("/",     listTasks);
router.post("/",    createTask);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
