import prisma from "../../config/prisma.js";

const VALID_PROJECT_TYPES = new Set(["RESIDENTIAL", "COMMERCIAL", "INDUSTRIAL", "INFRA"]);

function toProjectType(raw) {
  if (!raw) return undefined;
  const up = String(raw).toUpperCase();
  return VALID_PROJECT_TYPES.has(up) ? up : undefined;
}

function serializePermit(p) {
  return {
    id: p.id.toString(),
    region_id: p.regionId.toString(),
    region: p.region?.name || null,
    category: p.projectType,
    project_type: p.projectType,
    title: p.permitName,
    permit_name: p.permitName,
    issuing_authority: p.authorityName || null,
    authority_name: p.authorityName || null,
    estimated_cost_rwf: p.estimatedFee ? Number(p.estimatedFee) : null,
    estimated_days: p.estimatedDays || null,
    steps: p.stepsJson || null,
    is_active: p.isActive,
  };
}

// ─── GET /api/permits ─────────────────────────────────────────────────────────
export const getPermitGuides = async (req, res) => {
  try {
    const { category, region } = req.query;

    const where = { isActive: true };

    const projectType = toProjectType(category);
    if (projectType) where.projectType = projectType;

    if (region) {
      const regionRecord = await prisma.region.findFirst({
        where: { name: { contains: region } },
        select: { id: true },
      });
      if (regionRecord) where.regionId = regionRecord.id;
    }

    const guides = await prisma.permitRequirement.findMany({
      where,
      include: { region: { select: { name: true } } },
      orderBy: [{ projectType: "asc" }, { permitName: "asc" }],
    });

    res.json({ success: true, guides: guides.map(serializePermit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch permit guides" });
  }
};

// ─── GET /api/permits/:id ─────────────────────────────────────────────────────
export const getPermitGuideById = async (req, res) => {
  try {
    const guide = await prisma.permitRequirement.findUnique({
      where: { id: BigInt(req.params.id) },
      include: { region: { select: { name: true } } },
    });
    if (!guide) return res.status(404).json({ message: "Permit guide not found" });
    res.json({ success: true, guide: serializePermit(guide) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch permit guide" });
  }
};

// ─── GET /api/permits/checklist ───────────────────────────────────────────────
export const getPermitChecklist = async (req, res) => {
  try {
    const { building_type, region } = req.query;

    const checklist = [
      {
        step: 1,
        title: "Obtain Land Title Deed",
        authority: "Rwanda Land Management and Use Authority (RLMUA)",
        required: true,
        duration: "Varies",
        documents: ["National ID", "Land purchase agreement"],
      },
      {
        step: 2,
        title: "Engage Licensed Architect",
        authority: "Rwanda Housing Authority (RHA)",
        required: true,
        duration: "2–4 weeks",
        documents: ["Architect's license", "Architectural drawings"],
      },
      {
        step: 3,
        title: "Apply for Building Permit",
        authority: "City of Kigali / District Office",
        required: true,
        duration: "15–30 days",
        documents: [
          "Completed application form",
          "Title deed copy",
          "Architectural plans",
          "Structural drawings",
          "Site plan",
          "Topographic survey",
          "Environmental assessment (if required)",
        ],
        estimated_cost_rwf: 150000,
      },
      {
        step: 4,
        title: "Environmental Impact Assessment (if > 500m²)",
        authority: "Rwanda Environment Management Authority (REMA)",
        required: building_type === "COMMERCIAL",
        duration: "30–60 days",
        estimated_cost_rwf: 500000,
      },
      {
        step: 5,
        title: "Connect to WASAC (Water & Sanitation)",
        authority: "WASAC",
        required: true,
        duration: "7–14 days",
        estimated_cost_rwf: 80000,
      },
      {
        step: 6,
        title: "Connect to REG (Electricity)",
        authority: "Rwanda Energy Group (REG)",
        required: true,
        duration: "14–30 days",
      },
      {
        step: 7,
        title: "Final Inspection & Occupancy Certificate",
        authority: "City of Kigali / District Office",
        required: true,
        duration: "14–21 days after completion",
        estimated_cost_rwf: 50000,
      },
    ];

    res.json({ success: true, checklist, region: region || "Rwanda" });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch checklist" });
  }
};
