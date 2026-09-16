# RG Lab

Public index and same-domain path router for Roko Grga's independent software experiments.

Live: **https://lab.rokogrga.com**

RG Lab deliberately does not contain the implementation of its listed projects. Each project keeps its frontend, backend, tests, and deployment configuration in its own repository. This repository owns only the project index and the stable public routes beneath `lab.rokogrga.com`.

## Current routes

| Public route | Project repository | Runtime |
| --- | --- | --- |
| `/btc-jev` | `WebGrga/btc-jev-signal` | Netlify frontend, Cloudflare Worker API, Cloudflare D1 |

## Add a project

1. Build and deploy the complete project from its own repository.
2. Add a project card to `index.html`.
3. Add a namespaced route in `netlify.toml` before the final single-page-app fallback.
4. Keep project APIs under the same project prefix, such as `/btc-jev/api/*`.
5. Verify direct navigation, static assets, API requests, and HTTPS through the canonical path.

## Local development

```powershell
npm install
npm run dev
```

The local Vite proxy exposes the production BTC–Jev read-only API at `/btc-jev/api/*` so the project card can show the latest forecast.

