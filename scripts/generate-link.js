#!/usr/bin/env node
// Mints a signed, time-limited, single-use activation link for the portfolio's
// access-gated pages. Run locally: node scripts/generate-link.js --days 14
//
// Requires ACCESS_TOKEN_SECRET and SITE_URL in a local .env file. ACCESS_TOKEN_SECRET
// must match the value set in the Netlify dashboard (Site settings > Environment
// variables) exactly, since the edge functions verify tokens with that same secret.

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function loadEnv(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;
  const content = fs.readFileSync(filePath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function base64url(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function parseArgs(argv) {
  let days = 14;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--days') {
      const next = Number(argv[i + 1]);
      if (!Number.isFinite(next) || next < 0) {
        console.error('--days must be a non-negative number');
        process.exit(1);
      }
      days = next;
      i++;
    }
  }
  return { days };
}

function main() {
  const { days } = parseArgs(process.argv.slice(2));
  const env = loadEnv(path.join(__dirname, '..', '.env'));
  const secret = env.ACCESS_TOKEN_SECRET;
  const siteUrl = env.SITE_URL;

  if (!secret) {
    console.error(
      'Missing ACCESS_TOKEN_SECRET in .env.\n' +
      'Generate one (e.g. `openssl rand -hex 32`) and set the SAME value in .env locally\n' +
      'and in the Netlify dashboard under Site settings > Environment variables.'
    );
    process.exit(1);
  }
  if (!siteUrl) {
    console.error('Missing SITE_URL in .env (e.g. https://ernst.works).');
    process.exit(1);
  }

  const exp = Math.floor(Date.now() / 1000) + days * 86400;
  const jti = crypto.randomBytes(16).toString('hex');
  const payload = { v: 1, jti, exp, typ: 'activation' };
  const payloadB64 = base64url(Buffer.from(JSON.stringify(payload), 'utf8'));
  const signature = base64url(crypto.createHmac('sha256', secret).update(payloadB64).digest());
  const token = `${payloadB64}.${signature}`;

  const url = `${siteUrl.replace(/\/+$/, '')}/activate/${token}`;

  console.log(`Access link (expires in ${days} day${days === 1 ? '' : 's'}, ${new Date(exp * 1000).toISOString()}):`);
  console.log(url);
}

main();
