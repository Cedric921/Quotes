#!/usr/bin/env node
/**
 * Calls the old NestJS API and the new Next.js API with the same requests and
 * reports every difference in status code and JSON shape.
 *
 *   OLD_API=http://localhost:3004 NEW_API=http://localhost:3100/api \
 *   USER_EMAIL=... USER_PASSWORD=... ADMIN_EMAIL=... ADMIN_PASSWORD=... \
 *   node scripts/api/compare.mjs
 *
 * Both APIs must read the same database. The comparison is on structure
 * (keys and value types, recursively) everywhere, and on exact values for
 * the endpoints whose output is deterministic. Fields the new API removes on
 * purpose (password hashes, reset codes) are listed in EXPECTED_REMOVALS.
 */

const OLD = process.env.OLD_API?.replace(/\/$/, "");
const NEW = process.env.NEW_API?.replace(/\/$/, "");
if (!OLD || !NEW) {
  console.error("Set OLD_API and NEW_API");
  process.exit(2);
}

/** Removed from responses on purpose: they leaked secrets. */
const EXPECTED_REMOVALS = new Set(["password", "passwordResetCode", "passwordResetExpires"]);

async function call(base, method, path, { token, body } = {}) {
  const response = await fetch(base + path, {
    method,
    headers: {
      ...(body ? { "content-type": "application/json" } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { __text: text.slice(0, 80) };
  }
  return { status: response.status, json };
}

function shape(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return value.length ? [shape(value[0])] : [];
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .filter((key) => !EXPECTED_REMOVALS.has(key))
        .sort()
        .map((key) => [key, shape(value[key])]),
    );
  }
  return typeof value;
}

function diff(a, b, path = "$") {
  const out = [];
  if (JSON.stringify(a) === JSON.stringify(b)) return out;
  // An empty array or a null on one side says nothing about the other's shape.
  if ((Array.isArray(a) && a.length === 0) || (Array.isArray(b) && b.length === 0)) return out;
  if (a === "null" || b === "null") return out;
  if (typeof a !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
    out.push(`${path}: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`);
    return out;
  }
  if (Array.isArray(a)) return diff(a[0], b[0], `${path}[0]`);
  if (typeof a === "object") {
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (!(key in a)) out.push(`${path}.${key}: only in new`);
      else if (!(key in b)) out.push(`${path}.${key}: only in old`);
      else out.push(...diff(a[key], b[key], `${path}.${key}`));
    }
    return out;
  }
  out.push(`${path}: ${a} vs ${b}`);
  return out;
}

function strip(value) {
  if (Array.isArray(value)) return value.map(strip);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !EXPECTED_REMOVALS.has(key))
        .map(([key, inner]) => [key, strip(inner)]),
    );
  }
  return value;
}

async function login(base, email, password) {
  if (!email || !password) return null;
  const { status, json } = await call(base, "POST", "/auth/login", { body: { email, password } });
  if (status >= 300) throw new Error(`login ${email} on ${base}: ${status} ${JSON.stringify(json)}`);
  return json.access_token;
}

const [oldUser, newUser, oldAdmin, newAdmin] = await Promise.all([
  login(OLD, process.env.USER_EMAIL, process.env.USER_PASSWORD),
  login(NEW, process.env.USER_EMAIL, process.env.USER_PASSWORD),
  login(OLD, process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD),
  login(NEW, process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD),
]);

/** [method, path, who, exact?] — who: "anon" | "user" | "admin". */
const CHECKS = [
  ["GET", "/", "anon", true],
  ["GET", "/health/ping", "anon"],
  ["GET", "/quotes?page=1&limit=10&includePremium=false&seed=42", "anon", true],
  ["GET", "/quotes?page=2&limit=5&includePremium=true&seed=42", "user", true],
  ["GET", "/topics", "anon", true],
  ["GET", "/themes/active", "anon", true],
  ["GET", "/themes/default", "anon", true],
  ["GET", "/fonts/active", "anon", true],
  ["GET", "/fonts/default", "anon", true],
  ["GET", "/social/active", "anon", true],
  ["GET", "/subscriptions/plans?activeOnly=true", "anon", true],
  ["GET", "/subscriptions/config", "anon", true],
  ["GET", "/subscriptions/my-subscription", "user"],
  ["GET", "/subscriptions/my-subscription/history", "user"],
  ["GET", "/subscriptions/my-payments", "user"],
  ["GET", "/users/me/notification-settings", "user"],
  ["GET", "/users/me/liked-quotes", "user", true],
  ["GET", "/users/me/activity/stats", "user"],
  ["GET", "/notifications/push-tokens", "user", true],
  ["GET", "/users", "admin"],
  ["GET", "/contact", "admin"],
  ["GET", "/contact/unread-count", "admin", true],
  ["GET", "/fonts", "admin", true],
  ["GET", "/themes", "admin", true],
  ["GET", "/social", "admin", true],
  ["GET", "/subscriptions/stats", "admin"],
  ["GET", "/subscriptions/all", "admin"],
  ["GET", "/subscriptions/payments", "admin"],
  ["GET", "/subscriptions/promo-codes", "admin", true],
  ["GET", "/health/stats", "anon"],
];

const tokens = { anon: [null, null], user: [oldUser, newUser], admin: [oldAdmin, newAdmin] };
let failures = 0;

for (const [method, path, who, exact] of CHECKS) {
  const [oldToken, newToken] = tokens[who];
  if (who !== "anon" && !oldToken) {
    console.log(`skip ${method} ${path} (no ${who} credentials)`);
    continue;
  }
  const [a, b] = await Promise.all([
    call(OLD, method, path, { token: oldToken }),
    call(NEW, method, path, { token: newToken }),
  ]);
  const problems = [];
  if (a.status !== b.status) problems.push(`status ${a.status} vs ${b.status}`);
  problems.push(...diff(shape(a.json), shape(b.json)));
  if (exact && !problems.length && JSON.stringify(strip(a.json)) !== JSON.stringify(strip(b.json))) {
    problems.push("same shape, different values");
  }
  if (problems.length) {
    failures++;
    console.log(`FAIL ${method} ${path} [${who}]`);
    for (const p of problems.slice(0, 8)) console.log(`     ${p}`);
  } else {
    console.log(`ok   ${method} ${path} [${who}]`);
  }
}

console.log(failures ? `\n${failures} endpoint(s) differ` : "\nAll endpoints match");
process.exit(failures ? 1 : 0);
