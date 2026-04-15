import "dotenv/config";
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { createServer } from "node:http";
import path from "node:path";
import { access, mkdir, rm } from "node:fs/promises";

process.env.NODE_ENV = "test";
process.env.ENABLE_APPOINTMENT_REMINDER_SCHEDULER = "false";
process.env.REDIS_URL = "";
process.env.JWT_SECRET ||= "civilbridge-test-secret";
process.env.FRONTEND_URL ||= "http://127.0.0.1:5173";
process.env.APP_BASE_URL ||= process.env.FRONTEND_URL;

let app;
let prisma;
let hashPassword;
let apiServer;
let providerServer;
let apiBaseUrl;
let providerBaseUrl;
let testUser;
const createdUploadPaths = new Set();
const providerRequests = [];

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject);
      resolve(server.address());
    });
  });
}

function closeServer(server) {
  if (!server) return Promise.resolve();
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function extractSetCookies(response) {
  if (typeof response.headers.getSetCookie === "function") {
    return response.headers.getSetCookie();
  }

  const singleHeader = response.headers.get("set-cookie");
  return singleHeader ? [singleHeader] : [];
}

class SessionClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.cookies = new Map();
  }

  get csrfToken() {
    return this.cookies.get("csrf") || "";
  }

  updateCookies(response) {
    for (const header of extractSetCookies(response)) {
      const [pair] = header.split(";");
      const separatorIndex = pair.indexOf("=");
      if (separatorIndex < 0) continue;

      const name = pair.slice(0, separatorIndex).trim();
      const value = pair.slice(separatorIndex + 1);

      if (!value) {
        this.cookies.delete(name);
      } else {
        this.cookies.set(name, value);
      }
    }
  }

  cookieHeader() {
    return Array.from(this.cookies.entries())
      .map(([name, value]) => `${name}=${value}`)
      .join("; ");
  }

  async request(pathname, options = {}) {
    const headers = new Headers(options.headers || {});
    if (this.cookies.size) {
      headers.set("cookie", this.cookieHeader());
    }

    const response = await fetch(new URL(pathname, this.baseUrl), {
      ...options,
      headers,
    });

    this.updateCookies(response);
    return response;
  }
}

function createFakeMtnProvider() {
  return createServer(async (req, res) => {
    const url = new URL(req.url, "http://127.0.0.1");

    res.setHeader("Content-Type", "application/json");

    if (req.method === "POST" && url.pathname === "/collection/token/") {
      res.writeHead(200);
      res.end(JSON.stringify({ access_token: "test-mtn-access-token" }));
      return;
    }

    if (req.method === "POST" && url.pathname === "/collection/v1_0/requesttopay") {
      const payload = await readJson(req);
      providerRequests.push({
        type: "initiate",
        reference: req.headers["x-reference-id"],
        payload,
      });

      res.writeHead(202);
      res.end(JSON.stringify({ status: "PENDING" }));
      return;
    }

    if (req.method === "GET" && url.pathname.startsWith("/collection/v1_0/requesttopay/")) {
      const reference = url.pathname.split("/").pop();
      providerRequests.push({
        type: "status",
        reference,
      });

      res.writeHead(200);
      res.end(JSON.stringify({
        status: "SUCCESSFUL",
        financialTransactionId: `ftx-${reference}`,
        externalId: reference,
      }));
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ message: "Not found" }));
  });
}

function hashResetToken(token) {
  return createHash("sha256").update(String(token)).digest("hex");
}

async function seedTestUser() {
  const suffix = randomUUID().replace(/-/g, "").slice(0, 10);
  const password = `Pass-${suffix}!`;
  const phone = `07${suffix.slice(0, 8)}`;
  const email = `integration-${suffix}@civilbridge.test`;
  const fullName = `Integration Test ${suffix}`;
  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      phone,
      passwordHash,
      role: "CLIENT",
      verificationStatus: "VERIFIED",
    },
  });

  return {
    id: user.id.toString(),
    fullName,
    email,
    phone,
    password,
  };
}

async function deleteCreatedUser() {
  if (!testUser) return;

  const userId = BigInt(testUser.id);
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    select: { id: true },
  });

  if (transactions.length) {
    await prisma.paymentWebhookEvent.deleteMany({
      where: {
        transactionId: {
          in: transactions.map((transaction) => transaction.id),
        },
      },
    });
  }

  await prisma.providerReview.deleteMany({ where: { reviewerUserId: userId } });
  await prisma.auditLog.deleteMany({ where: { userId } });
  await prisma.serviceProvider.deleteMany({ where: { userId } });
  await prisma.upload.deleteMany({ where: { uploadedById: userId } });
  await prisma.userProfile.deleteMany({ where: { userId } });
  await prisma.transaction.deleteMany({ where: { userId } });
  await prisma.userSession.deleteMany({ where: { userId } });
  await prisma.notification.deleteMany({ where: { userId } });
  await prisma.user.deleteMany({ where: { id: userId } });
}

