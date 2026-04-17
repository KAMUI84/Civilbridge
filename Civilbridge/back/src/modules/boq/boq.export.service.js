import prisma from "../../config/prisma.js";
import { emailService } from "../../services/email.service.js";
import { buildSignedCloudinaryUrl, uploadPdfToCloudinary } from "../documents/cloudinary.storage.js";
import { buildPdfBuffer, buildPdfTable, formatCurrency } from "../documents/pdf.builder.js";

function actorCanAccessProject(project, actor) {
  const actorId = BigInt(actor.id);
  return (
    ["ADMIN", "SUPER_ADMIN"].includes(actor.role) ||
    project.userId === actorId ||
    project.members.some((member) => member.userId === actorId)
  );
}

function actorCanApprove(actor) {
  return ["ENGINEER", "ARCHITECT", "ADMIN", "SUPER_ADMIN"].includes(actor.role);
}

async function fetchProject(projectId) {
  return prisma.project.findUnique({
    where: { id: BigInt(projectId) },
    include: {
      user: { select: { id: true, fullName: true, email: true } },
      region: { select: { name: true, currency: true } },
      boqItems: {
        include: {
          catalogItem: { select: { name: true, code: true } },
        },
        orderBy: [{ category: "asc" }, { createdAt: "asc" }],
      },
      estimateSummary: true,
      members: { select: { userId: true } },
    },
  });
}

async function resolveReviewerStampLines(reviewedByUserId) {
  if (!reviewedByUserId) return [];

  const reviewer = await prisma.user.findUnique({
    where: { id: reviewedByUserId },
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
    `Approved By: ${reviewer.fullName || "CivilBridge Engineer"}`,
    `Role: ${reviewer.role}`,
    reviewer.profile?.licenseNumber
      ? `License No: ${reviewer.profile.licenseNumber}`
      : null,
    reviewer.profile?.signatureUrl
      ? `Signature Asset: ${reviewer.profile.signatureUrl}`
      : "Signature Type: Digital CivilBridge stamp",
    `Stamped At: ${new Date().toISOString()}`,
  ].filter(Boolean);
}

function buildBoqSections(project, currency, stampLines) {
  const summaryLines = [
    `Project: ${project.projectName}`,
    `Type: ${project.projectType}`,
    `Region: ${project.region?.name || "Rwanda"}`,
    `Built Area: ${project.builtAreaM2} m2`,
    `Floors: ${project.floors}`,
    `Finish Level: ${project.finishLevel}`,
  ];

  const tableLines = buildPdfTable(
    ["Material", "Category", "Qty", "Unit", "Unit Cost", "Total"],
    project.boqItems.map((item) => [
      item.customName || item.catalogItem?.name || "Unnamed item",
      item.category,
      Number(item.quantity).toFixed(2),
      item.unit,
      formatCurrency(item.unitCost, currency),
      formatCurrency(item.totalCost, currency),
    ])
  );

  const subtotal = project.boqItems.reduce(
    (sum, item) => sum + Number(item.totalCost),
    0
  );
  const finalEstimate = Number(project.estimateSummary?.finalEstimatedCost || subtotal);

  return [
    {
      heading: "Project Summary",
      lines: summaryLines,
    },
    {
      heading: "Itemized Bill of Quantities",
      lines: tableLines,
    },
    {
      heading: "Totals",
      lines: [
        `BOQ Subtotal: ${formatCurrency(subtotal, currency)}`,
        `Estimated Project Total: ${formatCurrency(finalEstimate, currency)}`,
      ],
    },
    {
      heading: "Quality Notes",
      lines: [
        "Quantities are based on current project records in CivilBridge.",
        "Unit costs should be rechecked against live supplier quotes before procurement.",
      ],
    },
  ];
}

async function createDocumentRecord({
  project,
  actor,
  upload,
  filename,
  approveDocument,
  reviewNotes,
}) {
  const projectId = project.id;
  const existingCount = await prisma.projectDocument.count({
    where: {
      projectId,
      docType: "BOQ_PDF",
    },
  });

  const reviewStatus = approveDocument ? "APPROVED" : "PENDING";
  return prisma.projectDocument.create({
    data: {
      projectId,
      userId: BigInt(actor.id),
      docType: "BOQ_PDF",
      fileUrl: upload.secureUrl,
      storageKey: upload.publicId,
      originalName: filename,
      mimeType: "application/pdf",
      fileSizeBytes: BigInt(upload.bytes || 0),
      version: existingCount + 1,
      reviewStatus,
      reviewedByUserId: approveDocument ? BigInt(actor.id) : null,
      reviewedAt: approveDocument ? new Date() : null,
      reviewNotes: reviewNotes || null,
    },
  });
}

export async function generateBoqPdfExport({
  projectId,
  actor,
  approveDocument = false,
  reviewNotes = null,
}) {
  const project = await fetchProject(projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  if (!actorCanAccessProject(project, actor)) {
    throw new Error("You are not allowed to export this project's BOQ");
  }

  if (approveDocument && !actorCanApprove(actor)) {
    throw new Error("Only engineers or admins can approve BOQ exports");
  }

  const currency = project.region?.currency || "RWF";
  const stampLines = approveDocument
    ? await resolveReviewerStampLines(BigInt(actor.id))
    : [];
  const filename = `boq-${project.id.toString()}-v${Date.now()}.pdf`;
  const sections = buildBoqSections(project, currency, stampLines);
  const pdfBuffer = buildPdfBuffer({
    title: "CivilBridge BOQ Export",
    subtitle: `${project.projectName} | ${currency}`,
    sections,
    stampLines,
    producer: "CivilBridge BOQ Export Service",
  });
  const upload = await uploadPdfToCloudinary({
    buffer: pdfBuffer,
    filename,
    publicId: `boq-${project.id.toString()}-${Date.now()}`,
  });
  const document = await createDocumentRecord({
    project,
    actor,
    upload,
    filename,
    approveDocument,
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
      documentName: "BOQ Export PDF",
      documentUrl: signedUrl,
      documentType: "BOQ_PDF",
    });
  }

  return { document, pdfBuffer, signedUrl, upload };
}
