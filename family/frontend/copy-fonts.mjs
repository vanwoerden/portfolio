import { cpSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const out = new URL('../web/static/fonts/', import.meta.url).pathname;
mkdirSync(out, { recursive: true });
const want = /^(IBMPlexSans-(Light|Regular|SemiBold)|IBMPlexMono-Regular)-Latin[13]\.woff2$/;
for (const pkg of ['plex-sans', 'plex-mono']) {
  const dir = join('node_modules/@ibm', pkg, 'fonts/split/woff2');
  for (const f of readdirSync(dir).filter((f) => want.test(f))) cpSync(join(dir, f), join(out, f));
}
console.log('fonts copied to', out);