async function loginAsSeededUser() {
  const client = new SessionClient(apiBaseUrl);
  const response = await client.request("/api/auth/login", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      email: testUser.phone,
      password: testUser.password,
    }),
  });

  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.success, true);
  assert.equal(body.user.role, "CLIENT");
  assert.equal(client.csrfToken, body.csrfToken);
  assert.ok(client.cookies.has("token"));

  return client;
}

before(async () => {
  await mkdir(path.join(process.cwd(), "uploads"), { recursive: true });

  providerServer = createFakeMtnProvider();
  const providerAddress = await listen(providerServer);
  providerBaseUrl = `http://127.0.0.1:${providerAddress.port}`;

  process.env.MTN_MOMO_BASE_URL = providerBaseUrl;
  process.env.MTN_MOMO_COLLECTION_PATH = "/collection/v1_0";
  process.env.MTN_MOMO_API_USER = "test-api-user";
  process.env.MTN_MOMO_API_KEY = "test-api-key";
  process.env.MTN_MOMO_SUBSCRIPTION_KEY = "test-subscription-key";
  process.env.MTN_MOMO_TARGET_ENVIRONMENT = "sandbox";

  ({ default: app } = await import("../src/app.js"));
  ({ default: prisma } = await import("../src/config/prisma.js"));
  ({ hashPassword } = await import("../src/utils/password.js"));

  apiServer = createServer(app);
  const apiAddress = await listen(apiServer);
  apiBaseUrl = `http://127.0.0.1:${apiAddress.port}`;

  testUser = await seedTestUser();
});

after(async () => {
  await deleteCreatedUser();

  for (const filePath of createdUploadPaths) {
    await rm(filePath, { force: true });
  }

  await closeServer(apiServer);
  await closeServer(providerServer);
  await prisma?.$disconnect();
});

