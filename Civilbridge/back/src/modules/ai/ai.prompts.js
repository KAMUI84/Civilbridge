export const AI_TASKS = Object.freeze({
  BUDGET_ANALYSIS: "budget-analysis",
  MEASUREMENT_PLAN: "measurement-plan",
  BOQ_EXTRACTION: "boq-extraction",
  PLAN_GENERATION: "plan-generation",
  CONVERSATIONAL_ESTIMATION: "conversational-estimation",
  FEASIBILITY_ASSESSMENT: "feasibility-assessment",
});

const JSON_RULES = [
  "Return valid JSON only.",
  "Do not wrap the JSON in markdown fences.",
  "Do not include explanatory prose outside the JSON object.",
  "Use Rwanda construction context and use RWF unless another currency is explicitly provided.",
].join("\n");

function formatValue(value) {
  if (value === undefined || value === null || value === "") {
    return "Not provided";
  }

  if (Array.isArray(value)) {
    if (!value.length) {
      return "None";
    }

    return value
      .map((entry) => `- ${typeof entry === "string" ? entry : JSON.stringify(entry)}`)
      .join("\n");
  }

  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

function buildSection(title, value) {
  return `${title}:\n${formatValue(value)}`;
}

export const RESPONSE_SCHEMAS = Object.freeze({
  [AI_TASKS.BUDGET_ANALYSIS]: {
    type: "object",
    additionalProperties: false,
    required: [
      "budget",
      "allocation",
      "savingsOpportunities",
      "risks",
      "recommendation",
    ],
    properties: {
      budget: {
        type: "object",
        additionalProperties: false,
        required: ["currency", "targetBudget", "estimatedTotal", "gap", "withinBudget"],
        properties: {
          currency: { type: "string" },
          targetBudget: { type: "number" },
          estimatedTotal: { type: "number" },
          gap: { type: "number" },
          withinBudget: { type: "boolean" },
        },
      },
      allocation: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["category", "amount", "sharePercent", "notes"],
          properties: {
            category: { type: "string" },
            amount: { type: "number" },
            sharePercent: { type: "number" },
            notes: { type: "string" },
          },
        },
      },
      savingsOpportunities: {
        type: "array",
        items: { type: "string" },
      },
      risks: {
        type: "array",
        items: { type: "string" },
      },
      recommendation: { type: "string" },
    },
  },
  [AI_TASKS.BOQ_EXTRACTION]: {
    type: "object",
    additionalProperties: false,
    required: [
      "projectSummary",
      "dimensions",
      "materials",
      "boq",
      "costSummary",
      "assumptions",
      "missingInformation",
      "risks",
      "confidence",
      "overlayRegions",
    ],
    properties: {
      projectSummary: {
        type: "object",
        additionalProperties: false,
        required: ["buildingType", "floors", "location", "scope"],
        properties: {
          buildingType: { type: "string" },
          floors: { type: "integer" },
          location: { type: "string" },
          scope: { type: "string" },
        },
      },
      dimensions: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["label", "value", "unit", "source"],
          properties: {
            label: { type: "string" },
            value: { type: "number" },
            unit: { type: "string" },
            source: { type: "string" },
          },
        },
      },
      materials: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["name", "category", "unit", "quantity", "notes"],
          properties: {
            name: { type: "string" },
            category: { type: "string" },
            unit: { type: "string" },
            quantity: { type: "number" },
            notes: { type: "string" },
          },
        },
      },
      boq: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: [
            "category",
            "item",
            "unit",
            "quantity",
            "unitCost",
            "totalCost",
            "materialSpec",
            "confidence",
          ],
          properties: {
            category: { type: "string" },
            item: { type: "string" },
            unit: { type: "string" },
            quantity: { type: "number" },
            unitCost: { type: "number" },
            totalCost: { type: "number" },
            materialSpec: { type: "string" },
            confidence: { type: "number" },
          },
        },
      },
      costSummary: {
        type: "object",
        additionalProperties: false,
        required: ["currency", "subtotal", "contingency", "grandTotal"],
        properties: {
          currency: { type: "string" },
          subtotal: { type: "number" },
          contingency: { type: "number" },
          grandTotal: { type: "number" },
        },
      },
      assumptions: {
        type: "array",
        items: { type: "string" },
      },
      missingInformation: {
        type: "array",
        items: { type: "string" },
      },
      risks: {
        type: "array",
        items: { type: "string" },
      },
      confidence: {
        type: "object",
        additionalProperties: false,
        required: ["overall", "notes"],
        properties: {
          overall: { type: "number", minimum: 0, maximum: 1 },
          notes: { type: "string" },
        },
      },
      overlayRegions: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["label", "page", "x", "y", "width", "height", "notes", "confidence"],
          properties: {
            label: { type: "string" },
            page: { type: "integer", minimum: 1 },
            x: { type: "number", minimum: 0, maximum: 100 },
            y: { type: "number", minimum: 0, maximum: 100 },
            width: { type: "number", minimum: 0, maximum: 100 },
            height: { type: "number", minimum: 0, maximum: 100 },
            notes: { type: "string" },
            confidence: { type: "number", minimum: 0, maximum: 1 },
          },
        },
      },
    },
  },
  [AI_TASKS.MEASUREMENT_PLAN]: {
    type: "object",
    additionalProperties: false,
    required: [
      "projectUnderstanding",
      "measurementPlan",
      "reviewFlags",
      "requiredInputs",
      "shouldProceed",
    ],
    properties: {
      projectUnderstanding: {
        type: "object",
        additionalProperties: false,
        required: ["buildingType", "floors", "scope", "planReadiness"],
        properties: {
          buildingType: { type: "string" },
          floors: { type: "integer" },
          scope: { type: "string" },
          planReadiness: { type: "string" },
        },
      },
      measurementPlan: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["element", "measurementRule", "formula", "unit", "sourceEvidence"],
          properties: {
            element: { type: "string" },
            measurementRule: { type: "string" },
            formula: { type: "string" },
            unit: { type: "string" },
            sourceEvidence: { type: "string" },
          },
        },
      },
      reviewFlags: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["item", "reason", "severity"],
          properties: {
            item: { type: "string" },
            reason: { type: "string" },
            severity: { type: "string" },
          },
        },
      },
      requiredInputs: {
        type: "array",
        items: { type: "string" },
      },
      shouldProceed: { type: "boolean" },
    },
  },
  [AI_TASKS.PLAN_GENERATION]: {
    type: "object",
    additionalProperties: false,
    required: [
      "planSpecification",
      "spaceProgram",
      "boq",
      "budgetSummary",
      "assumptions",
      "risks",
      "nextSteps",
    ],
    properties: {
      planSpecification: {
        type: "object",
        additionalProperties: false,
        required: [
          "projectType",
          "architecturalStyle",
          "siteStrategy",
          "floorCount",
          "estimatedBuiltAreaSqm",
        ],
        properties: {
          projectType: { type: "string" },
          architecturalStyle: { type: "string" },
          siteStrategy: { type: "string" },
          floorCount: { type: "integer" },
          estimatedBuiltAreaSqm: { type: "number" },
        },
      },
      spaceProgram: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["space", "count", "notes"],
          properties: {
            space: { type: "string" },
            count: { type: "integer" },
            notes: { type: "string" },
          },
        },
      },
      boq: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["category", "item", "unit", "quantity", "unitCost", "totalCost"],
          properties: {
            category: { type: "string" },
            item: { type: "string" },
            unit: { type: "string" },
            quantity: { type: "number" },
            unitCost: { type: "number" },
            totalCost: { type: "number" },
          },
        },
      },
      budgetSummary: {
        type: "object",
        additionalProperties: false,
        required: ["currency", "targetBudget", "estimatedTotal", "budgetFit"],
        properties: {
          currency: { type: "string" },
          targetBudget: { type: "number" },
          estimatedTotal: { type: "number" },
          budgetFit: { type: "string" },
        },
      },
      assumptions: {
        type: "array",
        items: { type: "string" },
      },
      risks: {
        type: "array",
        items: { type: "string" },
      },
      nextSteps: {
        type: "array",
        items: { type: "string" },
      },
    },
  },
  [AI_TASKS.CONVERSATIONAL_ESTIMATION]: {
    type: "object",
    additionalProperties: false,
    required: [
      "projectIntent",
      "feasibleOptions",
      "flaggedRisks",
      "budgetFit",
      "recommendedNextSteps",
    ],
    properties: {
      projectIntent: {
        type: "object",
        additionalProperties: false,
        required: ["summary", "location", "budgetRange", "timeframe"],
        properties: {
          summary: { type: "string" },
          location: { type: "string" },
          budgetRange: { type: "string" },
          timeframe: { type: "string" },
        },
      },
      feasibleOptions: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["option", "estimatedCost", "fit", "tradeoffs"],
          properties: {
            option: { type: "string" },
            estimatedCost: { type: "string" },
            fit: { type: "string" },
            tradeoffs: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
      },
      flaggedRisks: {
        type: "array",
        items: { type: "string" },
      },
      budgetFit: { type: "string" },
      recommendedNextSteps: {
        type: "array",
        items: { type: "string" },
      },
    },
  },
  [AI_TASKS.FEASIBILITY_ASSESSMENT]: {
    type: "object",
    additionalProperties: false,
    required: ["feasible", "summary", "constraints", "opportunities", "nextSteps"],
    properties: {
      feasible: { type: "boolean" },
      summary: { type: "string" },
      constraints: {
        type: "array",
        items: { type: "string" },
      },
      opportunities: {
        type: "array",
        items: { type: "string" },
      },
      nextSteps: {
        type: "array",
        items: { type: "string" },
      },
    },
  },
});

