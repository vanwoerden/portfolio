// Runs on every request. Blocks pages and redacts JSON fields listed in
// ./lib/access-config.ts for visitors without a valid session cookie.

import { getSession } from "./lib/token.ts";
import { matchesBlockedPath, findRedactionRule } from "./lib/access-config.ts";

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
    text-align: center;
    padding: 2rem;
  }
  .card { max-width: 26rem; }
  h1 { font-size: 1.4rem; margin-bottom: 0.75rem; }
  p { font-size: 1rem; line-height: 1.5; color: rgb(180, 178, 190); margin: 0; }
</style>
</head>
<body>
  <div class="card">
    <h1>This page requires an access link</h1>
    <p>If you were sent a link to view this page, please open that link. Otherwise, get in touch to request access.</p>
  </div>
</body>
</html>`;
  return new Response(html, {
    status: 403,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

// deno-lint-ignore no-explicit-any
function deleteMatchingItems(obj: any, arrayPath: string[], matchField: string, matchValues: string[]) {
  let target = obj;
  for (let i = 0; i < arrayPath.length - 1; i++) {
    target = target?.[arrayPath[i]];
    if (target == null) return;
  }
  const key = arrayPath[arrayPath.length - 1];
  const arr = target?.[key];
  if (!Array.isArray(arr)) return;
  // deno-lint-ignore no-explicit-any
  target[key] = arr.filter((item: any) => !matchValues.includes(item?.[matchField]));
}

export default async (request: Request, context: { next: () => Promise<Response> }) => {
  const secret = Netlify.env.get("ACCESS_TOKEN_SECRET");
  const url = new URL(request.url);

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

  const rule = findRedactionRule(url.pathname);
  if (rule) {
    if (session) return context.next();

    const response = await context.next();
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("json")) return response;

    try {
      const data = await response.json();
      deleteMatchingItems(data, rule.arrayPath, rule.matchField, rule.matchValues);
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
