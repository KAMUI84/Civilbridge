const marketplaceListings = [
  {
    id: "market-1",
    image:
      "https://images.unsplash.com/photo-1747555094127-9a922d56a64c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
    gallery: [
      "https://images.unsplash.com/photo-1747555094127-9a922d56a64c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
    ],
    title: "Modern 4-Bedroom House",
    location: "Kigali, Gasabo",
    district: "Gasabo",
    price: 85000000,
    priceLabel: "RWF 85,000,000",
    category: "house",
    tag: "For Sale",
    bedrooms: 4,
    bathrooms: 3,
    area: "350 sqm",
    areaSqm: 350,
    badge: "New",
    prime: false,
    engineeringGrade: "Turnkey residential",
    lotSize: "540 sqm",
    parking: "2 vehicles",
    handover: "8 weeks",
    shortDescription: "A ready-to-occupy family home with strong daylight, structured service zones, and immediate site access.",
    description:
      "Designed for growing families, this home combines a generous living core with a private bedroom wing, service courtyard, and practical circulation. The site supports easy drainage management and future boundary wall upgrades.",
    amenities: ["Open-plan living", "Service yard", "Water storage", "Paved parking"],
    reasons: ["Schedule a site visit", "Request full specifications", "Talk to the assigned engineer"],
  },
  {
    id: "market-2",
    image:
      "https://images.unsplash.com/photo-1694465990855-e78110c345af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
    gallery: [
      "https://images.unsplash.com/photo-1694465990855-e78110c345af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
    ],
    title: "Luxury Villa with Pool",
    location: "Kigali, Nyarutarama",
    district: "Nyarugenge",
    price: 150000000,
    priceLabel: "RWF 150,000,000",
    category: "villa",
    tag: "For Sale",
    bedrooms: 6,
    bathrooms: 5,
    area: "600 sqm",
    areaSqm: 600,
    badge: "Hot",
    prime: true,
    engineeringGrade: "Premium residential",
    lotSize: "920 sqm",
    parking: "4 vehicles",
    handover: "Ready now",
    shortDescription: "High-spec villa with hospitality-grade entertaining zones and verified MEP upgrades.",
    description:
      "This villa suits buyers who want a premium layout with elevated structure, outdoor entertaining, and well-zoned private suites. The building has recently reviewed utility routing and upgraded waterproofing details.",
    amenities: ["Pool deck", "Backup power", "Staff annex", "Landscape lighting"],
    reasons: ["Book a private viewing", "Request MEP details", "Discuss financing"],
  },
  {
    id: "market-3",
    image:
      "https://images.unsplash.com/photo-1773215023063-e662ea91a69c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
    gallery: [
      "https://images.unsplash.com/photo-1773215023063-e662ea91a69c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
      "https://images.unsplash.com/photo-1448630360428-65456885c650?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
    ],
    title: "Prime Land - 0.8 Acres",
    location: "Kigali, Gacuriro",
    district: "Gasabo",
    price: 45000000,
    priceLabel: "RWF 45,000,000",
    category: "land",
    tag: "Land",
    area: "0.8 acres",
    areaSqm: 3237,
    badge: "New",
    prime: true,
    engineeringGrade: "Development-ready plot",
    lotSize: "0.8 acres",
    parking: "N/A",
    handover: "Title review in progress",
    shortDescription: "A sloped but buildable site suited for phased residential development or a compact estate.",
    description:
      "This parcel offers favorable frontage and utility proximity. It works well for a single premium residence or a phased townhouse concept, subject to detailed geotechnical and drainage checks.",
    amenities: ["Road access", "Nearby utilities", "Expandable footprint", "Development corridor"],
    reasons: ["Request title documents", "Book a terrain review", "Talk to a planning expert"],
  },
  {
    id: "market-4",
    image:
      "https://images.unsplash.com/photo-1758304481219-fc230bf1e6a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
    gallery: [
      "https://images.unsplash.com/photo-1758304481219-fc230bf1e6a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
      "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
    ],
    title: "Commercial Complex - City Centre",
    location: "Kigali, Kimihurura",
    district: "Nyarugenge",
    price: 280000000,
    priceLabel: "RWF 280,000,000",
    category: "commercial",
    tag: "Commercial",
    area: "1,200 sqm",
    areaSqm: 1200,
    badge: "Hot",
    prime: true,
    engineeringGrade: "Commercial shell and core",
    lotSize: "1,550 sqm",
    parking: "18 bays",
    handover: "6 weeks",
    shortDescription: "Mixed-use shell with strong frontage, clear circulation, and room for fit-out customization.",
    description:
      "Positioned in a high-traffic zone, this complex offers a flexible shell for retail, office, or service tenants. Structural bays and servicing risers have been planned to simplify phased interior fit-out.",
    amenities: ["Lift core", "Retail frontage", "Service access", "Expansion-ready roof"],
    reasons: ["Request tenancy metrics", "Schedule a commercial tour", "Review structural drawings"],
  },
  {
    id: "market-5",
    image:
      "https://images.unsplash.com/photo-1591609168402-7e1714687067?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
    gallery: [
      "https://images.unsplash.com/photo-1591609168402-7e1714687067?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
      "https://images.unsplash.com/photo-1605146769289-440113cc3d00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
    ],
    title: "Cozy 3-Bedroom Home",
    location: "Kigali, Remera",
    district: "Gasabo",
    price: 52000000,
    priceLabel: "RWF 52,000,000",
    category: "house",
    tag: "For Sale",
    bedrooms: 3,
    bathrooms: 2,
    area: "220 sqm",
    areaSqm: 220,
    badge: null,
    prime: false,
    engineeringGrade: "Efficient family layout",
    lotSize: "420 sqm",
    parking: "2 vehicles",
    handover: "4 weeks",
    shortDescription: "Compact footprint with efficient circulation and a strong value-to-space ratio.",
    description:
      "Ideal for buyers prioritizing usability over excess, this home has a balanced footprint, manageable operating costs, and a structure suited to phased upgrades such as a terrace or guest annex.",
    amenities: ["Covered porch", "Storage room", "Water reserve", "Simple maintenance"],
    reasons: ["Arrange a walkthrough", "Ask about finish options", "Connect with a home advisor"],
  },
  {
    id: "market-6",
    image:
      "https://images.unsplash.com/photo-1747555094127-9a922d56a64c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
    gallery: [
      "https://images.unsplash.com/photo-1747555094127-9a922d56a64c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
      "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
      "https://images.unsplash.com/photo-1600047509782-20d39509f26d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
    ],
    title: "Executive 5-Bedroom Villa",
    location: "Kigali, Kacyiru",
    district: "Gasabo",
    price: 120000000,
    priceLabel: "RWF 120,000,000",
    category: "villa",
    tag: "For Sale",
    bedrooms: 5,
    bathrooms: 4,
    area: "480 sqm",
    areaSqm: 480,
    badge: null,
    prime: true,
    engineeringGrade: "Executive residential",
    lotSize: "760 sqm",
    parking: "3 vehicles",
    handover: "Ready now",
    shortDescription: "Large-format villa with generous hosting spaces and a strong profile for multi-generational living.",
    description:
      "The plan supports both formal and family life, with service functions separated from the public core and enough site capacity for future landscape or annex work.",
    amenities: ["Formal lounge", "Guest suite", "Terrace outlook", "Compound wall"],
    reasons: ["Request a private consult", "Get structural specs", "Speak to a financing partner"],
  },
];

