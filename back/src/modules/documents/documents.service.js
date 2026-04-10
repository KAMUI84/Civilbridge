import prisma from "../../config/prisma.js";
import { emailService } from "../../services/email.service.js";
import { generateBoqPdfExport } from "../boq/boq.export.service.js";
import { buildSignedCloudinaryUrl, uploadPdfToCloudinary } from "./cloudinary.storage.js";
import { buildPdfBuffer, buildPdfTable, formatCurrency } from "./pdf.builder.js";

function actorCanAccessProject(project, actor) {
  const actorId = BigInt(actor.id);
  return (
    ["ADMIN", "SUPER_ADMIN"].includes(actor.role) ||
    project.userId === actorId ||
    (project.members || []).some((member) => member.userId === actorId)
  );
}

function actorCanReview(actor) {
  return ["ENGINEER", "ARCHITECT", "PROFESSIONAL", "ADMIN", "SUPER_ADMIN"].includes(actor.role);
}

function actorCanManageDocument(document, actor) {
  const actorId = BigInt(actor.id);
  return (
    ["ADMIN", "SUPER_ADMIN"].includes(actor.role) ||
    document.project.userId === actorId ||
    document.userId === actorId
  );
}

async function fetchProjectPackage(projectId) {
  return prisma.project.findUnique({
    where: { id: BigInt(projectId) },
    include: {
      user: { select: { id: true, fullName: true, email: true } },
      region: { select: { name: true, currency: true } },
      estimateSummary: true,
      boqItems: {
        include: {
          catalogItem: { select: { name: true } },
        },
        orderBy: [{ category: "asc" }, { createdAt: "asc" }],
      },
      progressLogs: { orderBy: { logDate: "asc" } },
      members: { select: { userId: true } },
    },
  });
}

async function resolveReviewStamp(document) {
  if (document.reviewStatus !== "APPROVED" || !document.reviewedByUserId) {
    return [];
  }

  const reviewer = await prisma.user.findUnique({
    where: { id: document.reviewedByUserId },
    include: {
      profile: {
        select: {
          licenseNumber: true,
          signatureUrl: true,
        },
      },
    },
  });

  if (!reviewer) return [];

  return [
    `Reviewed By: ${reviewer.fullName || "CivilBridge Engineer"}`,
    `Role: ${reviewer.role}`,
    reviewer.profile?.licenseNumber
      ? `License No: ${reviewer.profile.licenseNumber}`
      : null,
    reviewer.profile?.signatureUrl
      ? `Signature Asset: ${reviewer.profile.signatureUrl}`
      : "Signature Type: Digital approval stamp",
    `Approved At: ${document.reviewedAt?.toISOString() || new Date().toISOString()}`,
  ].filter(Boolean);
}

function buildTimelineLines(project) {
  if (project.progressLogs.length) {
    return project.progressLogs.map(
      (log) =>
        `${new Date(log.logDate).toISOString().slice(0, 10)} | ${log.stage} | ${log.progressPercent}% | ${log.notes || "No notes"}`
    );
  }

  return [
    "Week 1-2 | FOUNDATION | Mobilization, setting out, excavation",
    "Week 3-6 | STRUCTURE | Footings, slab, walls, and frame",
    "Week 7-8 | ROOFING | Roof structure and weatherproofing",
    "Week 9-12 | FINISHES | Interior and exterior finishes",
    "Week 10-12 | SERVICES | Plumbing and electrical installation",
  ];
}

function buildFeasibilityLines(project, currency) {
  const estimate = project.estimateSummary;
  if (!estimate) {
    return [
      "No estimate summary is stored yet.",
      "Generate an estimate to attach feasibility cost analysis.",
    ];
  }

  return [
    `Estimated Total Cost: ${formatCurrency(estimate.estimatedTotalCost, currency)}`,
    `Risk Buffer: ${estimate.riskBufferPercent}% (${formatCurrency(estimate.riskBufferAmount, currency)})`,
    `Final Estimated Cost: ${formatCurrency(estimate.finalEstimatedCost, currency)}`,
    `Cost Per m2: ${formatCurrency(estimate.costPerM2, currency)}`,
  ];
}

