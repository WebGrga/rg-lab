# Calendogram lab demo (build source)

Calendogram's repository is private, so the built demo is committed in `public/calendogram/app/`.
These files rebuild it: the real frontend with `src/api.ts` swapped for `api.ts` here (no server,
no OpenAI, no sync), signed in as a demo visitor with sample data from `main.tsx`.

```powershell
# in a Calendogram checkout
Copy-Item -Recurse <rg-lab>/demos/calendogram lab-demo
npm ci
$env:DEMO_OUT = "<rg-lab>/public/calendogram/app"; npx vite build --config lab-demo/vite.config.ts
Copy-Item public/icon.svg $env:DEMO_OUT
```