const planLibraryItems = [
  {
    id: "plan-1",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
    gallery: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
    ],
    title: "4-Bedroom Family Home - Full Drawing Set",
    rating: 5,
    downloads: 312,
    price: "RWF 85,000",
    badge: "New",
    type: "residential",
    format: "2D + 3D",
    sheets: 18,
    status: "Print Ready",
    bedrooms: 4,
    floors: 2,
    builtAreaM2: 228,
    style: "Contemporary",
    tier: "PRO",
    estimatedCostMin: 54000000,
    estimatedCostMax: 68000000,
    summary: "A compact two-floor family residence tuned for urban plots and phased construction.",
    description:
      "This set includes architectural sheets, elevations, sections, and visualization support for a balanced family home. The layout prioritizes daylight, compact circulation, and practical service routing.",
    zoningInfo: "Best suited to serviced urban plots from 420 to 600 sqm with moderate slope tolerance and standard utility setbacks.",
    includedFiles: ["Floor plans", "Elevations", "Sections", "Door and window schedule"],
    reasons: ["Need plan customization", "Ask for structural review", "Proceed with full package"],
  },
  {
    id: "plan-2",
    image:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
    gallery: [
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
      "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
    ],
    title: "Modern Villa - 3D Render + Elevation Plans",
    rating: 5,
    downloads: 487,
    price: "RWF 120,000",
    badge: "Hot",
    type: "villa",
    format: "3D Renders",
    sheets: 24,
    status: "Print Ready",
    bedrooms: 5,
    floors: 2,
    builtAreaM2: 310,
    style: "Luxury Modern",
    tier: "PREMIUM",
    estimatedCostMin: 92000000,
    estimatedCostMax: 128000000,
    summary: "Premium villa package with high-spec visuals and presentation-ready elevations.",
    description:
      "Created for premium residential clients, this package offers a refined visual set, clear massing, and strong internal zoning. It is ideal for clients who want presentation-ready design assets alongside build documentation.",
    zoningInfo: "Designed for premium plots above 700 sqm, especially hill-facing or high-visibility residential sites.",
    includedFiles: ["3D renders", "Floor plans", "Elevations", "Roof plan", "Concept material palette"],
    reasons: ["Request premium adaptation", "Discuss permit drawings", "Ask for full package pricing"],
  },
  {
    id: "plan-3",
    image:
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
    gallery: [
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
      "https://images.unsplash.com/photo-1606836591695-4d58a73eba1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
    ],
    title: "2-Bedroom Starter Home - Blueprint Package",
    rating: 4,
    downloads: 228,
    price: "RWF 45,000",
    badge: "New",
    type: "residential",
    format: "2D Blueprint",
    sheets: 10,
    status: "Print Ready",
    bedrooms: 2,
    floors: 1,
    builtAreaM2: 118,
    style: "Efficient Starter",
    tier: "FREE",
    estimatedCostMin: 24000000,
    estimatedCostMax: 32000000,
    summary: "An accessible starter package for efficient small-family construction.",
    description:
      "This plan supports modest budgets without losing build clarity. It fits narrow and standard plots and keeps structural logic simple for quick pricing and permit preparation.",
    zoningInfo: "Suited to plots from 250 to 380 sqm and first-time builds requiring straightforward compliance reviews.",
    includedFiles: ["Blueprint plans", "Room schedule", "Basic elevations"],
    reasons: ["Request review", "Need cost estimate", "Talk to an engineer"],
  },
  {
    id: "plan-4",
    image:
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
    gallery: [
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
      "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
    ],
    title: "Commercial Strip Mall - Full Architectural Set",
    rating: 5,
    downloads: 156,
    price: "RWF 250,000",
    badge: "Hot",
    type: "commercial",
    format: "2D + 3D",
    sheets: 36,
    status: "Print Ready",
    bedrooms: 0,
    floors: 2,
    builtAreaM2: 540,
    style: "Retail Mixed-Use",
    tier: "PREMIUM",
    estimatedCostMin: 180000000,
    estimatedCostMax: 245000000,
    summary: "A commercial-ready package with service access, frontage logic, and tenant flexibility.",
    description:
      "The set is organized for commercial developers who need structured frontage, straightforward tenant subdivision, and clear structural rhythm. It supports phased shell-and-core delivery.",
    zoningInfo: "Designed for commercially zoned urban corridors with strong frontage and moderate parking access requirements.",
    includedFiles: ["Architectural set", "3D concepts", "Massing study", "Tenant subdivision strategy"],
    reasons: ["Talk to a commercial expert", "Request compliance review", "Discuss phased delivery"],
  },
  {
    id: "plan-5",
    image:
      "https://images.unsplash.com/photo-1606836591695-4d58a73eba1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
    gallery: [
      "https://images.unsplash.com/photo-1606836591695-4d58a73eba1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
    ],
    title: "3-Bedroom Bungalow - 2D Floor Plans + Sections",
    rating: 4,
    downloads: 341,
    price: "RWF 65,000",
    badge: null,
    type: "residential",
    format: "2D Blueprint",
    sheets: 14,
    status: "Print Ready",
    bedrooms: 3,
    floors: 1,
    builtAreaM2: 162,
    style: "Contemporary Bungalow",
    tier: "PRO",
    estimatedCostMin: 36000000,
    estimatedCostMax: 47000000,
    summary: "A practical single-floor plan with strong flow between the public and private zones.",
    description:
      "Well suited to family plots and suburban edges, this bungalow layout keeps construction straightforward while maintaining generous room proportions and simple roof geometry.",
    zoningInfo: "Best for low-rise residential areas and family-owned plots where staged expansion may be considered later.",
    includedFiles: ["Floor plans", "Sections", "Foundation notes", "Roof framing guide"],
    reasons: ["Need a custom facade", "Ask for engineer review", "Start follow-up"],
  },
  {
    id: "plan-6",
    image:
      "https://images.unsplash.com/photo-1601918774516-b3f0dc3dd3ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
    gallery: [
      "https://images.unsplash.com/photo-1601918774516-b3f0dc3dd3ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1280",
    ],
    title: "Apartment Block Type A - 8 Units, Full Set",
    rating: 5,
    downloads: 203,
    price: "RWF 180,000",
    badge: "New",
    type: "apartment",
    format: "2D + 3D",
    sheets: 28,
    status: "Print Ready",
    bedrooms: 16,
    floors: 3,
    builtAreaM2: 690,
    style: "Urban Multi-Family",
    tier: "PREMIUM",
    estimatedCostMin: 210000000,
    estimatedCostMax: 298000000,
    summary: "An efficient multi-unit scheme built for repeatability, services coordination, and cash-flow staging.",
    description:
      "This apartment block package is designed for developers who need efficient cores, rentable floorplates, and a clear construction sequence. It balances unit density with manageable structure.",
    zoningInfo: "Recommended for urban infill and corridor plots with stronger utility capacity and rental demand.",
    includedFiles: ["Full architectural set", "3D views", "Unit schedules", "Core strategy"],
    reasons: ["Request a yield discussion", "Review regulations", "Connect with a project expert"],
  },
];