describe("CivilBridge API integration", () => {
  it("authenticates with login, reaches a protected route, and clears auth on logout", async () => {
    const client = await loginAsSeededUser();

    const meResponse = await client.request("/api/me");
    assert.equal(meResponse.status, 200);

    const meBody = await meResponse.json();
    assert.equal(meBody.success, true);
    assert.equal(meBody.user.phone, testUser.phone);
    assert.equal(meBody.user.fullName, testUser.fullName);

    const logoutResponse = await client.request("/api/auth/logout", {
      method: "POST",
    });
    assert.equal(logoutResponse.status, 200);

    const logoutBody = await logoutResponse.json();
    assert.equal(logoutBody.success, true);

    const afterLogout = await client.request("/api/me");
    assert.equal(afterLogout.status, 401);
  });

  it("creates password reset records, validates a reset token, and logs in with the new password", async () => {
    const requestResponse = await fetch(new URL("/api/password-reset/request", apiBaseUrl), {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: testUser.email,
      }),
    });

    assert.equal(requestResponse.status, 200);
    const requestBody = await requestResponse.json();
    assert.match(requestBody.message, /password reset link/i);

    const storedRequestRecord = await prisma.oTPCode.findFirst({
      where: {
        target: testUser.email,
        purpose: "reset_password",
      },
      orderBy: { id: "desc" },
    });

    assert.ok(storedRequestRecord);

    await prisma.oTPCode.deleteMany({
      where: {
        target: testUser.email,
        purpose: "reset_password",
      },
    });

    const knownToken = `reset-${randomUUID()}`;
    const newPassword = `Reset-${randomUUID().slice(0, 8)}!`;

    await prisma.oTPCode.create({
      data: {
        target: testUser.email,
        otpHash: hashResetToken(knownToken),
        purpose: "reset_password",
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    const validateResponse = await fetch(new URL(`/api/password-reset/validate/${knownToken}`, apiBaseUrl));
    assert.equal(validateResponse.status, 200);

    const validateBody = await validateResponse.json();
    assert.equal(validateBody.valid, true);

    const resetResponse = await fetch(new URL("/api/password-reset/reset", apiBaseUrl), {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        token: knownToken,
        newPassword,
      }),
    });

    assert.equal(resetResponse.status, 200);
    const resetBody = await resetResponse.json();
    assert.match(resetBody.message, /password reset successfully/i);

    const consumedResetRecord = await prisma.oTPCode.findFirst({
      where: {
        otpHash: hashResetToken(knownToken),
        purpose: "reset_password",
      },
    });
    assert.equal(consumedResetRecord, null);

    const loginClient = new SessionClient(apiBaseUrl);
    const loginResponse = await loginClient.request("/api/auth/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: testUser.email,
        password: newPassword,
      }),
    });

    assert.equal(loginResponse.status, 200);
    const loginBody = await loginResponse.json();
    assert.equal(loginBody.success, true);
    assert.equal(loginBody.user.email, testUser.email);

    testUser.password = newPassword;
  });

  it("initiates an MTN payment and confirms it through status polling", async () => {
    const client = await loginAsSeededUser();
    providerRequests.length = 0;

    const initiateResponse = await client.request("/api/payments/initiate", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-csrf-token": client.csrfToken,
      },
      body: JSON.stringify({
        provider: "MTN_MOMO",
        serviceType: "PLAN_DOWNLOAD",
        serviceReference: `plan-${randomUUID().slice(0, 8)}`,
        serviceLabel: "Integration Test Plan",
        amount: 2500,
        currency: "RWF",
        phoneNumber: testUser.phone,
        description: "Integration payment test",
      }),
    });

    assert.equal(initiateResponse.status, 201);
    const initiateBody = await initiateResponse.json();

    assert.equal(initiateBody.success, true);
    assert.equal(initiateBody.transaction.id, initiateBody.transactionId);
    assert.equal(initiateBody.payment.provider, "MTN_MOMO");
    assert.equal(initiateBody.payment.status, "PENDING");
    assert.match(initiateBody.payment.ussdPrompt, /MTN MoMo/i);

    const initiateCall = providerRequests.find((entry) => entry.type === "initiate");
    assert.ok(initiateCall);
    assert.equal(initiateCall.payload.payer.partyId, testUser.phone);

    const pollResponse = await client.request(`/api/payments/status/${initiateBody.transactionId}`);
    assert.equal(pollResponse.status, 200);
    const pollBody = await pollResponse.json();

    assert.equal(pollBody.success, true);
    assert.equal(pollBody.transaction.id, initiateBody.transactionId);
    assert.equal(pollBody.transaction.status, "CONFIRMED");
    assert.equal(pollBody.transaction.providerStatus, "SUCCESSFUL");

    const storedTransaction = await prisma.transaction.findUnique({
      where: { id: BigInt(initiateBody.transactionId) },
    });
    assert.equal(storedTransaction.status, "CONFIRMED");
    assert.equal(storedTransaction.provider, "MTN_MOMO");
  });

  it("submits an expert application with multipart file upload", async () => {
    const client = await loginAsSeededUser();

    const form = new FormData();
    form.set("providerType", "ENGINEER");
    form.set("profession", "Structural Engineer");
    form.set("companyName", "Integration Test Consulting");
    form.set("businessName", "Integration Test Consulting");
    form.set("bio", "Integration test profile for expert onboarding.");
    form.set("licenseNumber", "LIC-INT-001");
    form.set("specialties", "structural design, site supervision");
    form.append(
      "verificationDoc",
      new Blob(["integration test pdf"], { type: "application/pdf" }),
      "verification.pdf",
    );

    const applyResponse = await client.request("/api/experts/apply", {
      method: "POST",
      headers: {
        "x-csrf-token": client.csrfToken,
      },
      body: form,
    });

    assert.equal(applyResponse.status, 201);
    const applyBody = await applyResponse.json();

    assert.equal(applyBody.success, true);
    assert.equal(applyBody.expert.userId, testUser.id);
    assert.equal(applyBody.expert.verificationStatus, "PENDING");
    assert.equal(applyBody.profile.profession, "Structural Engineer");
    assert.ok(applyBody.verificationDocument?.url?.startsWith("/uploads/"));

    const dbUser = await prisma.user.findUnique({
      where: { id: BigInt(testUser.id) },
      include: {
        profile: true,
        providerProfile: true,
      },
    });

    assert.equal(dbUser.verificationStatus, "PENDING");
    assert.equal(dbUser.providerProfile.verificationStatus, "PENDING");
    assert.equal(dbUser.profile.avatarUrl, null);

    const storedVerificationDoc = await prisma.upload.findFirst({
      where: {
        uploadedById: BigInt(testUser.id),
        entityType: "PROFILE",
        filename: { startsWith: "verificationDoc-" },
      },
      orderBy: { createdAt: "desc" },
    });

    assert.ok(storedVerificationDoc);
    assert.equal(storedVerificationDoc.url, applyBody.verificationDocument.url);

    const savedUploadPath = path.join(process.cwd(), storedVerificationDoc.url.replace(/^\//, ""));
    await access(savedUploadPath);
    createdUploadPaths.add(savedUploadPath);
  });
});
