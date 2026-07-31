// Handles /activate/<token>: redeems a one-time activation token, marks it used
// in Netlify Blobs so it can't be redeemed twice, sets a signed session cookie,
// and redirects to "/" so the token never lingers in the address bar.

import { verifyToken, randomJti, signPayload, serializeSessionCookie } from "./lib/token.ts";
import { getStore } from "@netlify/blobs";

declare const Netlify: { env: { get(key: string): string | undefined } };

function message(body: string, status: number): Response {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Access link</title>
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
  p { max-width: 26rem; font-size: 1rem; line-height: 1.5; }
</style>
</head>
<body><p>${body}</p></body>
</html>`;
  return new Response(html, { status, headers: { "content-type": "text/html; charset=utf-8" } });
}

export default async (request: Request) => {
  const secret = Netlify.env.get("ACCESS_TOKEN_SECRET");
  if (!secret) return message("Access link system is not configured.", 500);

  const url = new URL(request.url);
  const token = url.pathname.replace(/^\/activate\//, "");
  if (!token) return message("Missing access token.", 400);

  const payload = await verifyToken(token, "activation", secret);
  if (!payload) return message("This link is invalid or has expired.", 403);

  const store = getStore("access-tokens");
  const key = `jti:${payload.jti}`;

  // @netlify/blobs@7 has no atomic "set if not exists" primitive, so this is a
  // plain read-then-write. A narrow race on near-simultaneous first use is an
  // accepted risk given the realistic odds for a single hiring-manager link.
  const existing = await store.get(key, { type: "json" });
  if (existing) return message("This link has already been used.", 403);

  await store.setJSON(key, { usedAt: new Date().toISOString(), exp: payload.exp });

  const sessionToken = await signPayload(
    { v: 1, jti: randomJti(), exp: payload.exp, typ: "session" },
    secret,
  );

  return new Response(null, {
    status: 302,
    headers: {
      "Location": "/",
      "Set-Cookie": serializeSessionCookie(sessionToken, payload.exp),
    },
  });
};