const expertsDirectory = [
  {
    id: "expert-1",
    name: "Jean-Paul Nkurunziza",
    profession: "Architect",
    category: "architect",
    location: "Kigali, Gasabo",
    rating: 4.9,
    reviews: 127,
    rate: 45000,
    experience: 12,
    projects: 89,
    verified: true,
    available: true,
    badge: "Top Rated",
    specialties: ["Residential Design", "3D Rendering", "Interior Layouts"],
    bio: "Senior architect specializing in modern Rwandan residential and mixed-use developments.",
    initials: "JN",
    color: "#0f766e",
    headline: "Design lead for premium homes and mixed-use concepts",
    company: "Nexa Habitat Studio",
    credentials: "RIBA certified architect",
    recentProjects: ["Family villa in Kacyiru", "Townhouse cluster in Gasabo", "Retail frontage concept in Kimihurura"],
    reasons: ["Need concept design", "Review an existing plan", "Book a site consultation"],
  },
  {
    id: "expert-2",
    name: "Marie Claire Uwimana",
    profession: "Structural Engineer",
    category: "engineer",
    location: "Kigali, Nyarugenge",
    rating: 4.8,
    reviews: 89,
    rate: 38000,
    experience: 9,
    projects: 64,
    verified: true,
    available: true,
    badge: "Verified",
    specialties: ["Structural Analysis", "Foundation Design", "BOQ"],
    bio: "Civil and structural engineer focused on reinforced concrete design and site supervision.",
    initials: "MU",
    color: "#1d4ed8",
    headline: "Structure-first project reviews for residential and medium commercial work",
    company: "FrameLogic Consultants",
    credentials: "Licensed structural engineer",
    recentProjects: ["Apartment block review", "Foundation redesign", "Commercial slab optimization"],
    reasons: ["Need structural validation", "Review my BOQ", "Talk through foundation options"],
  },
  {
    id: "expert-3",
    name: "Patrick Habimana",
    profession: "General Contractor",
    category: "contractor",
    location: "Kigali, Kicukiro",
    rating: 4.7,
    reviews: 203,
    rate: 55000,
    experience: 15,
    projects: 142,
    verified: true,
    available: false,
    badge: "Top Rated",
    specialties: ["Full Construction", "Project Management", "Site Supervision"],
    bio: "Experienced contractor managing full-cycle residential and commercial builds.",
    initials: "PH",
    color: "#b45309",
    headline: "Execution partner for clients moving from approvals into delivery",
    company: "Habimana BuildWorks",
    credentials: "Certified project manager",
    recentProjects: ["Commercial shell delivery", "Luxury villa execution", "Townhouse finishing package"],
    reasons: ["Need a build quote", "Review project schedule", "Plan site supervision"],
  },
  {
    id: "expert-4",
    name: "Amina Mukamana",
    profession: "Interior Designer",
    category: "architect",
    location: "Kigali, Kimihurura",
    rating: 4.9,
    reviews: 156,
    rate: 42000,
    experience: 8,
    projects: 110,
    verified: true,
    available: true,
    badge: "Top Rated",
    specialties: ["Space Planning", "Material Selection", "3D Visualization"],
    bio: "Award-winning designer blending local craft sensibilities with clean modern interiors.",
    initials: "AM",
    color: "#0f766e",
    headline: "Interior systems, finishes, and spatial refinement",
    company: "Amina Spatial Studio",
    credentials: "Interior architecture specialist",
    recentProjects: ["Villa interiors", "Hospitality lounge refresh", "Apartment fit-out palette"],
    reasons: ["Need finish guidance", "Review room layouts", "Request visualization help"],
  },
  {
    id: "expert-5",
    name: "Claudine Uwase",
    profession: "Quantity Surveyor",
    category: "surveyor",
    location: "Kigali, Gasabo",
    rating: 4.8,
    reviews: 94,
    rate: 40000,
    experience: 10,
    projects: 78,
    verified: true,
    available: true,
    badge: "Verified",
    specialties: ["Cost Estimation", "BOQ Preparation", "Contract Management"],
    bio: "Chartered quantity surveyor delivering accurate cost plans for homes and commercial sites.",
    initials: "CU",
    color: "#047857",
    headline: "Budget clarity, procurement support, and BOQ control",
    company: "CostLine Rwanda",
    credentials: "Chartered quantity surveyor",
    recentProjects: ["Townhouse BOQ", "Retail cost plan", "Residential procurement review"],
    reasons: ["Need a BOQ", "Check my budget", "Prepare procurement scope"],
  },
  {
    id: "expert-6",
    name: "Alice Kankindi",
    profession: "Urban Planner",
    category: "surveyor",
    location: "Kigali, Nyarugenge",
    rating: 4.9,
    reviews: 141,
    rate: 52000,
    experience: 14,
    projects: 97,
    verified: true,
    available: true,
    badge: "Top Rated",
    specialties: ["Master Planning", "Zoning Compliance", "Environmental Impact"],
    bio: "Senior urban planner with deep expertise in land-use regulations and development sequencing.",
    initials: "AK",
    color: "#4338ca",
    headline: "Development strategy and regulatory alignment for larger sites",
    company: "CityForm Advisory",
    credentials: "Urban planning lead",
    recentProjects: ["Estate masterplan", "Commercial zoning review", "Site compliance strategy"],
    reasons: ["Check land compliance", "Plan a phased development", "Review environmental considerations"],
  },
];

