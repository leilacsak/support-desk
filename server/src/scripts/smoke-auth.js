// Reusable, self-contained smoke test. Starts the real app in-process on an
// ephemeral port, drives it with real HTTP requests, and tears everything
// down in `finally`. Assumes the DB has already been seeded (npm run seed).

import { buildApp } from "../app.js";
import { closePool } from "../db.js";
import { DEMO_PASSWORD } from "../constants/index.js";

const SEED = {
  alice: {
    email: "alice@example.com",
    ticketId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    subject: "Cannot log in to my account",
    openCount: 1,
  },
  bob: {
    email: "bob@example.com",
    ticketId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    subject: "Billing charge looks incorrect",
    openCount: 0,
  },
  carol: {
    email: "carol@example.com",
    ticketId: "cccccccc-cccc-cccc-cccc-cccccccccccc",
    subject: "How do I export my data?",
    openCount: 1,
  },
  dev: {
    email: "dev@supportdesk.local",
  },
};

const NONEXISTENT_TICKET_ID = "00000000-0000-0000-0000-000000000000";

let BASE_URL;

function uniqueEmail() {
  return `smoke-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertDeepEqual(actual, expected, label) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`${label}: expected ${e}, got ${a}`);
  }
}

async function request(method, path, { token, body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { status: res.status, json };
}

async function loginAs(email, password = DEMO_PASSWORD) {
  const { status, json } = await request("POST", "/auth/login", { body: { email, password } });
  if (status !== 200) throw new Error(`login as ${email} failed with status ${status}`);
  return json.token;
}

let passed = 0;
let failed = 0;

async function check(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`PASS - ${name}`);
  } catch (err) {
    failed++;
    console.log(`FAIL - ${name}: ${err.message}`);
  }
}

async function run() {
  // --- Public endpoints ---
  await check("GET /health returns 200 ok", async () => {
    const { status, json } = await request("GET", "/health");
    assertEqual(status, 200, "status");
    assertEqual(json?.status, "ok", "body.status");
  });

  await check("GET /ready returns 200 ready", async () => {
    const { status, json } = await request("GET", "/ready");
    assertEqual(status, 200, "status");
    assertEqual(json?.status, "ready", "body.status");
  });

  // --- Registration ---
  await check("register with a unique email returns 201 with token, no password_hash, null last_login_at", async () => {
    const { status, json } = await request("POST", "/auth/register", {
      body: { email: uniqueEmail(), name: "Smoke Test", password: DEMO_PASSWORD },
    });
    assertEqual(status, 201, "status");
    if (typeof json?.token !== "string" || !json.token) throw new Error("expected a token string");
    if (!json?.user) throw new Error("expected a user object");
    if ("password_hash" in json.user) throw new Error("user response must not include password_hash");
    assertEqual(json.user.last_login_at, null, "user.last_login_at");
  });

  await check("register with a weak password returns 400", async () => {
    const { status } = await request("POST", "/auth/register", {
      body: { email: uniqueEmail(), name: "Weak Password", password: "short" },
    });
    assertEqual(status, 400, "status");
  });

  await check("register with a duplicate email returns 409", async () => {
    const { status } = await request("POST", "/auth/register", {
      body: { email: SEED.alice.email, name: "Duplicate", password: DEMO_PASSWORD },
    });
    assertEqual(status, 409, "status");
  });

  // --- Login ---
  await check("login with correct credentials returns 200 with token, no password_hash", async () => {
    const { status, json } = await request("POST", "/auth/login", {
      body: { email: SEED.alice.email, password: DEMO_PASSWORD },
    });
    assertEqual(status, 200, "status");
    if (typeof json?.token !== "string" || !json.token) throw new Error("expected a token string");
    if (!json?.user) throw new Error("expected a user object");
    if ("password_hash" in json.user) throw new Error("user response must not include password_hash");
  });

  await check("login with wrong password and unknown email return identical 401 errors", async () => {
    const wrongPassword = await request("POST", "/auth/login", {
      body: { email: SEED.alice.email, password: "definitely-wrong-password" },
    });
    const unknownEmail = await request("POST", "/auth/login", {
      body: { email: uniqueEmail(), password: DEMO_PASSWORD },
    });
    assertEqual(wrongPassword.status, 401, "wrong password status");
    assertEqual(unknownEmail.status, 401, "unknown email status");
    // Must be indistinguishable - otherwise a caller could tell which emails are registered.
    assertDeepEqual(wrongPassword.json, unknownEmail.json, "error body");
  });

  // --- Authentication ---
  await check("GET /tickets without a token returns 401", async () => {
    const { status } = await request("GET", "/tickets");
    assertEqual(status, 401, "status");
  });

  await check("GET /tickets with an invalid token returns 401", async () => {
    const { status } = await request("GET", "/tickets", { token: "not-a-real-jwt" });
    assertEqual(status, 401, "status");
  });

  const aliceToken = await loginAs(SEED.alice.email);
  await check("GET /auth/me with a valid token returns the matching user", async () => {
    const { status, json } = await request("GET", "/auth/me", { token: aliceToken });
    assertEqual(status, 200, "status");
    assertEqual(json?.user?.email, SEED.alice.email, "body.user.email");
  });

  // --- Exact user-scoped ticket subjects and counts ---
  const bobToken = await loginAs(SEED.bob.email);
  const carolToken = await loginAs(SEED.carol.email);
  const devToken = await loginAs(SEED.dev.email);

  for (const [name, token] of [
    ["alice", aliceToken],
    ["bob", bobToken],
    ["carol", carolToken],
  ]) {
    const seed = SEED[name];
    await check(`${name}'s ticket list contains exactly one ticket with the right subject`, async () => {
      const { status, json } = await request("GET", "/tickets", { token });
      assertEqual(status, 200, "status");
      assertEqual(json.length, 1, "ticket count");
      assertEqual(json[0].id, seed.ticketId, "ticket id");
      assertEqual(json[0].subject, seed.subject, "ticket subject");
    });

    await check(`${name}'s open ticket count is exact`, async () => {
      const { status, json } = await request("GET", "/tickets/count", { token });
      assertEqual(status, 200, "status");
      assertEqual(json?.count, seed.openCount, "count");
    });
  }

  // --- Inaccessible vs nonexistent tickets: matching 404s, never 403 ---
  await check("another user's ticket and a nonexistent ticket both return matching 404 errors, never 403", async () => {
    const inaccessible = await request("GET", `/tickets/${SEED.bob.ticketId}`, { token: aliceToken });
    const nonexistent = await request("GET", `/tickets/${NONEXISTENT_TICKET_ID}`, { token: aliceToken });

    if (inaccessible.status === 403 || nonexistent.status === 403) {
      throw new Error("must never return 403 - it would leak whether the id exists");
    }
    assertEqual(inaccessible.status, 404, "inaccessible status");
    assertEqual(nonexistent.status, 404, "nonexistent status");
    assertEqual(inaccessible.json?.error?.code, "NOT_FOUND", "inaccessible error.code");
    assertEqual(nonexistent.json?.error?.code, "NOT_FOUND", "nonexistent error.code");
  });

  // --- Assignee visibility and rejection of unrelated tickets ---
  await check("dev (assignee) sees exactly the two tickets assigned to them", async () => {
    const { status, json } = await request("GET", "/tickets", { token: devToken });
    assertEqual(status, 200, "status");
    const ids = json.map((t) => t.id).sort();
    assertDeepEqual(ids, [SEED.alice.ticketId, SEED.bob.ticketId].sort(), "dev's visible ticket ids");
  });

  await check("dev can fetch both assigned tickets by id, but not carol's unrelated ticket", async () => {
    const assignedA = await request("GET", `/tickets/${SEED.alice.ticketId}`, { token: devToken });
    const assignedB = await request("GET", `/tickets/${SEED.bob.ticketId}`, { token: devToken });
    const unrelated = await request("GET", `/tickets/${SEED.carol.ticketId}`, { token: devToken });
    assertEqual(assignedA.status, 200, "assigned ticket A status");
    assertEqual(assignedB.status, 200, "assigned ticket B status");
    assertEqual(unrelated.status, 404, "unrelated ticket status");
  });

  // --- ?userId= spoofing must not change the authenticated user's results ---
  await check("a ?userId= query param does not change which tickets alice sees", async () => {
    const plain = await request("GET", "/tickets", { token: aliceToken });
    const spoofed = await request("GET", "/tickets?userId=spoofed-identity", { token: aliceToken });
    assertEqual(spoofed.status, 200, "status");
    assertDeepEqual(spoofed.json, plain.json, "response body");
  });

  await check("a ?userId= query param does not grant access to another user's ticket", async () => {
    const { status } = await request("GET", `/tickets/${SEED.bob.ticketId}?userId=spoofed-identity`, {
      token: aliceToken,
    });
    assertEqual(status, 404, "status");
  });
}

async function main() {
  const app = buildApp();
  const server = app.listen(0);
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  BASE_URL = `http://localhost:${server.address().port}/api`;

  try {
    await run();
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await closePool();
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Smoke test run failed unexpectedly:", err);
  process.exit(1);
});
