import { mkdirSync, writeFileSync } from 'node:fs';

const apiBaseUrl = process.env.API_BASE_URL ?? 'http://localhost:3000';
mkdirSync('public/assets', { recursive: true });
writeFileSync(
  'public/assets/runtime-config.js',
  `globalThis.__SHOP_RUNTIME_CONFIG__ = { apiBaseUrl: ${JSON.stringify(apiBaseUrl)} };\n`
);
