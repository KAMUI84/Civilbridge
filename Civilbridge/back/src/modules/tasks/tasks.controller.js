import prisma from "../../config/prisma.js";

// ─── GET /api/tasks ────────────────────────────────────────────────────────────
export async function listTasks(req, res) {
  try {
    const userId = BigInt(req.user.id);
    const { status } = req.query;

    const where = { userId };
    if (status && status !== "all") {
      const map = { todo: "TODO", "in-progress": "IN_PROGRESS", completed: "COMPLETED" };
      if (map[status]) where.status = map[status];
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
    });

    return res.json({ success: true, tasks: tasks.map(serialize) });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch tasks", error: err.message });
  }
}

// ─── POST /api/tasks ───────────────────────────────────────────────────────────
export async function createTask(req, res) {
  try {
    const userId = BigInt(req.user.id);
    const { title, description, priority, assignee, projectName, dueDate, tags } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    const PRIORITY_MAP = { low: "LOW", medium: "MEDIUM", high: "HIGH" };

    const task = await prisma.task.create({
      data: {
        userId,
        title: title.trim(),
        description: description?.trim() || null,
        status: "TODO",
        priority: PRIORITY_MAP[priority] || "MEDIUM",
        assignee: assignee?.trim() || null,
        projectName: projectName?.trim() || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        tags: Array.isArray(tags) ? tags.join(",") : (tags?.trim() || null),
      },
    });

    return res.status(201).json({ success: true, task: serialize(task) });
  } catch (err) {
    return res.status(500).json({ message: "Failed to create task", error: err.message });
  }
}

// ─── PATCH /api/tasks/:id ──────────────────────────────────────────────────────
export async function updateTask(req, res) {
  try {
    const userId = BigInt(req.user.id);
    const taskId = BigInt(req.params.id);
    const { title, description, status, priority, assignee, projectName, dueDate, tags } = req.body;

    const existing = await prisma.task.findUnique({ where: { id: taskId } });
    if (!existing) return res.status(404).json({ message: "Task not found" });
    if (existing.userId !== userId) return res.status(403).json({ message: "Forbidden" });

    const STATUS_MAP = { todo: "TODO", "in-progress": "IN_PROGRESS", completed: "COMPLETED" };
    const PRIORITY_MAP = { low: "LOW", medium: "MEDIUM", high: "HIGH" };

    const data = {};
    if (title !== undefined)       data.title = title.trim();
    if (description !== undefined) data.description = description?.trim() || null;
    if (status !== undefined)      data.status = STATUS_MAP[status] || existing.status;
    if (priority !== undefined)    data.priority = PRIORITY_MAP[priority] || existing.priority;
    if (assignee !== undefined)    data.assignee = assignee?.trim() || null;
    if (projectName !== undefined) data.projectName = projectName?.trim() || null;
    if (dueDate !== undefined)     data.dueDate = dueDate ? new Date(dueDate) : null;
    if (tags !== undefined)        data.tags = Array.isArray(tags) ? tags.join(",") : (tags?.trim() || null);

    const task = await prisma.task.update({ where: { id: taskId }, data });
    return res.json({ success: true, task: serialize(task) });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update task", error: err.message });
  }
}

// ─── DELETE /api/tasks/:id ─────────────────────────────────────────────────────
export async function deleteTask(req, res) {
  try {
    const userId = BigInt(req.user.id);
    const taskId = BigInt(req.params.id);

    const existing = await prisma.task.findUnique({ where: { id: taskId } });
    if (!existing) return res.status(404).json({ message: "Task not found" });
    if (existing.userId !== userId) return res.status(403).json({ message: "Forbidden" });

    await prisma.task.delete({ where: { id: taskId } });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete task", error: err.message });
  }
}

// ─── Serializer ───────────────────────────────────────────────────────────────
const STATUS_OUT = { TODO: "todo", IN_PROGRESS: "in-progress", COMPLETED: "completed" };
const PRIORITY_OUT = { LOW: "low", MEDIUM: "medium", HIGH: "high" };

function serialize(task) {
  return {
    id: task.id.toString(),
    title: task.title,
    description: task.description || "",
    status: STATUS_OUT[task.status] || "todo",
    priority: PRIORITY_OUT[task.priority] || "medium",
    assignee: task.assignee || "",
    project: task.projectName || "",
    dueDate: task.dueDate ? task.dueDate.toISOString().split("T")[0] : "",
    tags: task.tags ? task.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    createdAt: task.createdAt.toISOString().split("T")[0],
  };
}
