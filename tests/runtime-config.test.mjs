import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  ADMIN_SESSION_STORAGE_KEY,
  DEFAULT_DEVELOPMENT_API_BASE_URL,
  normalizeApiBaseUrl,
  parseDateOnlyLocal,
  resolveApiBaseUrl,
} from "../src/lib/runtime-config.js";

test("API base URL normalization removes every trailing slash", () => {
  assert.equal(
    normalizeApiBaseUrl("https://api.example.com/api///"),
    "https://api.example.com/api"
  );
});

test("development has a localhost fallback but production fails closed", () => {
  assert.equal(
    resolveApiBaseUrl(undefined, true),
    DEFAULT_DEVELOPMENT_API_BASE_URL
  );
  assert.throws(
    () => resolveApiBaseUrl(undefined, false),
    /VITE_API_BASE_URL is required/
  );
});

test("production API configuration requires HTTPS", () => {
  assert.throws(
    () => resolveApiBaseUrl("http://api.example.com/api", false),
    /must use HTTPS/
  );
  assert.equal(
    resolveApiBaseUrl("https://api.example.com/api/", false),
    "https://api.example.com/api"
  );
});

test("date-only parsing preserves calendar fields in local time", () => {
  const parsedDate = parseDateOnlyLocal("2026-07-28");
  assert.equal(parsedDate.getFullYear(), 2026);
  assert.equal(parsedDate.getMonth(), 6);
  assert.equal(parsedDate.getDate(), 28);
  assert.throws(() => parseDateOnlyLocal("2026-02-30"), /valid calendar date/);
});

test("admin storage is namespaced away from customer token keys", () => {
  assert.match(ADMIN_SESSION_STORAGE_KEY, /^bbh_admin_/);
  assert.notEqual(ADMIN_SESSION_STORAGE_KEY, "access");
  assert.notEqual(ADMIN_SESSION_STORAGE_KEY, "refresh");
});

test("Vercel deployment retains SPA routing and required security headers", async () => {
  const vercelConfig = JSON.parse(
    await readFile(new URL("../vercel.json", import.meta.url), "utf8")
  );
  assert.deepEqual(vercelConfig.rewrites[0], {
    source: "/(.*)",
    destination: "/index.html",
  });

  const headers = Object.fromEntries(
    vercelConfig.headers[0].headers.map(({ key, value }) => [key, value])
  );
  assert.match(headers["Content-Security-Policy"], /frame-ancestors 'none'/);
  assert.equal(headers["X-Content-Type-Options"], "nosniff");
  assert.match(headers["X-Robots-Tag"], /noindex/);
});