const notificationWorkflow = [
  {
    role: "Standard User",
    title: "Delivery and assignment updates",
    notifiedWhen: "Engineer assigned or plan ready",
    keyInformation: ["Download link", "Engineer profile", "Next steps"],
    accent: "bg-teal-600",
  },
  {
    role: "Admin",
    title: "Intake and visit requests",
    notifiedWhen: "New user signs up or visit requested",
    keyInformation: ["User details", "Requested date", "Urgency level"],
    accent: "bg-slate-800",
  },
  {
    role: "Super Admin",
    title: "Platform-wide oversight",
    notifiedWhen: "Any platform activity",
    keyInformation: ["System logs", "Financial transactions", "User escalations"],
    accent: "bg-cyan-700",
  },
];

function byId(items, id) {
  return items.find((item) => String(item.id) === String(id)) || null;
}

function relatedBy(items, currentId, predicate) {
  return items.filter((item) => String(item.id) !== String(currentId)).filter(predicate).slice(0, 3);
}

export function getMarketplaceListings() {
  return marketplaceListings;
}

export function getMarketplaceListingById(id) {
  return byId(marketplaceListings, id);
}

export function getRelatedMarketplaceListings(currentId, currentCategory) {
  return relatedBy(
    marketplaceListings,
    currentId,
    (item) => item.category === currentCategory || item.prime,
  );
}

