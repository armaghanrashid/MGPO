# Voluntreal

Voluntreal is a bilingual Montreal-first volunteer operations prototype built for live demos and class presentations. It includes a polished launch site, transparent CAD pricing, and an interactive workspace with volunteer profiles, pipeline management, training quizzes, matching, interviews, alerts, timesheets, onboarding timelines, and incident reporting.

## Run locally

```bash
npm install
npm run dev
```

The dev server runs with `--host` enabled so it is easier to test from another device on the same network.

## Build for deployment

```bash
npm run build
npm run preview
```

## Routes

- `/` launch site
- `/pricing` pricing and plan comparison
- `/demo` admin workspace
- `/demo/volunteer/:id` volunteer personal page

## Deployment notes

- `public/_redirects` adds SPA fallback support for Netlify
- `vercel.json` adds SPA rewrites for Vercel
- App state and language preference are stored in `localStorage`, so the demo works without a backend