function buildProcurementLines(project, currency) {
  const byCategory = new Map();

  project.boqItems.forEach((item) => {
    const key = item.category;
    if (!byCategory.has(key)) {
      byCategory.set(key, { quantity: 0, total: 0 });
    }
    const current = byCategory.get(key);
    current.quantity += Number(item.quantity);
    current.total += Number(item.totalCost);
  });

  return Array.from(byCategory.entries()).map(
    ([category, summary]) =>
      `${category}: procure early, total quantity ${summary.quantity.toFixed(2)}, budget ${formatCurrency(summary.total, currency)}`
  );
}

function buildPackageSections(project, currency, stampLines) {
  const boqLines = buildPdfTable(
    ["Item", "Category", "Qty", "Unit Cost", "Total"],
    project.boqItems.map((item) => [
      item.customName || item.catalogItem?.name || "Unnamed item",
      item.category,
      Number(item.quantity).toFixed(2),
      formatCurrency(item.unitCost, currency),
      formatCurrency(item.totalCost, currency),
    ])
  );

  return [
    {
      heading: "Plan Specification",
      lines: [
        `Project Name: ${project.projectName}`,
        `Project Type: ${project.projectType}`,
        `Region: ${project.region?.name || "Rwanda"}`,
        `Built Area: ${project.builtAreaM2} m2`,
        `Floors: ${project.floors}`,
        `Bedrooms: ${project.bedrooms || "N/A"}`,
        `Finish Level: ${project.finishLevel}`,
        `Structure: ${project.structureType}`,
        `Roof: ${project.roofType}`,
      ],
    },
    {
      heading: "Bill of Quantities",
      lines: boqLines,
    },
    {
      heading: "Construction Timeline",
      lines: buildTimelineLines(project),
    },
    {
      heading: "Feasibility Summary",
      lines: buildFeasibilityLines(project, currency),
    },
    {
      heading: "Material Procurement Guide",
      lines: buildProcurementLines(project, currency),
    },
    {
      heading: "Implementation Notes",
      lines: [
        "Validate structural assumptions before site work begins.",
        "Confirm supplier quotes and logistics one week before procurement.",
        "Use this package alongside approved permits and consultant instructions.",
      ],
    },
  ];
}

async function createProjectPackageRecord({
  project,
  actor,
  upload,
  filename,
  reviewStatus,
  reviewNotes,
}) {
  const version = await prisma.projectDocument.count({
    where: {
      projectId: project.id,
      docType: "OTHER",
    },
  });

  return prisma.projectDocument.create({
    data: {
      projectId: project.id,
      userId: BigInt(actor.id),
      docType: "OTHER",
      fileUrl: upload.secureUrl,
      storageKey: upload.publicId,
      originalName: filename,
      mimeType: "application/pdf",
      fileSizeBytes: BigInt(upload.bytes || 0),
      version: version + 1,
      reviewStatus,
      reviewedByUserId:
        reviewStatus === "APPROVED" ? BigInt(actor.id) : null,
      reviewedAt: reviewStatus === "APPROVED" ? new Date() : null,
      reviewNotes: reviewNotes || null,
    },
  });
}