export function getPlanLibraryItems() {
  return planLibraryItems;
}

export function getPlanLibraryItemById(id) {
  return byId(planLibraryItems, id);
}

export function getRelatedPlanLibraryItems(currentId, currentType) {
  return relatedBy(
    planLibraryItems,
    currentId,
    (item) => item.type === currentType || item.tier === "PREMIUM",
  );
}

export function getExpertsDirectory() {
  return expertsDirectory;
}

export function getExpertDirectoryItemById(id) {
  return byId(expertsDirectory, id);
}

export function getRelatedExperts(currentId, currentCategory) {
  return relatedBy(
    expertsDirectory,
    currentId,
    (item) => item.category === currentCategory || item.verified,
  );
}

export function getNotificationWorkflow() {
  return notificationWorkflow;
}

export function mapMockListingToApiShape(item) {
  if (!item) return null;
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    price: item.price,
    currency: "RWF",
    listingType: item.category.toUpperCase(),
    status: item.tag === "For Sale" ? "ACTIVE" : "RESERVED",
    locationText: item.location,
    sizeM2: item.areaSqm,
    bedrooms: item.bedrooms,
    bathrooms: item.bathrooms,
    region: { name: item.location },
    owner: { fullName: "CivilBridge Marketplace Desk" },
    images: item.gallery.map((image, index) => ({
      id: `${item.id}-img-${index}`,
      imageUrl: image,
    })),
    reasons: item.reasons,
    amenities: item.amenities,
    engineeringGrade: item.engineeringGrade,
    lotSize: item.lotSize,
    handover: item.handover,
    parking: item.parking,
  };
}