export function buildBudgetAnalysisPrompt(params = {}) {
  return [
    "You are CivilBridge AI, a senior quantity surveyor and cost planner for Rwanda.",
    buildSection("Budget", params.budget),
    buildSection("Currency", params.currency || "RWF"),
    buildSection("Project Context", params.projectContext),
    buildSection("Location", params.location),
    buildSection("Available BOQ Items", params.boq),
    buildSection("Constraints", params.constraints),
    "Analyse the budget allocation, identify overruns, and recommend savings without compromising safety.",
    JSON_RULES,
  ].join("\n\n");
}

export function buildMeasurementPlanPrompt(params = {}) {
  return [
    "You are CivilBridge AI acting in maker-checker planning mode for Rwanda BOQ work.",
    "Do not calculate totals yet. First design the measurement logic only.",
    buildSection("Document Type", params.fileType),
    buildSection("Location", params.location),
    buildSection("Project Type", params.projectType),
    buildSection("User Notes", params.notes),
    buildSection("Market Benchmark", params.marketBenchmark),
    "List the measurement rules you will use, the formulas, and every unclear item that must be checked by a professional before final costing.",
    "If the drawing is too ambiguous, set shouldProceed to false.",
    JSON_RULES,
  ].join("\n\n");
}

export function buildBoqExtractionPrompt(params = {}) {
  return [
    "You are CivilBridge AI, a construction document analyst for Rwanda.",
    buildSection("Document Type", params.fileType),
    buildSection("Location", params.location),
    buildSection("Project Type", params.projectType),
    buildSection("User Notes", params.notes),
    buildSection("Approved Measurement Plan", params.measurementPlan),
    buildSection("Market Benchmark", params.marketBenchmark),
    buildSection("Price Volatility", params.priceVolatility),
    "Follow the approved measurement plan before doing any math.",
    "Extract visible or inferable dimensions, materials, and BOQ line items from the uploaded plan.",
    "When data is uncertain, include it in missingInformation or assumptions instead of inventing exact numbers.",
    "Use benchmark-informed Rwanda pricing when possible and calculate totals conservatively.",
    "If current benchmark pricing is missing, be explicit that live market precision is incomplete rather than pretending the numbers are exact.",
    "Return overlayRegions with normalized coordinates from 0 to 100 so the frontend can highlight what was counted.",
    JSON_RULES,
  ].join("\n\n");
}

