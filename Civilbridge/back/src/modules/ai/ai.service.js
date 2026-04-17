import { AI_TASKS, getPromptTemplate, getResponseSchema } from "./ai.prompts.js";
import {
  callClaudeJson,
  callGeminiJson,
  isClaudeAvailable,
  isGeminiAvailable,
} from "./ai.adapters.js";
import { findBestCostBenchmark } from "../admin/cost-benchmark.service.js";

const PROVIDERS = Object.freeze({
  GEMINI: "gemini",
  CLAUDE: "claude",
});

const SUPPORTED_PROVIDERS = Object.freeze(Object.values(PROVIDERS));
const RETRY_DELAYS_MS = [500, 1000, 2000];

export class AIServiceError extends Error {
  constructor(message, status = 500, details = {}) {
    super(message);
    this.name = "AIServiceError";
    this.status = status;
    this.details = details;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry(taskLabel, operation) {
  let lastError;

  for (let attempt = 0; attempt < RETRY_DELAYS_MS.length + 1; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt >= RETRY_DELAYS_MS.length) {
        break;
      }

      await sleep(RETRY_DELAYS_MS[attempt]);
    }
  }

  throw new AIServiceError(`${taskLabel} failed after 3 retries.`, 502, {
    cause: lastError?.message || String(lastError),
  });
}