export async function generateProjectPackagePdf({
  projectId,
  actor,
  approveDocument = false,
  reviewNotes = null,
}) {
  const project = await fetchProjectPackage(projectId);
  if (!project) throw new Error("Project not found");
  if (!actorCanAccessProject(project, actor)) {
    throw new Error("You are not allowed to access this project package");
  }
  if (approveDocument && !actorCanReview(actor)) {
    throw new Error("Only engineers or admins can approve project packages");
  }

  const reviewStatus = approveDocument ? "APPROVED" : "PENDING";
  const stampLines =
    reviewStatus === "APPROVED"
      ? [
          `Reviewed By: ${actor.fullName || actor.email || actor.id}`,
          `Role: ${actor.role}`,
          `Approved At: ${new Date().toISOString()}`,
        ]
      : [];
  const currency = project.region?.currency || "RWF";
  const filename = `project-package-${project.id.toString()}-${Date.now()}.pdf`;
  const pdfBuffer = buildPdfBuffer({
    title: "CivilBridge Project Package",
    subtitle: `${project.projectName} | ${currency}`,
    sections: buildPackageSections(project, currency, stampLines),
    stampLines,
    producer: "CivilBridge Project Package Service",
  });
  const upload = await uploadPdfToCloudinary({
    buffer: pdfBuffer,
    filename,
    publicId: `project-package-${project.id.toString()}-${Date.now()}`,
  });
  const document = await createProjectPackageRecord({
    project,
    actor,
    upload,
    filename,
    reviewStatus,
    reviewNotes,
  });
  const signedUrl = buildSignedCloudinaryUrl({
    publicId: upload.publicId,
    filename,
  });

  if (project.user?.email) {
    await emailService.sendDocumentReadyEmail({
      to: project.user.email,
      recipientName: project.user.fullName || "there",
      projectName: project.projectName,
      documentName: "Project Package PDF",
      documentUrl: signedUrl,
      documentType: "PROJECT_PACKAGE_PDF",
    });
  }

  return { document, pdfBuffer, signedUrl, upload };
}

