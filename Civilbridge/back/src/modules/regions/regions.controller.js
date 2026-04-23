import prisma from "../../config/prisma.js";

const RWANDA_REGIONS = [
  { name: "Kigali", country: "Rwanda", currency: "RWF" },
  { name: "Northern", country: "Rwanda", currency: "RWF" },
  { name: "Southern", country: "Rwanda", currency: "RWF" },
  { name: "Eastern", country: "Rwanda", currency: "RWF" },
  { name: "Western", country: "Rwanda", currency: "RWF" },
];

async function ensureRegionsSeeded() {
  const count = await prisma.region.count();
  if (count > 0) return;
  await prisma.region.createMany({ data: RWANDA_REGIONS });
}

export async function getAllRegions(_req, res) {
  try {
    await ensureRegionsSeeded();
    const regions = await prisma.region.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, country: true, currency: true },
    });
    return res.json({ regions });
  } catch (error) {
    console.error("Error loading regions:", error);
    return res.status(500).json({ message: "Failed to load regions" });
  }
}

export async function getRegionById(req, res) {
  try {
    await ensureRegionsSeeded();
    const region = await prisma.region.findUnique({
      where: { id: BigInt(req.params.id) },
      select: { id: true, name: true, country: true, currency: true },
    });
    if (!region) return res.status(404).json({ message: "Region not found" });
    return res.json({ region });
  } catch (error) {
    console.error("Error getting region:", error);
    return res.status(500).json({ message: "Failed to load region" });
  }
}
