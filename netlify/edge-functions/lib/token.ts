// Shared signing/verification helpers for the access-link edge functions.
// Deno runtime (Netlify Edge Functions) — uses Web Crypto, no external deps.

export const COOKIE_NAME = "__stf_session";

export type TokenType = "activation" | "session";

export interface TokenPayload {
  v: number;
  jti: string;
  exp: number;
  typ: TokenType;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): Uint8Array {
  const normalized = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  const binary = atob(normalized + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function signPayload(payload: TokenPayload, secret: string): Promise<string> {
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await hmacKey(secret);
  const sigBytes = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadB64)),
  );
  return `${payloadB64}.${base64UrlEncode(sigBytes)}`;
}

export async function verifyToken(
  token: string,
  expectedTyp: TokenType,
  secret: string,
): Promise<TokenPayload | null> {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, sigB64] = parts;

  let sigBytes: Uint8Array;
  try {
    sigBytes = base64UrlDecode(sigB64);
  } catch {
    return null;
  }

  const key = await hmacKey(secret);
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    sigBytes,
    new TextEncoder().encode(payloadB64),
  );
  if (!valid) return null;

  let payload: TokenPayload;
  try {
    payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(payloadB64)));
  } catch {
    return null;
  }

  if (payload.v !== 1) return null;
  if (payload.typ !== expectedTyp) return null;
  if (typeof payload.jti !== "string" || !payload.jti) return null;
  if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) return null;

  return payload;
}

export function parseCookies(request: Request): Record<string, string> {
  const header = request.headers.get("cookie") || "";
  const cookies: Record<string, string> = {};
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const name = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (name) cookies[name] = decodeURIComponent(value);
  }
  return cookies;
}

export async function getSession(request: Request, secret: string): Promise<TokenPayload | null> {
  const cookies = parseCookies(request);
  const raw = cookies[COOKIE_NAME];
  if (!raw) return null;
  return verifyToken(raw, "session", secret);
}

export function serializeSessionCookie(token: string, exp: number): string {
  const expires = new Date(exp * 1000).toUTCString();
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${expires}`;
}

export function randomJti(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