export async function listProjectDocuments({ actor, projectId, entityType, reviewStatus }) {
  const where = {};

  if (projectId) {
    const project = await prisma.project.findUnique({
      where: { id: BigInt(projectId) },
      include: { members: { select: { userId: true } } },
    });
    if (!project) throw new Error("Project not found");
    if (!actorCanAccessProject(project, actor)) {
      throw new Error("Not authorized");
    }
    where.projectId = BigInt(projectId);
  } else if (!["ADMIN", "SUPER_ADMIN"].includes(actor.role)) {
    where.OR = [
      { userId: BigInt(actor.id) },
      { project: { userId: BigInt(actor.id) } },
      { project: { members: { some: { userId: BigInt(actor.id) } } } },
    ];
  }

  if (entityType === "PROJECT") {
    if (reviewStatus) {
      where.reviewStatus = reviewStatus;
    }
    return prisma.projectDocument.findMany({
      where,
      include: {
        project: { select: { projectName: true } },
        reviewedBy: { select: { fullName: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  if (reviewStatus) {
    where.reviewStatus = reviewStatus;
  }

  return prisma.projectDocument.findMany({
    where,
    include: {
      project: { select: { projectName: true } },
      reviewedBy: { select: { fullName: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProjectDocumentDownload({ documentId, actor }) {
  const document = await prisma.projectDocument.findUnique({
    where: { id: BigInt(documentId) },
    include: {
      project: {
        include: {
          members: { select: { userId: true } },
        },
      },
    },
  });

  if (!document) throw new Error("Document not found");
  if (!actorCanAccessProject(document.project, actor)) {
    throw new Error("Not authorized");
  }

  const signedUrl = document.storageKey
    ? buildSignedCloudinaryUrl({
        publicId: document.storageKey,
        filename: document.originalName || "document.pdf",
      })
    : document.fileUrl;

  return { document, signedUrl };
}

export async function deleteProjectDocument({ documentId, actor }) {
  const document = await prisma.projectDocument.findUnique({
    where: { id: BigInt(documentId) },
    include: {
      project: {
        include: { members: { select: { userId: true } } },
      },
    },
  });

  if (!document) throw new Error("Document not found");
  if (!actorCanManageDocument(document, actor)) {
    throw new Error("Not authorized");
  }

  await prisma.projectDocument.delete({ where: { id: document.id } });
}

export async function reviewProjectDocument({
  documentId,
  actor,
  reviewStatus,
  reviewNotes,
}) {
  const document = await prisma.projectDocument.findUnique({
    where: { id: BigInt(documentId) },
    include: {
      project: {
        select: {
          projectName: true,
          userId: true,
          user: { select: { email: true, fullName: true } },
          members: { select: { userId: true } },
        },
      },
    },
  });
  if (!document) throw new Error("Document not found");
  if (!actorCanReview(actor)) {
    throw new Error("Only engineers or admins can review documents");
  }
  if (!actorCanAccessProject(document.project, actor)) {
    throw new Error("Not authorized");
  }

  const updated = await prisma.projectDocument.update({
    where: { id: document.id },
    data: {
      reviewStatus,
      reviewedByUserId: BigInt(actor.id),
      reviewedAt: new Date(),
      reviewNotes: reviewNotes || null,
    },
  });

  const projectOwner = document.project.user;
  if (projectOwner?.email) {
    if (reviewStatus === "APPROVED") {
      await emailService.sendEngineerApprovedEmail({
        to: projectOwner.email,
        recipientName: projectOwner.fullName || "there",
        projectName: document.project.projectName,
        reviewerName: actor.fullName || actor.email || actor.id,
        notes: reviewNotes,
        documentUrl: `${process.env.APP_BASE_URL || process.env.FRONTEND_URL || "http://localhost:5175"}/documents/${document.id}/download`,
      });
    } else if (reviewStatus === "REJECTED") {
      await emailService.sendEngineerRejectedEmail({
        to: projectOwner.email,
        recipientName: projectOwner.fullName || "there",
        projectName: document.project.projectName,
        reviewerName: actor.fullName || actor.email || actor.id,
        notes: reviewNotes,
        projectUrl: `${process.env.APP_BASE_URL || process.env.FRONTEND_URL || "http://localhost:5175"}/projects/${document.projectId}`,
      });
    }
  }

  return updated;
}

export async function regenerateProjectDocument({ documentId, actor }) {
  const document = await prisma.projectDocument.findUnique({
    where: { id: BigInt(documentId) },
    include: {
      project: {
        include: { members: { select: { userId: true } } },
      },
    },
  });
  if (!document) throw new Error("Document not found");
  if (!actorCanAccessProject(document.project, actor)) {
    throw new Error("Not authorized");
  }

  if (document.docType === "BOQ_PDF") {
    return generateBoqPdfExport({
      projectId: document.projectId,
      actor,
      approveDocument: document.reviewStatus === "APPROVED",
      reviewNotes: document.reviewNotes,
    });
  }

  const stampLines = await resolveReviewStamp(document);
  const project = await fetchProjectPackage(document.projectId);
  const currency = project.region?.currency || "RWF";
  const filename = document.originalName || `project-package-${project.id.toString()}.pdf`;
  const pdfBuffer = buildPdfBuffer({
    title: "CivilBridge Project Package",
    subtitle: `${project.projectName} | ${currency}`,
    sections: buildPackageSections(project, currency, stampLines),
    stampLines,
    producer: "CivilBridge Project Package Service",
  });
  const upload = await uploadPdfToCloudinary({
    buffer: pdfBuffer,
    filename,
    publicId: document.storageKey || `project-package-${project.id.toString()}-${Date.now()}`,
  });
  const updatedDocument = await prisma.projectDocument.update({
    where: { id: document.id },
    data: {
      fileUrl: upload.secureUrl,
      storageKey: upload.publicId,
      mimeType: "application/pdf",
      fileSizeBytes: BigInt(upload.bytes || 0),
      version: { increment: 1 },
    },
  });

  return {
    document: updatedDocument,
    pdfBuffer,
    signedUrl: buildSignedCloudinaryUrl({
      publicId: upload.publicId,
      filename,
    }),
    upload,
  };
}
