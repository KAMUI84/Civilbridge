const KEY_LISTINGS = "cb_listings_v1";
const KEY_PLANS = "cb_plans_v1";

function safeParse(v, fallback) {
  try {
    const x = JSON.parse(v);
    return x ?? fallback;
  } catch {
    return fallback;
  }
}

function uid(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function getListings() {
  const v = localStorage.getItem(KEY_LISTINGS);
  const data = safeParse(v, null);
  if (Array.isArray(data) && data.length) return data;

  // seed (only if empty)
  const seeded = [
    {
      id: "L_1001",
      kind: "property", // property | land
      title: "Modern 3BR House (Ready)",
      location: "Kigali, Gasabo",
      price: 85000000,
      currency: "RWF",
      size_m2: 210,
      bedrooms: 3,
      bathrooms: 2,
      status: "Available",
      images: [
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=2000&q=80",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=80",
      ],
      description:
        "A modern family home with open living, good daylight, and practical layout. Suitable for quick move-in or final finishing choices.",
      postedByRole: "ADMIN",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
      contact: { name: "CivilBridge", phone: "+250 7xx xxx xxx", email: "sales@civilbridge.local" },
      tags: ["verified", "popular"],
    },
    {
      id: "L_1002",
      kind: "land",
      title: "Build-Ready Plot (20x30)",
      location: "Kigali, Kicukiro",
      price: 32000000,
      currency: "RWF",
      size_m2: 600,
      bedrooms: null,
      bathrooms: null,
      status: "Available",
      images: [
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2000&q=80",
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2000&q=80",
      ],
      description:
        "Flat plot with road access and neighborhood utilities. Great for residential development. Zoning details and site visit available.",
      postedByRole: "ENGINEER",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
      contact: { name: "CivilBridge", phone: "+250 7xx xxx xxx", email: "land@civilbridge.local" },
      tags: ["site-visit"],
    },
  ];

  localStorage.setItem(KEY_LISTINGS, JSON.stringify(seeded));
  return seeded;
}

export function saveListings(list) {
  localStorage.setItem(KEY_LISTINGS, JSON.stringify(list));
}

export function createListing(payload) {
  const list = getListings();
  const item = {
    id: uid("L"),
    createdAt: Date.now(),
    postedByRole: payload.postedByRole || "ADMIN",
    currency: payload.currency || "RWF",
    status: payload.status || "Available",
    images: payload.images?.length ? payload.images : [],
    tags: payload.tags || [],
    ...payload,
  };
  const next = [item, ...list];
  saveListings(next);
  return item;
}

export function updateListing(id, patch) {
  const list = getListings();
  const next = list.map((x) => (x.id === id ? { ...x, ...patch } : x));
  saveListings(next);
  return next.find((x) => x.id === id) || null;
}

export function getPlans() {
  const v = localStorage.getItem(KEY_PLANS_v2());
  const data = safeParse(v, null);
  if (Array.isArray(data) && data.length) return data;

  const seeded = [
    {
      id: "P_2001",
      category: "Residential",
      title: "2BR Compact Modern",
      floors: 1,
      size_m2: 95,
      est_cost_low: 38000000,
      est_cost_high: 52000000,
      currency: "RWF",
      locationFit: "Urban / Suburban",
      images: [
        "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=2000&q=80",
        "https://images.unsplash.com/photo-1527030280862-64139fba04ca?auto=format&fit=crop&w=2000&q=80",
      ],
      description:
        "Efficient 2-bedroom layout with open living. Suitable for 15x20+ plots. Great starter home.",
      files: [
        { name: "FloorPlan.pdf", type: "pdf", url: "" },
        { name: "BOQ_Template.xlsx", type: "xlsx", url: "" },
      ],
      stampReady: true,
      postedByRole: "ENGINEER",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
      tags: ["popular", "fast-build"],
    },
    {
      id: "P_2002",
      category: "Commercial",
      title: "Mini Retail Block",
      floors: 2,
      size_m2: 260,
      est_cost_low: 120000000,
      est_cost_high: 170000000,
      currency: "RWF",
      locationFit: "Main road / Trading center",
      images: [
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80",
        "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=2000&q=80",
      ],
      description:
        "Commercial layout designed for foot traffic. Flexible internal partitions. Suitable for shops + offices.",
      files: [{ name: "Concept_Set.pdf", type: "pdf", url: "" }],
      stampReady: false,
      postedByRole: "ADMIN",
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
      tags: ["roi"],
    },
  ];

  localStorage.setItem(KEY_PLANS_v2(), JSON.stringify(seeded));
  return seeded;
}

function KEY_PLANS_v2() {
  return "cb_plans_v2";
}

export function savePlans(list) {
  localStorage.setItem(KEY_PLANS_v2(), JSON.stringify(list));
}

export function createPlan(payload) {
  const list = getPlans();
  const item = {
    id: uid("P"),
    createdAt: Date.now(),
    postedByRole: payload.postedByRole || "ENGINEER",
    currency: payload.currency || "RWF",
    images: payload.images?.length ? payload.images : [],
    files: payload.files?.length ? payload.files : [],
    tags: payload.tags || [],
    stampReady: Boolean(payload.stampReady),
    ...payload,
  };
  const next = [item, ...list];
  savePlans(next);
  return item;
}

export function updatePlan(id, patch) {
  const list = getPlans();
  const next = list.map((x) => (x.id === id ? { ...x, ...patch } : x));
  savePlans(next);
  return next.find((x) => x.id === id) || null;
}