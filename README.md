# RG Lab

Public AI engineering showcase and same-domain path router for Roko Grga's experiments. The three primary projects are Frontend Director, BTC–Jev, and Problem Hunter; Jev Board Lab remains a secondary experiment.

Live: **https://lab.rokogrga.com**

RG Lab deliberately does not contain the implementation of its listed projects (it only holds small browser demos that run on sample data, listed below). Each project keeps its frontend, backend, tests, and deployment configuration in its own repository. This repository owns only the project index and the stable public routes beneath `lab.rokogrga.com`.

## Current routes

| Public route | Project repository | Runtime |
| --- | --- | --- |
| `/btc-jev` | `WebGrga/btc-jev-signal` | Netlify frontend, Cloudflare Worker API, Cloudflare D1 |
| `/jev-board/` | `WebGrga/jev-board-lab` | Netlify frontend, optional Cloudflare Worker API |
| `/localens/` | `WebGrga/localens` | Project page; `/localens/demo/` is a static snapshot of the app's report on fictional fixture data |
| `/gamefinder/` | `WebGrga/gamefinder` | Project page with the scoring rules ported to the browser, fictional sample games |
| `/calendogram/` | `WebGrga/Calendogram` (private) | Project page; `/calendogram/app/` is the real frontend built with a local stub instead of the server (`demos/calendogram/`), sample data in IndexedDB |
| `/momentum-lab/` | `WebGrga/momentum-lab` | Project page; `/momentum-lab/app/` proxies the app's GitHub Pages build (sample data, localStorage only) |

## Demo rules

- Every demo runs on stored or sample data. No API key reaches the browser and no route can run up a bill.
- Each project page has a video slot that plays `/<project>/video.mp4` once that file exists (put it in `public/<project>/`).
- The Content-Security-Policy is set per path in `public/_headers`, never on `/*`: Netlify merges all matching rules, so two policies would both apply. Only the two demo snapshots allow inline styles and handlers.

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

The hub links to each implementation without running model requests. BTC–Jev's dashboard remains at `/btc-jev`; archived direction forecasts are not displayed as current hub activity. Frontend Director and Problem Hunter link to their public code and documented prototype limits.