export function buildPlanGenerationPrompt(params = {}) {
  return [
    "You are CivilBridge AI, an architectural planning assistant for Rwanda.",
    buildSection("Budget", params.budget),
    buildSection("Currency", params.currency || "RWF"),
    buildSection("Preferences", params.preferences),
    buildSection("Location", params.location),
    buildSection("UPI Data", params.upiData),
    buildSection("Site Constraints", params.siteConstraints),
    buildSection("Market Benchmark", params.marketBenchmark),
    buildSection("Price Volatility", params.priceVolatility),
    "Generate a practical architectural plan specification, room program, and full BOQ aligned to the budget.",
    "Prefer buildable, climate-aware solutions suitable for Rwanda.",
    JSON_RULES,
  ].join("\n\n");
}

export function buildConversationalEstimationPrompt(params = {}) {
  return [
    "You are CivilBridge AI, a conversational construction estimator for Rwanda.",
    buildSection("Idea", params.idea),
    buildSection("Budget Range", params.budgetRange),
    buildSection("Location", params.location),
    buildSection("Timeline", params.timeline),
    buildSection("Building Type", params.buildingType),
    buildSection("Stories", params.stories),
    buildSection("UPI Data", params.upiData),
    buildSection("Site Constraints", params.siteConstraints),
    buildSection("Market Benchmark", params.marketBenchmark),
    buildSection("Price Volatility", params.priceVolatility),
    buildSection("Conversation History", params.conversationHistory),
    "Return feasible options, explain tradeoffs, and flag the biggest risks early.",
    "Be honest about what is realistic versus unrealistic for CivilBridge to support at this stage.",
    "If current benchmark pricing is missing, avoid claiming exact live-market precision.",
    JSON_RULES,
  ].join("\n\n");
}

