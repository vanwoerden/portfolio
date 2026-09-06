// Runs on every request. Blocks pages and redacts JSON fields listed in
// ./lib/access-config.ts for visitors without a valid session cookie.

import { getSession } from "./lib/token.ts";
import { matchesBlockedPath, findMetricGateRule, type MetricGateRule } from "./lib/access-config.ts";
import { isUnpublishedPrinciplePath } from "./lib/principles.ts";

declare const Netlify: { env: { get(key: string): string | undefined } };

function lockedPageResponse(): Response {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Access required</title>
<style>
  html, body { margin: 0; height: 100%; }
  body {
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgb(9, 8, 21);
    color: rgb(243, 242, 235);
    font-family: "Kumbh Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    text-align: left;
    padding: 2rem;
  }
  .card { max-width: 26rem; }
  h1 { font-size: 1.4rem; margin-bottom: 0.75rem; }
  p { font-size: 1rem; line-height: 1.5; color: rgb(180, 178, 190); margin: 0; }
  .back-link {
    display: inline-block;
    margin-top: 1.5rem;
    padding: 0.6rem 1.2rem;
    border: 1px solid rgba(243, 242, 235, 0.3);
    border-radius: 999px;
    color: inherit;
    text-decoration: none;
    font-size: 0.9rem;
  }
  .back-link:hover { border-color: rgba(243, 242, 235, 0.6); }
</style>
</head>
<body>
  <div class="card">
    <h1>This page requires an access link</h1>
    <p>If you were sent a link to view this page, please open that link. Otherwise, <a href="mailto:e.vanwoerden@gmail.com" style="color: inherit;">get in touch</a> to request access.</p>
    <a class="back-link" href="/">Back to ernst.works</a>
  </div>
</body>
</html>`;
  return new Response(html, {
    status: 403,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

// deno-lint-ignore no-explicit-any
function applyMetricGateRule(obj: any, rule: MetricGateRule) {
  let target = obj;
  for (let i = 0; i < rule.arrayPath.length - 1; i++) {
    target = target?.[rule.arrayPath[i]];
    if (target == null) return;
  }
  const key = rule.arrayPath[rule.arrayPath.length - 1];
  const arr = target?.[key];
  if (!Array.isArray(arr)) return;

  const remove = rule.remove || [];
  const blur = rule.blur || {};

  // deno-lint-ignore no-explicit-any
  target[key] = arr
    .filter((item: any) => !remove.includes(item?.[rule.matchField]))
    // deno-lint-ignore no-explicit-any
    .map((item: any) => {
      const fake = blur[item?.[rule.matchField]];
      if (!fake) return item;
      return {
        id: item.id,
        label: item.label,
        absolute: { number: fake.number, string: fake.string },
        relative: { number: null, string: null },
        visible: "absolute",
        visualization: item.visualization,
        description: null,
        blurred: true,
        ...(fake.series ? { series: fake.series } : {}),
        ...(fake.revealSuffix ? { revealSuffix: fake.revealSuffix } : {}),
      };
    });
}

export default async (request: Request, context: { next: () => Promise<Response> }) => {
  const secret = Netlify.env.get("ACCESS_TOKEN_SECRET");
  const url = new URL(request.url);

  // Draft principles: hard-redirect on deploy (keep in sync with on/principles/principles.json)
  if (isUnpublishedPrinciplePath(url.pathname)) {
    return Response.redirect(new URL("/", url), 302);
  }

  if (!secret) {
    // Fail closed on blocked pages even if misconfigured; leave everything else alone.
    if (matchesBlockedPath(url.pathname)) return lockedPageResponse();
    return context.next();
  }

  const session = await getSession(request, secret);

  if (matchesBlockedPath(url.pathname)) {
    if (session) return context.next();
    return lockedPageResponse();
  }

  const rule = findMetricGateRule(url.pathname);
  if (rule) {
    if (session) return context.next();

    const response = await context.next();
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("json")) return response;

    try {
      const data = await response.json();
      applyMetricGateRule(data, rule);
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    } catch {
      return response;
    }
  }

  return context.next();
};
