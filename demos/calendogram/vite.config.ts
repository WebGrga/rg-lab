// Builds the Calendogram lab demo: the real frontend with src/api.ts swapped for a local stub.
// Run from the Calendogram repo root: npx vite build --config lab-demo/vite.config.ts
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const here = import.meta.dirname;
const realApi = resolve(here, '../src/api.ts').split(String.fromCharCode(92)).join('/');

export default defineConfig({
  root: here,
  base: '/calendogram/app/',
  publicDir: false,
  plugins: [
    react(),
    {
      name: 'demo-api',
      enforce: 'pre',
      async resolveId(source, importer, options) {
        if (!importer || !source.includes('api')) return null;
        const r = await this.resolve(source, importer, { ...options, skipSelf: true });
        if (r && r.id.split(String.fromCharCode(92)).join('/') === realApi) return resolve(here, 'api.ts');
        return null;
      },
      // The app links its logo at the site root; the demo lives under /calendogram/app/.
      transform(code, id) {
        if (!id.split(String.fromCharCode(92)).join('/').includes('/src/')) return null;
        return code.includes('"/icon.svg"') ? code.replaceAll('"/icon.svg"', '"/calendogram/app/icon.svg"') : null;
      },
    },
  ],
  build: { outDir: process.env.DEMO_OUT ?? resolve(here, 'dist'), emptyOutDir: true },
});
