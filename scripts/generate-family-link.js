#!/usr/bin/env node
// Prints the shared, reusable link for ernst.works/family.
//   node scripts/generate-family-link.js
//
// Opening the link sets a long-lived cookie (renewed on every visit), so it only needs
// to be opened once per device. The link itself does not expire or get used up.
// To revoke everyone, change FAMILY_TOKEN_SECRET (in .env and in the Netlify dashboard)
// and run this again to get a new link.

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function loadEnv(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[trimmed.slice(0, idx).trim()] = value;
  }
  return env;
}

function base64url(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const env = loadEnv(path.join(__dirname, '..', '.env'));
const secret = env.FAMILY_TOKEN_SECRET;
const siteUrl = env.SITE_URL;

if (!secret) {
  console.error(
    'Missing FAMILY_TOKEN_SECRET in .env.\n' +
    'Generate one (`openssl rand -hex 32`) and set the SAME value in .env locally\n' +
    'and in the Netlify dashboard under Site configuration > Environment variables.'
  );
  process.exit(1);
}
if (!siteUrl) {
  console.error('Missing SITE_URL in .env (e.g. https://ernst.works).');
  process.exit(1);
}

// Far-future expiry (year 2100): the link never lapses on its own.
const exp = 4102444800;
const payload = { v: 1, jti: crypto.randomBytes(16).toString('hex'), exp, typ: 'family-link' };
const payloadB64 = base64url(Buffer.from(JSON.stringify(payload), 'utf8'));
const signature = base64url(crypto.createHmac('sha256', secret).update(payloadB64).digest());

console.log('Family link (reusable, does not expire):');
console.log(`${siteUrl.replace(/\/+$/, '')}/family/activate/${payloadB64}.${signature}`);
