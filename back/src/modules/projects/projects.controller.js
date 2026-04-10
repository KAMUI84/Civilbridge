import prisma from "../../config/prisma.js";
import { protectOwnership } from "../../utils/ownership.js";
import { notify } from "../realtime/notify.js";
import { emailService } from "../../services/email.service.js";

// Protected: get user's projects
export async function getUserProjects(req, res) {
  try {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { userId: BigInt(req.user.id) },
          { members: { some: { userId: BigInt(req.user.id) } } },
        ],
      },
      include: {
        region: { select: { id: true, name: true } },
        _count: {
          select: {
            members: true,
            documents: true,
            progressLogs: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
}

// Protected: create project
export async function createProject(req, res) {
  try {
    const { title, description, region, landSizeSqm, buildingType, budgetAmount, startDate, targetEndDate } = req.body;
    const ownerId = BigInt(req.user.id);

    if (!title) return res.status(400).json({ message: "Project title is required" });

    const project = await prisma.project.create({
      data: {
        ownerId,
        title,
        description,
        region,
        landSizeSqm: landSizeSqm ? Number(landSizeSqm) : null,
        buildingType,
        budgetAmount: budgetAmount ? Number(budgetAmount) : null,
        startDate: startDate ? new Date(startDate) : null,
        targetEndDate: targetEndDate ? new Date(targetEndDate) : null,
      },
    });

    // Add owner as member
    await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId: ownerId,
        role: "OWNER",
      },
    });

    res.status(201).json({ message: "Project created", project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create project" });
  }
}

// Protected: get project by id with relations
export async function getProjectById(req, res) {
  try {
    const projectId = BigInt(req.params.id);
    await protectOwnership(req.user, projectId, "project", { allowMembers: true });

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        members: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                profile: { select: { profession: true, avatarUrl: true } },
              },
            },
          },
        },
        documents: { orderBy: { createdAt: 'desc' } },
        progressLogs: { orderBy: { createdAt: 'desc' } },
        region: { select: { id: true, name: true, currency: true } },
      },
    });

    if (!project) return res.status(404).json({ message: "Project not found" });

    res.json({
      ...project,
      owner: project.user,
      progress: project.progressLogs,
      permits: [],
      milestones: project.progressLogs,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch project" });
  }
}

// Protected: update project
export async function updateProject(req, res) {
  try {
    const projectId = BigInt(req.params.id);
    await protectOwnership(req.user, projectId, "project");

    const { title, description, region, budgetAmount, spentAmount, status, startDate, targetEndDate } = req.body;

    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        title,
        description,
        region,
        budgetAmount: budgetAmount ? Number(budgetAmount) : undefined,
        spentAmount: spentAmount ? Number(spentAmount) : undefined,
        status,
        startDate: startDate ? new Date(startDate) : undefined,
        targetEndDate: targetEndDate ? new Date(targetEndDate) : undefined,
      },
    });

    res.json({ message: "Project updated", project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update project" });
  }
}

