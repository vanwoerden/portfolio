// Serves ernst.works/family: a token-gated, pre-rendered copy of the family task app.
//
// - /family/activate/<token>  exchanges the shared link for a long-lived cookie
// - /family/today|week|projects|projects/<id>  serve pages from Netlify Blobs
// - /family/web/static/*  (CSS and fonts only, no data) passes through from the deploy
// - every other /family/* path is 404, so the app's source files in the repo are not served
//
// The pages are uploaded by the Mac (see family-ingest.ts) and are never in git.

import { getStore } from "@netlify/blobs";
import {
  getFamilySession,
  mintFamilySessionToken,
  serializeFamilyCookie,
  verifyToken,
} from "./lib/token.ts";

declare const Netlify: { env: { get(key: string): string | undefined } };

interface Bundle {
  generated_at: string;
  dates: string[]; // ascending ISO dates the today/week pages were rendered for
  pages: Record<string, string>;
}

const DEFAULT_TZ = "America/New_York";
const CACHE_MS = 20_000;
let cache: { at: number; bundle: Bundle | null } | null = null;

const BASE_STYLE = `
  html, body { margin: 0; height: 100%; }
  body { display: flex; align-items: center; justify-content: center; background: rgb(9, 8, 21);
    color: rgb(243, 242, 235); font-family: "Kumbh Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 2rem; }
  .card { max-width: 26rem; }
  h1 { font-size: 1.4rem; margin: 0 0 0.75rem; }
  p { font-size: 1rem; line-height: 1.5; color: rgb(180, 178, 190); margin: 0; }`;

function messagePage(title: string, body: string, status: number): Response {
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow"><title>${title}</title><style>${BASE_STYLE}</style></head>
<body><div class="card"><h1>${title}</h1><p>${body}</p></div></body></html>`;
  return new Response(html, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "private, no-store",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}

// 401, not 403: `netlify dev` replaces 403 responses from edge functions with a 404 lookup.
const locked = () =>
  messagePage("This page requires an access link", "Open the family link you were sent to view this page.", 401);
const notFound = () => messagePage("Not found", "There is nothing at this address.", 404);

// ISO date (YYYY-MM-DD) of "now" in the viewer's timezone.
function viewerDate(tz: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" })
      .format(new Date());
  } catch {
    return viewerDate(DEFAULT_TZ);
  }
}

// Latest pre-rendered date that is not after the viewer's date, else the earliest.
function pickDate(dates: string[], wanted: string): string | null {
  if (!dates.length) return null;
  let best = dates[0];
  for (const d of dates) if (d <= wanted) best = d;
  return best;
}

async function loadBundle(): Promise<Bundle | null> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.bundle;
  const bundle = (await getStore("family").get("bundle", { type: "json" })) as Bundle | null;
  cache = { at: Date.now(), bundle };
  return bundle;
}

export default async (
  request: Request,
  context: { next: () => Promise<Response>; geo?: { timezone?: string } },
) => {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "") || "/";

  // Public, data-free assets (carbon.css, fonts).
  if (path.startsWith("/family/web/static/")) return context.next();

  const secret = Netlify.env.get("FAMILY_TOKEN_SECRET");
  if (!secret) return messagePage("Not configured", "The family area is not configured yet.", 500);

  if (path === "/family") return Response.redirect(new URL("/family/today", url), 302);

  if (path.startsWith("/family/activate/")) {
    const token = path.slice("/family/activate/".length);
    const payload = token ? await verifyToken(token, "family-link", secret) : null;
    if (!payload) return messagePage("This link is not valid", "Ask for a new family link.", 403);
    const cookie = serializeFamilyCookie(await mintFamilySessionToken(secret));
    return new Response(null, {
      status: 302,
      headers: { location: "/family/today", "set-cookie": cookie, "cache-control": "private, no-store" },
    });
  }

  // Map the URL to a page: today/week are chosen by the viewer's date below,
  // projects pages have a fixed key.
  let kind: "today" | "week" | "fixed";
  let fixedKey = "";
  if (path === "/family/today") {
    kind = "today";
  } else if (path === "/family/week") {
    kind = "week";
  } else if (path === "/family/projects") {
    kind = "fixed";
    fixedKey = "projects";
  } else if (/^\/family\/projects\/[A-Za-z0-9]+$/.test(path)) {
    kind = "fixed";
    fixedKey = "project/" + path.split("/").pop();
  } else {
    return notFound();
  }

  if (!(await getFamilySession(request, secret))) return locked();

  const bundle = await loadBundle();
  if (!bundle) return messagePage("No data yet", "The first sync from the Mac has not arrived yet.", 503);

  let key = fixedKey;
  if (kind !== "fixed") {
    const tz = context.geo?.timezone || Netlify.env.get("FAMILY_TZ") || DEFAULT_TZ;
    const date = pickDate(bundle.dates, viewerDate(tz));
    if (!date) return messagePage("No data yet", "The first sync from the Mac has not arrived yet.", 503);
    key = `${kind}/${date}`;
  }

  const html = bundle.pages[key];
  if (!html) return notFound();

  // Sliding renewal: every visit pushes the cookie's expiry another ~10 years out.
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "private, no-store",
      "x-robots-tag": "noindex, nofollow",
      "set-cookie": serializeFamilyCookie(await mintFamilySessionToken(secret)),
    },
  });
};
