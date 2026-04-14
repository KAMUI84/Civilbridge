import prisma from "../../config/prisma.js";

const VALID_STAGES = new Set([
  "FOUNDATION",
  "STRUCTURE",
  "ROOFING",
  "FINISHES",
  "PLUMBING",
  "ELECTRICAL",
  "OTHER",
]);

function toBigIntId(value) {
  try {
    return BigInt(value);
  } catch {
    return null;
  }
}

function normaliseStage(value) {
  if (!value) return "OTHER";
  const stage = String(value).trim().toUpperCase();
  return VALID_STAGES.has(stage) ? stage : "OTHER";
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildPhase(log) {
  const progressPercent = toNumber(log.progressPercent);

  return {
    id: log.id.toString(),
    stage: log.stage,
    status: progressPercent >= 100 ? "COMPLETED" : progressPercent <= 0 ? "PENDING" : "IN_PROGRESS",
    plannedDate: log.logDate,
    actualDate: log.createdAt,
    progressPercent,
    amountSpent: toNumber(log.amountSpent),
    notes: log.notes || "",
    createdAt: log.createdAt,
  };
}

async function getAccessibleProject(projectId, actorId) {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { userId: actorId },
        { members: { some: { userId: actorId } } },
      ],
    },
    select: {
      id: true,
      projectName: true,
      projectType: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      progressLogs: {
        orderBy: [{ logDate: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          stage: true,
          logDate: true,
          progressPercent: true,
          amountSpent: true,
          notes: true,
          createdAt: true,
        },
      },
    },
  });
}

function buildProgressResponse(project) {
  const phases = project.progressLogs.map(buildPhase);
  const completed = phases.filter((phase) => phase.status === "COMPLETED").length;
  const total = phases.length;
  const latestPhase = phases[phases.length - 1] || null;
  const progress = latestPhase ? Math.round(toNumber(latestPhase.progressPercent)) : 0;
  const totalSpent = phases.reduce((sum, phase) => sum + toNumber(phase.amountSpent), 0);
  const actualStart = phases[0]?.actualDate || project.createdAt;
  const actualLatest = latestPhase?.actualDate || project.updatedAt;
  const plannedStart = phases[0]?.plannedDate || project.createdAt;
  const plannedEnd = phases[phases.length - 1]?.plannedDate || project.updatedAt;
  const varianceDays = Math.round(
    (new Date(actualLatest).getTime() - new Date(plannedEnd).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return {
    success: true,
    progress_percent: progress,
    milestones: phases,
    completed,
    total,
    summary: {
      progressPercent: progress,
      completedPhases: completed,
      totalPhases: total,
      totalSpent,
    },
    timeline: {
      plannedStart,
      plannedEnd,
      actualStart,
      actualLatest,
      varianceDays,
      status: varianceDays > 3 ? "DELAYED" : varianceDays < -3 ? "AHEAD" : "ON_TRACK",
    },
    project: {
      id: project.id.toString(),
      name: project.projectName,
      type: project.projectType,
      status: project.status,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    },
    phases,
  };
}

export const getProjectProgress = async (req, res) => {
  try {
    const projectId = toBigIntId(req.params.project_id);
    const actorId = toBigIntId(req.user?.id);

    if (!projectId || !actorId) {
      return res.status(400).json({ message: "Invalid project id" });
    }

    const project = await getAccessibleProject(projectId, actorId);
    if (!project) {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.json(buildProgressResponse(project));
  } catch (err) {
    console.error("Failed to fetch progress", err);
    return res.status(500).json({ message: "Failed to fetch progress" });
  }
};

export const createMilestone = async (req, res) => {
  try {
    const projectId = toBigIntId(req.params.project_id);
    const actorId = toBigIntId(req.user?.id);

    if (!projectId || !actorId) {
      return res.status(400).json({ message: "Invalid project id" });
    }

    const project = await getAccessibleProject(projectId, actorId);
    if (!project) {
      return res.status(403).json({ message: "Access denied" });
    }

    const notes = [req.body?.title, req.body?.description].filter(Boolean).join(" - ");
    const log = await prisma.projectProgressLog.create({
      data: {
        projectId,
        stage: normaliseStage(req.body?.phase),
        logDate: req.body?.planned_date ? new Date(req.body.planned_date) : new Date(),
        progressPercent: toNumber(req.body?.progressPercent ?? req.body?.progress_percent, 0),
        amountSpent: toNumber(req.body?.cost_estimate, 0),
        notes: notes || null,
      },
    });

    return res.status(201).json({ success: true, milestone: buildPhase(log), message: "Progress entry created" });
  } catch (err) {
    console.error("Failed to create progress entry", err);
    return res.status(500).json({ message: "Failed to create milestone" });
  }
};

export const updateMilestone = async (req, res) => {
  try {
    const milestoneId = toBigIntId(req.params.id);
    const actorId = toBigIntId(req.user?.id);

    if (!milestoneId || !actorId) {
      return res.status(400).json({ message: "Invalid milestone id" });
    }

    const existing = await prisma.projectProgressLog.findUnique({
      where: { id: milestoneId },
      select: { id: true, projectId: true },
    });

    if (!existing) {
      return res.status(404).json({ message: "Milestone not found" });
    }

    const project = await getAccessibleProject(existing.projectId, actorId);
    if (!project) {
      return res.status(403).json({ message: "Access denied" });
    }

    const notes = [req.body?.title, req.body?.description].filter(Boolean).join(" - ");
    const updated = await prisma.projectProgressLog.update({
      where: { id: milestoneId },
      data: {
        stage: req.body?.phase ? normaliseStage(req.body.phase) : undefined,
        logDate: req.body?.planned_date ? new Date(req.body.planned_date) : undefined,
        progressPercent:
          req.body?.progressPercent !== undefined || req.body?.progress_percent !== undefined
            ? toNumber(req.body?.progressPercent ?? req.body?.progress_percent, 0)
            : undefined,
        amountSpent: req.body?.cost_actual !== undefined ? toNumber(req.body.cost_actual, 0) : undefined,
        notes: notes || req.body?.notes || undefined,
      },
    });

    return res.json({ success: true, milestone: buildPhase(updated), message: "Progress entry updated" });
  } catch (err) {
    console.error("Failed to update progress entry", err);
    return res.status(500).json({ message: "Failed to update milestone" });
  }
};

export const deleteMilestone = async (req, res) => {
  try {
    const milestoneId = toBigIntId(req.params.id);
    const actorId = toBigIntId(req.user?.id);

    if (!milestoneId || !actorId) {
      return res.status(400).json({ message: "Invalid milestone id" });
    }

    const existing = await prisma.projectProgressLog.findUnique({
      where: { id: milestoneId },
      select: { id: true, projectId: true },
    });

    if (!existing) {
      return res.status(404).json({ message: "Milestone not found" });
    }

    const project = await getAccessibleProject(existing.projectId, actorId);
    if (!project) {
      return res.status(403).json({ message: "Access denied" });
    }

    await prisma.projectProgressLog.delete({ where: { id: milestoneId } });

    return res.json({ success: true, message: "Progress entry deleted" });
  } catch (err) {
    console.error("Failed to delete progress entry", err);
    return res.status(500).json({ message: "Failed to delete milestone" });
  }
};