// Protected: delete (archive) project
export async function deleteProject(req, res) {
  try {
    const projectId = BigInt(req.params.id);
    await protectOwnership(req.user, projectId, "project");

    await prisma.project.update({
      where: { id: projectId },
      data: { status: "ARCHIVED" },
    });

    res.json({ message: "Project archived" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to archive project" });
  }
}

// Protected: add member
export async function addProjectMember(req, res) {
  try {
    const projectId = BigInt(req.params.id);
    await protectOwnership(req.user, projectId, "project");

    const { userId, role = "VIEWER", memberRole = role || "VIEWER" } = req.body;
    const memberUserId = BigInt(userId);
    const normalizedMemberRole = String(memberRole || "VIEWER").toUpperCase();

    await prisma.projectMember.upsert({
      where: { projectId_userId: { projectId, userId: memberUserId } },
      update: { memberRole: normalizedMemberRole },
      create: { projectId, userId: memberUserId, memberRole: normalizedMemberRole },
    });

    // Emit engineer:assigned when an engineer role is added
    if (normalizedMemberRole === "ENGINEER") {
      const [project, engineer] = await Promise.all([
        prisma.project.findUnique({ where: { id: projectId }, select: { projectName: true, userId: true } }),
        prisma.user.findUnique({ where: { id: memberUserId }, select: { fullName: true } }),
      ]);

      const now = new Date().toISOString();
      const eventPayload = {
        projectId:    projectId.toString(),
        projectName:  project?.projectName ?? "",
        engineerId:   memberUserId.toString(),
        engineerName: engineer?.fullName ?? "",
        assignedAt:   now,
      };

      // Notify the assigned engineer
      await notify({
        userId:      memberUserId.toString(),
        type:        "ENGINEER_ASSIGNED",
        title:       `You have been assigned to "${project?.projectName ?? "a project"}"`,
        body:        "You have been assigned as the engineer on this project.",
        actionUrl:   `/projects/${projectId}`,
        payloadJson: eventPayload,
        event:       "engineer:assigned",
        eventPayload,
      });

      // Notify the project owner (if different from assignee)
      if (project?.userId && project.userId !== memberUserId) {
        await notify({
          userId:      project.userId.toString(),
          type:        "ENGINEER_ASSIGNED",
          title:       `Engineer assigned to "${project?.projectName ?? "your project"}"`,
          body:        `${engineer?.fullName ?? "An engineer"} has been assigned to your project.`,
          actionUrl:   `/projects/${projectId}`,
          payloadJson: eventPayload,
          event:       "engineer:assigned",
          eventPayload,
        });
      }

      const engineerWithEmail = await prisma.user.findUnique({
        where: { id: memberUserId },
        select: { fullName: true, email: true },
      });

      if (engineerWithEmail?.email) {
        await emailService.sendProjectAssignedEmail({
          to: engineerWithEmail.email,
          professionalName: engineerWithEmail.fullName || "there",
          projectName: project?.projectName ?? "CivilBridge project",
          clientName: "CivilBridge Client",
          role: normalizedMemberRole,
          projectUrl: `${process.env.APP_BASE_URL || process.env.FRONTEND_URL || "http://localhost:5175"}/projects/${projectId}`,
        });
      }
    }

    res.status(201).json({ message: "Member added" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add member" });
  }
}

// Protected: upload documents
export async function uploadDocuments(req, res) {
  try {
    const projectId = BigInt(req.params.id);
    await protectOwnership(req.user, projectId, "project", { allowMembers: true });

    if (!req.files?.length) return res.status(400).json({ message: "No documents uploaded" });

    await prisma.projectDocument.createMany({
      data: req.files.map((file) => ({
        projectId,
        userId: BigInt(req.user.id),
        docType: file.mimetype === "application/pdf" ? "OTHER" : "IMAGE",
        fileUrl: `/uploads/${file.filename}`,
        storageKey: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        fileSizeBytes: BigInt(file.size || 0),
      })),
    });

    res.json({ message: "Documents uploaded" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to upload documents" });
  }
}

// Protected: delete document
export async function deleteDocument(req, res) {
  try {
    const docId = BigInt(req.params.docId);
    const doc = await prisma.projectDocument.findUnique({ where: { id: docId }, select: { projectId: true } });
    if (!doc) return res.status(404).json({ message: "Document not found" });
    await protectOwnership(req.user, doc.projectId, "project");

    await prisma.projectDocument.delete({ where: { id: docId } });

    res.json({ message: "Document deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete document" });
  }
}

// Protected: add permit
export async function addPermit(req, res) {
  try {
    const projectId = BigInt(req.params.id);
    await protectOwnership(req.user, projectId, "project");

    const { permitType, issuingAuthority, issuedDate, expiryDate, status, notes } = req.body;

    const permit = await prisma.projectPermit.create({
      data: {
        projectId,
        permitType,
        issuingAuthority,
        issuedDate: issuedDate ? new Date(issuedDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        status,
        notes,
      },
    });

    res.status(201).json({ message: "Permit added", permit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add permit" });
  }
}

// Protected: update permit
export async function updatePermit(req, res) {
  try {
    const permitId = BigInt(req.params.permitId);
    const permit = await prisma.projectPermit.findUnique({ where: { id: permitId }, select: { projectId: true } });
    if (!permit) return res.status(404).json({ message: "Permit not found" });
    await protectOwnership(req.user, permit.projectId, "project");

    const { permitType, issuingAuthority, issuedDate, expiryDate, status, notes } = req.body;

    await prisma.projectPermit.update({
      where: { id: permitId },
      data: {
        permitType,
        issuingAuthority,
        issuedDate: issuedDate ? new Date(issuedDate) : undefined,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        status,
        notes,
      },
    });

    res.json({ message: "Permit updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update permit" });
  }
}

// Protected: delete permit
export async function deletePermit(req, res) {
  try {
    const permitId = BigInt(req.params.permitId);
    const permit = await prisma.projectPermit.findUnique({ where: { id: permitId }, select: { projectId: true } });
    if (!permit) return res.status(404).json({ message: "Permit not found" });
    await protectOwnership(req.user, permit.projectId, "project");

    await prisma.projectPermit.delete({ where: { id: permitId } });

    res.json({ message: "Permit deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete permit" });
  }
}

// Protected: add progress
export async function addProgress(req, res) {
  try {
    const projectId = BigInt(req.params.id);
    await protectOwnership(req.user, projectId, "project");

    const { title, description, progressPercent, date } = req.body;

    const progress = await prisma.projectProgress.create({
      data: {
        projectId,
        title,
        description,
        progressPercent: Number(progressPercent),
        date: date ? new Date(date) : new Date(),
        createdBy: BigInt(req.user.id),
      },
    });

    res.status(201).json({ message: "Progress added", progress });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add progress" });
  }
}

// Protected: update progress
export async function updateProgress(req, res) {
  try {
    const progressId = BigInt(req.params.progressId);
    const progress = await prisma.projectProgress.findUnique({ where: { id: progressId }, select: { projectId: true } });
    if (!progress) return res.status(404).json({ message: "Progress not found" });
    await protectOwnership(req.user, progress.projectId, "project");

    const { title, description, progressPercent, date } = req.body;

    await prisma.projectProgress.update({
      where: { id: progressId },
      data: {
        title,
        description,
        progressPercent: Number(progressPercent),
        date: date ? new Date(date) : undefined,
      },
    });

    res.json({ message: "Progress updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update progress" });
  }
}

// Protected: delete progress
export async function deleteProgress(req, res) {
  try {
    const progressId = BigInt(req.params.progressId);
    const progress = await prisma.projectProgress.findUnique({ where: { id: progressId }, select: { projectId: true } });
    if (!progress) return res.status(404).json({ message: "Progress not found" });
    await protectOwnership(req.user, progress.projectId, "project");

    await prisma.projectProgress.delete({ where: { id: progressId } });

    res.json({ message: "Progress deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete progress" });
  }
}