export function mapMockPlanToApiShape(item) {
  if (!item) return null;
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    category: item.type,
    style: item.style,
    status: item.status === "Print Ready" ? "APPROVED" : "PENDING",
    tier: item.tier,
    floors: item.floors,
    bedrooms: item.bedrooms,
    builtAreaM2: item.builtAreaM2,
    estimatedCostMin: item.estimatedCostMin,
    estimatedCostMax: item.estimatedCostMax,
    zoningInfo: item.zoningInfo,
    creator: { fullName: "CivilBridge Plan Desk" },
    assets: [
      ...item.gallery.map((image, index) => ({
        id: `${item.id}-render-${index}`,
        assetType: "render",
        assetUrl: image,
      })),
      ...item.includedFiles.map((label, index) => ({
        id: `${item.id}-doc-${index}`,
        assetType: label.toLowerCase().replaceAll(" ", "_"),
        assetUrl: "",
      })),
    ],
    reasons: item.reasons,
    summary: item.summary,
  };
}

export function mapMockExpertToProfileShape(item) {
  if (!item) return null;
  return {
    id: item.id,
    providerType: item.profession,
    verifiedAt: item.verified ? new Date().toISOString() : null,
    avgRating: item.rating,
    reviewCount: item.reviews,
    completedProjectsCount: item.projects,
    specialties: item.specialties,
    headline: item.headline,
    businessName: item.company,
    user: {
      fullName: item.name,
      profession: item.profession,
      bio: item.bio,
      email: `${item.name.toLowerCase().replaceAll(" ", ".")}@civilbridge.demo`,
      companyName: item.company,
      licenseNumber: item.credentials,
    },
    region: { name: item.location },
    availability: item.available
      ? [
          {
            id: `${item.id}-slot-1`,
            startsAt: new Date(Date.now() + 86400000).toISOString(),
            endsAt: new Date(Date.now() + 90000000).toISOString(),
            notes: "Remote consultation slot",
          },
          {
            id: `${item.id}-slot-2`,
            startsAt: new Date(Date.now() + 172800000).toISOString(),
            endsAt: new Date(Date.now() + 176400000).toISOString(),
            notes: "Project review session",
          },
        ]
      : [],
    portfolio: item.recentProjects.map((project, index) => ({
      id: `${item.id}-portfolio-${index}`,
      projectName: project,
      projectType: item.category,
      regionName: item.location,
      status: "COMPLETED",
      progress: 100,
      latestStage: "Delivered",
    })),
    reviews: [
      {
        id: `${item.id}-review-1`,
        createdAt: new Date(Date.now() - 604800000).toISOString(),
        rating: Math.round(item.rating),
        comment: `Strong communication, dependable delivery, and a clear explanation of tradeoffs throughout the project.`,
        reviewer: { fullName: "CivilBridge Client" },
      },
    ],
    reasons: item.reasons,
  };
}
