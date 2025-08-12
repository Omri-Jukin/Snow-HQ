# SnowHQ — Implementation Plan & TODO

This document enumerates all work needed to implement the SnowHQ Ecosystem Strategy, with concrete tasks, tests, and deployment/ops steps. It will be updated as items are completed.

## Legend

- P0: Critical for baseline stability and core flows
- P1: Important for strategy completeness
- P2: Polishing and scale items

---

## P0 — Build Stability, Core Hooks, Hub Pages, Tests

### 1) Build stability (Next.js app)

- Issue: Build fails on optional 3D components (e.g., `@react-three/fiber`).
- Options:
  - A) Install deps: `three`, `@react-three/fiber`, `@react-three/drei`.
  - B) Lazy-load/gate 3D components (`ssr: false`) to avoid server build dependency.
- Plan: Start with A for speed. Revisit B if bundle size/performance matter.
- Verify: `npm run lint` and `npm run build` pass.

### 2) Revalidation & generation hooks (CMS)

- Pages revalidation:
  - Done: `src/hooks/pages.afterChange.ts` + wired in `src/collections/Pages.ts`.
  - Endpoint: `src/app/api/revalidate/route.ts` (Bearer token + `{ path }`).
- Templates generation trigger:
  - TODO: `src/hooks/templates.afterChange.ts` to POST `{ templateId }` → `/api/generate`.
  - Wire in `src/collections/Templates.ts` (`hooks.afterChange`).
- `/api/generate` (Payload):
  - Current: stub at `src/endpoints/generate.ts`, registered in `src/payload.config.ts`.
  - Next: persist a job in a new `jobs` collection and return `{ jobId, status }`.
- Verify: integration tests assert hooks attached; endpoint is present.

### 3) Hub navigation & pages

- Nav links: Demo, Templates, Docs, Examples, Pricing (added in `/(frontend)/layout.tsx`).
- Pages initial content:
  - `/templates`: render list from Payload `templates` collection with name, demoUrl, repoUrl, preview.
  - `/demo`, `/docs`, `/examples`, `/pricing`: placeholders now, to be expanded.
- Verify: E2E confirms nav + pages render.

### 4) Tests (baseline)

- Lint: `npm run lint` clean.
- Integration (Vitest):
  - Config exposes `/api/generate`.
  - Hooks attached: pages + templates.
- E2E (Playwright):
  - Homepage renders with visible `<h1>`.
  - Nav links exist; `/templates` loads.
- Verify: `npm run test:int`, `npm run test:e2e` pass locally.

### 5) Documentation

- Maintain this file as source of truth; update when items are completed.

---

## P1 — Subdomains, Deployment, CMS Structure, Analytics

### 6) Subdomains scaffolding — staged rollout

- Per strategy:
  - `crm.snowhq.org` → `apps/crm` (Next.js skeleton)
  - `markscribe.snowhq.org` → `apps/markscribe` (Next.js; Markdown→DOCX stub)
  - `angular.snowhq.org` → `apps/angular-protocol` (Angular or docs shell)
  - `api.snowhq.org` → `apps/api-docs` (OpenAPI UI placeholder)
  - `portfolio.snowhq.org` → `apps/portfolio` (landing/profile)
- Cloudflare Pages:
  - Create projects, map DNS, set npm build, set env vars per app.
- GitHub Actions: workflows to deploy on push per app.
- Verification: each subdomain serves a hello page.

### 7) Deployment & ops for hub

- Deploy hub to Cloudflare Pages.
- Add Cloudflare Web Analytics snippet to shared layout.
- Env vars in `.env.example`: `WEB_REVALIDATE_URL`, `WEB_REVALIDATE_TOKEN`, `NEXT_PUBLIC_CMS_URL`, analytics.
- Verify: production renders; analytics events visible.

### 8) CMS structure alignment (migrate to apps/cms)

- Migrate CMS to `apps/cms/*` per plan; deprecate duplicates under `src/*` after move.
- If migrating: move collections/globals/hooks/endpoints; update imports and scripts.
- Verify: Admin loads, API works, types generate.

### 9) Testing expansion

- E2E: mobile viewport + Firefox; smoke tests for `/templates`, `/docs`, `/examples`, `/pricing`, `/demo`.
- Integration: `/api/revalidate` 200/401; `/api/generate` success/error.
- Contract tests for `jobs` lifecycle (create, read status).
- Accessibility: axe smoke on homepage and `/templates`.
- Verify: CI runs tests on PRs.

### 10) Branding & UX

- Unify theme, color, typography; update metadata/og.
- Header/footer consistency; active nav state.
- Verify: visual review + lighthouse basics.

---

## P2 — API Docs, Shared UI, Metrics, Security, SEO

### 11) API services/docs

- `api.snowhq.org`: route to render OpenAPI; example client snippets.
- Minimal OpenAPI spec stub for public endpoints.

### 12) Shared design system

- Extract common components to `packages/ui` via npm workspaces once core stable.

### 13) Metrics & monitoring

- Event tracking for key flows; server logging for endpoints.

### 14) Maintenance & security

- Security headers middleware; basic rate limiting on generation endpoint.
- SEO: sitemap, robots.txt, default metas.

---

## Environment variables

- `WEB_REVALIDATE_URL`, `WEB_REVALIDATE_TOKEN`
- `NEXT_PUBLIC_CMS_URL`
- If job queue/store added: DB connection (Supabase) + queue config.

---

## Risks & Mitigations

- Optional heavy deps break builds → install or lazy-load 3D features.
- Multiple sub-apps complicate CI/CD → stage one subdomain at a time.
- Hooks depend on env vars → guard when missing and log.

---

## Acceptance Criteria (MVP)

- Lint, build, and tests pass locally and in CI.
- Pages revalidation triggers on publish.
- `/templates` renders data from CMS.
- Subdomains scaffolded and deployed (hello pages).

---

## Next Actions (Starting Now)

1. Implement `jobs` collection and wire `/api/generate` to persist jobs.
2. Add security headers and rate limiting middleware.
3. Normalize import aliases and remove unused ones.
4. Expand tests (jobs contract + axe checks).
5. Prepare `apps/cms` migration plan.

---

## 11) Subdomain repo integration policy (performance-safe)

- CRM (Next.js) lives in a separate repo (`https://github.com/Omri-Jukin/Snow`) and deploys as its own app to `crm.snowhq.org`.
- Import strategy (no runtime coupling):
  - Prefer Git submodule or sparse checkout to mount the repo under `apps/crm/` for code visibility only.
  - Each app keeps its own `package.json` and build pipeline.
  - CI matrix builds each app in isolation; only the changed app builds/deploys.
  - Cloudflare Pages: one project per subdomain; no rewrite/proxy through the hub.
  - Avoid cross-app imports that would bundle CRM into other apps.
- Portfolio remains its own site at `https://omrijukin.com` (not a SnowHQ subdomain). Version parity can be checked by exposing a small `/api/version` endpoint and build footer hash in that repo.

---

## 12) CRM submodule status & workflow

- apps/crm is a Git submodule pointing to `https://github.com/Omri-Jukin/Snow`.
- Work locally in-place: open `apps/crm` in the same window or a new one; commits push to the CRM repo.
- Root scripts: `npm run dev:crm`, `npm run build:crm`, `npm run start:crm` (forward to submodule).
- CI: add a matrix job to build/deploy `apps/crm` to the Cloudflare Pages project mapped to `crm.snowhq.org`.