export function buildFeasibilityAssessmentPrompt(params = {}) {
  return [
    "You are CivilBridge AI, a feasibility analyst for Rwanda construction projects.",
    buildSection("Project Overview", params.projectOverview),
    buildSection("Budget", params.budget),
    buildSection("Location", params.location),
    buildSection("Regulatory Context", params.regulatoryContext),
    buildSection("Constraints", params.constraints),
    "Assess whether the project is feasible, note constraints, and list the best next actions.",
    JSON_RULES,
  ].join("\n\n");
}

export const PROMPT_BUILDERS = Object.freeze({
  [AI_TASKS.BUDGET_ANALYSIS]: buildBudgetAnalysisPrompt,
  [AI_TASKS.MEASUREMENT_PLAN]: buildMeasurementPlanPrompt,
  [AI_TASKS.BOQ_EXTRACTION]: buildBoqExtractionPrompt,
  [AI_TASKS.PLAN_GENERATION]: buildPlanGenerationPrompt,
  [AI_TASKS.CONVERSATIONAL_ESTIMATION]: buildConversationalEstimationPrompt,
  [AI_TASKS.FEASIBILITY_ASSESSMENT]: buildFeasibilityAssessmentPrompt,
});

export function getPromptTemplate(task, params = {}) {
  const builder = PROMPT_BUILDERS[task];

  if (!builder) {
    throw new Error(`Unsupported AI task: ${task}`);
  }

  return builder(params);
}

export function getResponseSchema(task) {
  const schema = RESPONSE_SCHEMAS[task];

  if (!schema) {
    throw new Error(`No response schema configured for AI task: ${task}`);
  }

  return schema;
}
