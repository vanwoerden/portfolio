// Receives the pre-rendered family pages from the Mac and stores them in Netlify Blobs.
// POST /family-ingest with `Authorization: Bearer $FAMILY_INGEST_SECRET`.
// Private data only ever travels through here; it is never committed to git.

import { getStore } from "@netlify/blobs";

declare const Netlify: { env: { get(key: string): string | undefined } };

const MAX_BYTES = 6_000_000;
const MAX_PAGES = 400;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const PAGE_KEY = /^((today|week)\/\d{4}-\d{2}-\d{2}|projects|project\/[A-Za-z0-9]+)$/;

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

// Compare fixed-length digests so the comparison time does not leak the secret.
async function safeEqual(a: string, b: string): Promise<boolean> {
  const enc = new TextEncoder();
  const [da, db] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(a)),
    crypto.subtle.digest("SHA-256", enc.encode(b)),
  ]);
  const x = new Uint8Array(da), y = new Uint8Array(db);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

// deno-lint-ignore no-explicit-any
function validBundle(b: any): boolean {
  if (!b || typeof b.generated_at !== "string") return false;
  if (!Array.isArray(b.dates) || b.dates.length === 0 || b.dates.length > 60) return false;
  if (!b.dates.every((d: unknown) => typeof d === "string" && DATE.test(d))) return false;
  if (!b.pages || typeof b.pages !== "object") return false;
  const keys = Object.keys(b.pages);
  if (keys.length === 0 || keys.length > MAX_PAGES) return false;
  return keys.every((k) => PAGE_KEY.test(k) && typeof b.pages[k] === "string");
}

export default async (request: Request) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: { allow: "POST" } });
  }

  const secret = Netlify.env.get("FAMILY_INGEST_SECRET");
  if (!secret) return json({ error: "not configured" }, 500);

  const auth = request.headers.get("authorization") ?? "";
  if (!(await safeEqual(auth, `Bearer ${secret}`))) return json({ error: "unauthorized" }, 401);

  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BYTES) return json({ error: "too large" }, 413);
  const text = await request.text();
  if (text.length > MAX_BYTES) return json({ error: "too large" }, 413);

  let bundle;
  try {
    bundle = JSON.parse(text);
  } catch {
    return json({ error: "invalid json" }, 400);
  }
  if (!validBundle(bundle)) return json({ error: "invalid bundle" }, 400);

  await getStore("family").setJSON("bundle", bundle);
  return json({ ok: true, pages: Object.keys(bundle.pages).length }, 200);
};