function sanitizeJsonText(text) {
  const trimmed = String(text || "").trim();

  if (!trimmed) {
    throw new AIServiceError("AI provider returned an empty response.", 502);
  }

  const fencedMatch = trimmed.match(/```json\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const startIndex = Math.min(
    ...["{", "["]
      .map((char) => trimmed.indexOf(char))
      .filter((index) => index >= 0)
  );

  if (Number.isFinite(startIndex) && startIndex >= 0) {
    const endObject = trimmed.lastIndexOf("}");
    const endArray = trimmed.lastIndexOf("]");
    const endIndex = Math.max(endObject, endArray);

    if (endIndex > startIndex) {
      return trimmed.slice(startIndex, endIndex + 1);
    }
  }

  return trimmed;
}

function parseStructuredResponse(rawText, context) {
  const sanitized = sanitizeJsonText(rawText);

  try {
    return JSON.parse(sanitized);
  } catch (error) {
    console.error("Malformed AI JSON response:", {
      task: context.task,
      provider: context.provider,
      rawText: String(rawText || "").slice(0, 1000),
    });
    throw new AIServiceError("AI response was not valid JSON.", 502, {
      provider: context.provider,
      task: context.task,
    });
  }
}

function normalizeExpectedTypes(typeValue) {
  if (!typeValue) {
    return [];
  }

  return Array.isArray(typeValue) ? typeValue : [typeValue];
}

function validateSchemaNode(schema, value, path = "$") {
  const errors = [];
  const expectedTypes = normalizeExpectedTypes(schema?.type);
  const isNullAllowed = expectedTypes.includes("null");

  if (value === null) {
    if (!isNullAllowed && expectedTypes.length) {
      errors.push(`${path} must not be null.`);
    }
    return errors;
  }

  if (expectedTypes.includes("object")) {
    if (typeof value !== "object" || Array.isArray(value) || value === null) {
      errors.push(`${path} must be an object.`);
      return errors;
    }

    const required = schema.required || [];
    for (const key of required) {
      if (!(key in value)) {
        errors.push(`${path}.${key} is required.`);
      }
    }

    const properties = schema.properties || {};
    for (const [key, childSchema] of Object.entries(properties)) {
      if (key in value) {
        errors.push(...validateSchemaNode(childSchema, value[key], `${path}.${key}`));
      }
    }

    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!(key in properties)) {
          errors.push(`${path}.${key} is not allowed.`);
        }
      }
    }

    return errors;
  }

  if (expectedTypes.includes("array")) {
    if (!Array.isArray(value)) {
      errors.push(`${path} must be an array.`);
      return errors;
    }

    value.forEach((item, index) => {
      errors.push(...validateSchemaNode(schema.items || {}, item, `${path}[${index}]`));
    });

    return errors;
  }

  if (expectedTypes.includes("string")) {
    if (typeof value !== "string") {
      errors.push(`${path} must be a string.`);
      return errors;
    }

    if (schema.enum && !schema.enum.includes(value)) {
      errors.push(`${path} must be one of: ${schema.enum.join(", ")}.`);
    }

    return errors;
  }

  if (expectedTypes.includes("integer")) {
    if (!Number.isInteger(value)) {
      errors.push(`${path} must be an integer.`);
      return errors;
    }

    if (schema.minimum !== undefined && value < schema.minimum) {
      errors.push(`${path} must be >= ${schema.minimum}.`);
    }

    if (schema.maximum !== undefined && value > schema.maximum) {
      errors.push(`${path} must be <= ${schema.maximum}.`);
    }

    return errors;
  }

  if (expectedTypes.includes("number")) {
    if (typeof value !== "number" || Number.isNaN(value)) {
      errors.push(`${path} must be a number.`);
      return errors;
    }

    if (schema.minimum !== undefined && value < schema.minimum) {
      errors.push(`${path} must be >= ${schema.minimum}.`);
    }

    if (schema.maximum !== undefined && value > schema.maximum) {
      errors.push(`${path} must be <= ${schema.maximum}.`);
    }

    return errors;
  }

  if (expectedTypes.includes("boolean") && typeof value !== "boolean") {
    errors.push(`${path} must be a boolean.`);
  }

  return errors;
}

function assertSchemaValidity({ provider, task, schema, parsed }) {
  const errors = validateSchemaNode(schema, parsed);

  if (errors.length) {
    console.error("AI schema validation failed:", {
      provider,
      task,
      errors,
      parsed,
    });
    throw new AIServiceError("AI response failed schema validation.", 502, {
      provider,
      task,
      errors,
    });
  }
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatBenchmarkPromptValue(benchmarkContext) {
  if (!benchmarkContext) {
    return "No current regional benchmark found.";
  }

  return {
    location: `${benchmarkContext.province}${benchmarkContext.district ? `, ${benchmarkContext.district}` : ""}`,
    buildingType: benchmarkContext.buildingType,
    currency: benchmarkContext.currency,
    minCostPerM2: benchmarkContext.minCostPerM2,
    maxCostPerM2: benchmarkContext.maxCostPerM2,
    midpointCostPerM2: benchmarkContext.midpointCostPerM2,
    volatility: benchmarkContext.volatility,
    updatedAt: benchmarkContext.updatedAt,
  };
}

function buildHumanReviewSummary(planReviewFlags = [], boq = [], overallConfidence = 0) {
  const lowConfidenceItems = boq
    .filter((item) => toNumber(item.confidence) < 0.85)
    .map((item) => ({
      item: item.item,
      reason: `Low extraction confidence (${Math.round(toNumber(item.confidence) * 100)}%).`,
      severity: toNumber(item.confidence) < 0.65 ? "high" : "medium",
    }));

  const flaggedItems = [...planReviewFlags, ...lowConfidenceItems];

  return {
    required: flaggedItems.length > 0 || overallConfidence < 0.85,
    status:
      flaggedItems.length > 0 || overallConfidence < 0.7
        ? "CHECKER_REQUIRED"
        : "READY_FOR_REVIEW",
    flaggedItems,
  };
}

function mapBoqItems(items = []) {
  return items.map((item) => ({
    ...item,
    quantity: toNumber(item.quantity),
    unitCost: toNumber(item.unitCost),
    totalCost: toNumber(item.totalCost),
    confidence: toNumber(item.confidence),
  }));
}

function mapBoqExtractionResult(data, context) {
  const boq = mapBoqItems(data.boq);
  const overallConfidence = toNumber(data.confidence?.overall);

  return {
    providerUsed: context.provider,
    providerRecommendation: context.recommendedProvider,
    sourceFile: context.file
      ? {
          originalName: context.file.originalname,
          mimeType: context.file.mimetype,
          sizeBytes: context.file.size,
        }
      : null,
    summary: data.projectSummary,
    dimensions: (data.dimensions || []).map((entry) => ({
      ...entry,
      value: toNumber(entry.value),
    })),
    materials: (data.materials || []).map((entry) => ({
      ...entry,
      quantity: toNumber(entry.quantity),
    })),
    boq,
    totals: {
      currency: data.costSummary?.currency || "RWF",
      subtotal: toNumber(data.costSummary?.subtotal),
      contingency: toNumber(data.costSummary?.contingency),
      grandTotal:
        toNumber(data.costSummary?.grandTotal) ||
        boq.reduce((sum, item) => sum + item.totalCost, 0),
      lineItems: boq.length,
    },
    assumptions: data.assumptions || [],
    missingInformation: data.missingInformation || [],
    risks: data.risks || [],
    overlayRegions: (data.overlayRegions || []).map((entry) => ({
      ...entry,
      x: toNumber(entry.x),
      y: toNumber(entry.y),
      width: toNumber(entry.width),
      height: toNumber(entry.height),
      confidence: toNumber(entry.confidence),
    })),
    confidence: {
      overall: overallConfidence,
      notes: data.confidence?.notes || "",
    },
    pricingBasis: context.marketBenchmark || null,
  };
}

function mapMeasurementPlanResult(data) {
  return {
    projectUnderstanding: data.projectUnderstanding,
    measurementPlan: data.measurementPlan || [],
    reviewFlags: data.reviewFlags || [],
    requiredInputs: data.requiredInputs || [],
    shouldProceed: Boolean(data.shouldProceed),
  };
}

function mapPlanGenerationResult(data, context) {
  const boq = mapBoqItems(data.boq);

  return {
    planSpecification: data.planSpecification,
    spaceProgram: data.spaceProgram || [],
    boq,
    totals: {
      currency: data.budgetSummary?.currency || "RWF",
      targetBudget: toNumber(data.budgetSummary?.targetBudget),
      estimatedTotal:
        toNumber(data.budgetSummary?.estimatedTotal) ||
        boq.reduce((sum, item) => sum + item.totalCost, 0),
      budgetFit: data.budgetSummary?.budgetFit || "unknown",
    },
    assumptions: data.assumptions || [],
    risks: data.risks || [],
    nextSteps: data.nextSteps || [],
    pricingBasis: context.marketBenchmark || null,
  };
}

function mapConversationalEstimationResult(data, context) {
  return {
    projectIntent: data.projectIntent,
    feasibleOptions: data.feasibleOptions || [],
    flaggedRisks: data.flaggedRisks || [],
    budgetFit: data.budgetFit || "unknown",
    recommendedNextSteps: data.recommendedNextSteps || [],
    pricingBasis: context.marketBenchmark || null,
    upiData: context.upiData || null,
  };
}

function mapBudgetAnalysisResult(data) {
  return data;
}

function mapFeasibilityAssessmentResult(data) {
  return data;
}

function mapTaskResult(task, parsed, context) {
  switch (task) {
    case AI_TASKS.MEASUREMENT_PLAN:
      return mapMeasurementPlanResult(parsed, context);
    case AI_TASKS.BOQ_EXTRACTION:
      return mapBoqExtractionResult(parsed, context);
    case AI_TASKS.PLAN_GENERATION:
      return mapPlanGenerationResult(parsed, context);
    case AI_TASKS.CONVERSATIONAL_ESTIMATION:
      return mapConversationalEstimationResult(parsed, context);
    case AI_TASKS.BUDGET_ANALYSIS:
      return mapBudgetAnalysisResult(parsed, context);
    case AI_TASKS.FEASIBILITY_ASSESSMENT:
      return mapFeasibilityAssessmentResult(parsed, context);
    default:
      return parsed;
  }
}

function normalizeProviderName(provider) {
  const normalized = String(provider || "")
    .trim()
    .toLowerCase();

  return SUPPORTED_PROVIDERS.includes(normalized) ? normalized : null;
}

function isProviderAvailable(provider) {
  if (provider === PROVIDERS.GEMINI) {
    return isGeminiAvailable();
  }

  if (provider === PROVIDERS.CLAUDE) {
    return isClaudeAvailable();
  }

  return false;
}

function resolveConfiguredProvider(input, fallback) {
  const normalized = normalizeProviderName(input);

  if (normalized && isProviderAvailable(normalized)) {
    return normalized;
  }

  if (fallback && isProviderAvailable(fallback)) {
    return fallback;
  }

  const firstAvailable = SUPPORTED_PROVIDERS.find((provider) =>
    isProviderAvailable(provider)
  );

  if (firstAvailable) {
    return firstAvailable;
  }

  throw new AIServiceError(
    "No AI provider is configured. Add GEMINI_API_KEY or ANTHROPIC_API_KEY.",
    503
  );
}

function getEnvProvider(envKey, fallback) {
  return resolveConfiguredProvider(process.env[envKey], fallback);
}

function getConfiguredRoutingValue(envKey, fallback) {
  return normalizeProviderName(process.env[envKey]) || fallback;
}

function getDefaultProvider() {
  return getEnvProvider("AI_DEFAULT_PROVIDER", PROVIDERS.GEMINI);
}

function getTaskProvider(task) {
  switch (task) {
    case AI_TASKS.PLAN_GENERATION:
      return getEnvProvider("AI_GENERATE_PLAN_PROVIDER", getDefaultProvider());
    case AI_TASKS.CONVERSATIONAL_ESTIMATION:
      return getEnvProvider("AI_ESTIMATE_PROVIDER", getDefaultProvider());
    case AI_TASKS.BUDGET_ANALYSIS:
      return getEnvProvider("AI_BUDGET_ANALYSIS_PROVIDER", getDefaultProvider());
    case AI_TASKS.FEASIBILITY_ASSESSMENT:
      return getEnvProvider("AI_FEASIBILITY_PROVIDER", getDefaultProvider());
    default:
      return getDefaultProvider();
  }
}

function pickRecommendedVisionProvider(file) {
  const isPdf = file?.mimetype === "application/pdf";
  const envKey = isPdf
    ? "AI_ANALYZE_PLAN_PDF_PROVIDER"
    : "AI_ANALYZE_PLAN_IMAGE_PROVIDER";
  const fallback = isPdf ? PROVIDERS.CLAUDE : PROVIDERS.GEMINI;

  return getEnvProvider(envKey, fallback);
}

function pickFallbackProvider(primary) {
  if (primary === PROVIDERS.CLAUDE && isGeminiAvailable()) {
    return PROVIDERS.GEMINI;
  }

  if (primary === PROVIDERS.GEMINI && isClaudeAvailable()) {
    return PROVIDERS.CLAUDE;
  }

  return null;
}

async function invokeProvider({ provider, task, prompt, schema, file }) {
  if (provider === PROVIDERS.CLAUDE) {
    return withRetry(`${provider}:${task}`, () => callClaudeJson({ prompt, file }));
  }

  return withRetry(`${provider}:${task}`, () =>
    callGeminiJson({ prompt, schema, file })
  );
}

export function getAIProviderStatus() {
  const gemini = isGeminiAvailable();
  const claude = isClaudeAvailable();
  const defaultRouting = getConfiguredRoutingValue(
    "AI_DEFAULT_PROVIDER",
    PROVIDERS.GEMINI
  );

  return {
    providers: {
      gemini: {
        available: gemini,
        configured: gemini,
        model:
          process.env.GEMINI_MODEL ||
          process.env.GEMINI_STRUCTURED_MODEL ||
          "gemini-2.5-flash",
      },
      claude: {
        available: claude,
        configured: claude,
        model: process.env.CLAUDE_MODEL || "claude-sonnet-4-20250514",
      },
    },
    routing: {
      default: defaultRouting,
      analyzePlanPdf: getConfiguredRoutingValue(
        "AI_ANALYZE_PLAN_PDF_PROVIDER",
        PROVIDERS.CLAUDE
      ),
      analyzePlanImage: getConfiguredRoutingValue(
        "AI_ANALYZE_PLAN_IMAGE_PROVIDER",
        PROVIDERS.GEMINI
      ),
      generatePlan: getConfiguredRoutingValue(
        "AI_GENERATE_PLAN_PROVIDER",
        defaultRouting
      ),
      estimate: getConfiguredRoutingValue(
        "AI_ESTIMATE_PROVIDER",
        defaultRouting
      ),
      budgetAnalysis: getConfiguredRoutingValue(
        "AI_BUDGET_ANALYSIS_PROVIDER",
        defaultRouting
      ),
      feasibility: getConfiguredRoutingValue(
        "AI_FEASIBILITY_PROVIDER",
        defaultRouting
      ),
    },
  };
}

export async function runStructuredTask(task, params = {}, options = {}) {
  const schema = getResponseSchema(task);
  const prompt = getPromptTemplate(task, params);
  const provider = resolveConfiguredProvider(
    options.provider,
    getTaskProvider(task)
  );
  const rawResponse = await invokeProvider({
    provider,
    task,
    prompt,
    schema,
    file: options.file,
  });
  const parsed = parseStructuredResponse(rawResponse.text, {
    task,
    provider: rawResponse.provider,
  });

  assertSchemaValidity({
    provider: rawResponse.provider,
    task,
    schema,
    parsed,
  });

  return {
    provider: rawResponse.provider,
    model: rawResponse.model,
    raw: parsed,
    data: mapTaskResult(task, parsed, options.context || {}),
  };
}

export async function analyzeBudget(params) {
  return runStructuredTask(AI_TASKS.BUDGET_ANALYSIS, params, {
    provider: getTaskProvider(AI_TASKS.BUDGET_ANALYSIS),
  });
}

export async function assessFeasibility(params) {
  return runStructuredTask(AI_TASKS.FEASIBILITY_ASSESSMENT, params, {
    provider: getTaskProvider(AI_TASKS.FEASIBILITY_ASSESSMENT),
  });
}

export async function analyzePlanDocument({
  file,
  location,
  projectType,
  notes,
  provider,
}) {
  if (!file?.buffer) {
    throw new AIServiceError("A PDF or image file is required.", 400);
  }

  const recommendedProvider = pickRecommendedVisionProvider(file);
  const preferredProvider = resolveConfiguredProvider(
    provider,
    recommendedProvider
  );
  const fallbackProvider = pickFallbackProvider(preferredProvider);
  const params = {
    fileType: file.mimetype,
    location,
    projectType,
    notes,
  };
  const marketBenchmark = await findBestCostBenchmark({ location, projectType });

  const runPlanWorkflow = async (workflowProvider) => {
    const planning = await runStructuredTask(AI_TASKS.MEASUREMENT_PLAN, {
      ...params,
      marketBenchmark: formatBenchmarkPromptValue(marketBenchmark),
    }, {
      provider: workflowProvider,
      file,
      context: {
        provider: workflowProvider,
        recommendedProvider,
        file,
        marketBenchmark,
      },
    });

    if (!planning.data.shouldProceed) {
      throw new AIServiceError(
        "The uploaded plan is too ambiguous for a precise BOQ. Review the flagged items before continuing.",
        422,
        {
          reviewFlags: planning.data.reviewFlags,
          requiredInputs: planning.data.requiredInputs,
        },
      );
    }

    const extraction = await runStructuredTask(AI_TASKS.BOQ_EXTRACTION, {
      ...params,
      measurementPlan: planning.data.measurementPlan,
      marketBenchmark: formatBenchmarkPromptValue(marketBenchmark),
      priceVolatility: marketBenchmark?.volatility || "No benchmark history yet.",
    }, {
      provider: workflowProvider,
      file,
      context: {
        provider: workflowProvider,
        recommendedProvider,
        file,
        marketBenchmark,
      },
    });

    const humanReview = buildHumanReviewSummary(
      planning.data.reviewFlags,
      extraction.data.boq,
      extraction.data.confidence.overall,
    );

    return {
      ...extraction,
      data: {
        ...extraction.data,
        measurementPlan: planning.data.measurementPlan,
        requiredInputs: planning.data.requiredInputs,
        humanReview,
      },
    };
  };

  try {
    return await runPlanWorkflow(preferredProvider);
  } catch (error) {
    if (!fallbackProvider || fallbackProvider === preferredProvider) {
      throw error;
    }

    console.warn("Primary vision provider failed, falling back.", {
      preferredProvider,
      fallbackProvider,
      reason: error.message,
    });

    return runPlanWorkflow(fallbackProvider);
  }
}

export async function generatePlanSpecification({
  budget,
  currency,
  preferences,
  location,
  upiData,
  siteConstraints,
}) {
  const marketBenchmark = await findBestCostBenchmark({
    location,
    projectType: preferences,
  });

  return runStructuredTask(
    AI_TASKS.PLAN_GENERATION,
    {
      budget,
      currency,
      preferences,
      location,
      upiData,
      siteConstraints,
      marketBenchmark: formatBenchmarkPromptValue(marketBenchmark),
      priceVolatility: marketBenchmark?.volatility || "No benchmark history yet.",
    },
    {
      provider: getTaskProvider(AI_TASKS.PLAN_GENERATION),
      context: {
        marketBenchmark,
      },
    }
  );
}

export async function estimateProjectOptions({
  idea,
  budgetRange,
  location,
  timeline,
  conversationHistory,
  buildingType,
  stories,
  upiData,
  siteConstraints,
}) {
  const marketBenchmark = await findBestCostBenchmark({
    location,
    projectType: buildingType || idea,
  });

  return runStructuredTask(
    AI_TASKS.CONVERSATIONAL_ESTIMATION,
    {
      idea,
      budgetRange,
      location,
      timeline,
      conversationHistory,
      buildingType,
      stories,
      upiData,
      siteConstraints,
      marketBenchmark: formatBenchmarkPromptValue(marketBenchmark),
      priceVolatility: marketBenchmark?.volatility || "No benchmark history yet.",
    },
    {
      provider: getTaskProvider(AI_TASKS.CONVERSATIONAL_ESTIMATION),
      context: {
        marketBenchmark,
        upiData,
      },
    }
  );
}
