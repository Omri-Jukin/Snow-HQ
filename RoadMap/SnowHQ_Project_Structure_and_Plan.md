
# SnowHQ — Monorepo Structure & Project Plan

This document defines the recommended repository layout, environments,
and phased plan for **SnowHQ** using **Payload CMS (Blank TypeScript)** + **Supabase (Postgres)** + **Cloudflare Pages** (frontends) + **Cloudflare R2** (media).
Optional **tRPC** acts as a thin BFF in app frontends, *not* inside Payload.

## 0) Project Overview

You are my development partner for building the SnowHQ monorepo, following a pre-defined architecture plan. 
You must think through each step in detail before outputting code, ensuring accuracy and alignment with the plan.

## Context
The project uses:
- Payload CMS (Blank TypeScript template) hosted on Railway/Render/Fly/VPS
- Supabase (Postgres) as the database
- Cloudflare R2 for media uploads (via S3 adapter)
- Cloudflare Pages for frontends (Next.js App Router)
- Optional tRPC in frontend apps as a BFF, never inside Payload
- Monorepo managed with pnpm + Turborepo (or Nx)

## Repository structure
- apps/cms → Payload CMS (API + Admin UI)
- apps/web → Marketing/docs site (Next.js)
- apps/generator → SnowGen UI (Next.js)
- packages/ui, packages/types, packages/tsconfig, packages/eslint-config → shared code

## Key requirements
1. Implement `payload.config.ts` with:
   - Collections: Users, Pages, Templates, Media, Plans
   - Globals: SiteSettings, SEO
   - Hooks: `pages.afterChange` (ISR revalidation), `templates.afterChange` (generation trigger)
   - R2 S3 adapter for media
   - Supabase Postgres DB connection
2. Place hooks in `apps/cms/src/hooks/` as per the plan.
3. Implement `/api/generate` endpoint in Payload to enqueue/trigger SnowGen site generation.
4. Frontends must fetch from Payload via REST or GraphQL (server-side where possible).
5. Configure `.env` files for CMS, web, and generator apps as documented.
6. Set up CI/CD:
   - CMS → Railway/Render/Fly deploy
   - Web/Generator → Cloudflare Pages
7. No secrets in frontend deployments — only public CMS URL and tokens for revalidation.

## How to work
- Think through the step carefully before coding.
- When implementing a file, include **full file paths** relative to repo root.
- Maintain correct TypeScript types and Payload conventions.
- Keep implementation modular — collections, hooks, and endpoints in their own files.
- Ask for confirmation if a decision is unclear or has multiple good options.

## First tasks
1. Scaffold `apps/cms` from Payload Blank TypeScript template.
2. Create `payload.config.ts` and collections/globals directories.
3. Implement `pages.afterChange.ts` and `templates.afterChange.ts` hooks.
4. Add `/api/generate` endpoint to `apps/cms/src/endpoints/`.

Stop and await review after completing these tasks.

---

## 1) Monorepo Layout

```
snowhq/
├─ apps/
│  ├─ cms/                             # Payload CMS (API + Admin UI) — deployed to Railway/Render/Fly/VPS
│  │  ├─ src/
│  │  │  ├─ payload.config.ts
│  │  │  ├─ collections/
│  │  │  │  ├─ Users.ts
│  │  │  │  ├─ Pages.ts               # Marketing pages / docs index
│  │  │  │  ├─ Templates.ts           # SnowGen templates metadata + assets
│  │  │  │  ├─ Media.ts               # R2-backed uploads via S3 adapter
│  │  │  │  └─ Plans.ts               # Pricing/plans (optional)
│  │  │  ├─ globals/
│  │  │  │  ├─ SiteSettings.ts        # Nav, theme, social, footer
│  │  │  │  └─ SEO.ts
│  │  │  ├─ hooks/
│  │  │  │  ├─ pages.afterChange.ts   # Revalidate marketing site on publish
│  │  │  │  └─ templates.afterChange.ts # Trigger gen webhook/queue
│  │  │  ├─ endpoints/
│  │  │  │  └─ generate.ts            # POST /api/generate → enqueue SnowGen build
│  │  │  ├─ lib/
│  │  │  │  ├─ r2Adapter.ts           # S3-compatible adapter for R2
│  │  │  │  └─ queueClient.ts         # (optional) CF Queues/Rabbit client
│  │  │  └─ index.ts                  # Server bootstrap
│  │  ├─ .env.example
│  │  ├─ Dockerfile
│  │  ├─ package.json
│  │  └─ README.md
│  │
│  ├─ web/                             # snowhq.org — Marketing & Docs (Next.js, Cloudflare Pages)
│  │  ├─ app/
│  │  │  ├─ (marketing)/page.tsx
│  │  │  ├─ templates/page.tsx
│  │  │  ├─ pricing/page.tsx
│  │  │  ├─ docs/                      # MDX docs (or Contentlayer)
│  │  │  └─ api/revalidate/route.ts    # Receives CMS webhook to ISR revalidate
│  │  ├─ components/
│  │  ├─ lib/cms.ts                    # REST/GraphQL fetchers to Payload
│  │  ├─ public/
│  │  ├─ next.config.mjs
│  │  ├─ wrangler.toml                 # (optional) Pages Functions
│  │  └─ package.json
│  │
│  └─ generator/                       # SnowGen UI (Next.js, Cloudflare Pages)
│     ├─ app/
│     │  ├─ generate/page.tsx
│     │  ├─ examples/page.tsx
│     │  └─ api/generate/route.ts      # Calls cms /api/generate (server-side)
│     ├─ server/api/routers/           # (optional) tRPC routers as BFF
│     │  ├─ templates.ts
│     │  └─ jobs.ts
│     ├─ lib/cms.ts
│     ├─ next.config.mjs
│     └─ package.json
│
├─ packages/
│  ├─ ui/                              # Shared UI (MUI/Tailwind components)
│  ├─ types/                           # Shared Zod + TS types
│  ├─ tsconfig/                        # Base tsconfig(s)
│  └─ eslint-config/
│
├─ .github/workflows/
│  ├─ cms-deploy.yml                   # Build Docker, deploy to host
│  ├─ web-pages.yml                    # Deploy snowhq.org to Cloudflare Pages
│  └─ generator-pages.yml              # Deploy SnowGen UI to Cloudflare Pages
│
├─ turbo.json                          # Or nx.json (if using Nx)
├─ pnpm-workspace.yaml                 # Or yarn workspaces
├─ package.json                        # Scripts (dev, build, lint, typecheck)
└─ README.md
```

---

## 2) Environment Variables

### apps/cms/.env (server-only)
```
NODE_ENV=production
PAYLOAD_SECRET=sk_***
SERVER_URL=https://cms.snowhq.org

# Supabase Postgres
DATABASE_URI=postgresql://USER:PASSWORD@HOST:6543/postgres?sslmode=require

# Cloudflare R2 (S3-compatible)
S3_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com
S3_BUCKET=snowhq-media
S3_REGION=auto
S3_ACCESS_KEY_ID=***
S3_SECRET_ACCESS_KEY=***

# Web revalidation / queues
WEB_REVALIDATE_URL=https://snowhq.org/api/revalidate
WEB_REVALIDATE_TOKEN=rv_***
```

### apps/web — Cloudflare Pages project
```
NEXT_PUBLIC_CMS_URL=https://cms.snowhq.org
REVALIDATE_TOKEN=rv_***
```

### apps/generator — Cloudflare Pages project
```
NEXT_PUBLIC_CMS_URL=https://cms.snowhq.org
```

---

## 3) Minimal Payload Config (outline)

```ts
// apps/cms/src/payload.config.ts
import { buildConfig } from 'payload/config'
import Users from './collections/Users'
import Pages from './collections/Pages'
import Templates from './collections/Templates'
import Media from './collections/Media'
import Plans from './collections/Plans'
import SiteSettings from './globals/SiteSettings'
import SEO from './globals/SEO'

export default buildConfig({
  serverURL: process.env.SERVER_URL,
  secret: process.env.PAYLOAD_SECRET!,
  db: { url: process.env.DATABASE_URI! },
  collections: [Users, Pages, Templates, Media, Plans],
  globals: [SiteSettings, SEO],
  typescript: { outputFile: path.resolve(__dirname, 'payload-types.ts') },
  csrf: false, cors: true,
})
```

**Key hooks/endpoints**
- `pages.afterChange` → `POST ${WEB_REVALIDATE_URL}` with token
- `templates.afterChange` → `POST /api/generate` to enqueue a build
- `endpoints/generate.ts` → validate payload, persist job, return `jobId`

---

## 4) Frontend Data Access

- Prefer **server-side** calls (RSC/Server Actions) to the CMS using a **server token**.
- Public reads can use anonymous requests if Payload collection access allows it.
- For composite flows, expose a **tRPC** router in `apps/generator/server/api/routers/*`.

Example fetcher:
```ts
// apps/web/lib/cms.ts
export async function getTemplates() {
  const url = `${process.env.NEXT_PUBLIC_CMS_URL}/api/templates?limit=20&depth=1`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch templates')
  return res.json()
}
```

---

## 5) CI/CD

- **CMS** (`cms-deploy.yml`):
  - Install, build Payload, build Docker image
  - Push to host (Railway/Render/Fly) with env vars configured in host
  - Run migrations on start
- **Web/Generator** (`web-pages.yml`, `generator-pages.yml`):
  - Install, build Next.js
  - Deploy to Cloudflare Pages
  - No secrets in build; only public CMS URL

---

## 6) Phased Project Plan

### Phase 0 — Bootstrap (1–2 days)
- Create monorepo (pnpm + Turbo or Nx)
- Scaffold **apps/cms** with Payload **Blank TypeScript**
- Scaffold **apps/web** and **apps/generator** (Next.js App Router)
- Add `packages/ui`, `packages/types`

### Phase 1 — CMS MVP (3–5 days)
- Implement collections: `Pages`, `Templates`, `Media`
- Implement globals: `SiteSettings`, `SEO`
- Add R2 upload adapter
- Configure Supabase Postgres and run migrations
- Add `pages.afterChange` → ISR webhook

### Phase 2 — SnowGen Integration (4–7 days)
- `templates.afterChange` → `/api/generate` endpoint
- Implement `generate.ts` (validate, persist job)
- In **generator**, add flows: pick template → configure → trigger generate
- (Optional) tRPC router for composite actions

### Phase 3 — Marketing & Docs (2–3 days)
- Build landing, templates gallery, pricing
- MDX docs with examples and API usage
- Wire search/SEO basics

### Phase 4 — Productionization (3–5 days)
- Logging/metrics (host logs + Cloudflare Analytics)
- Backups for Supabase
- Admin roles/permissions, rate limits
- Error boundaries & empty states
- QA: accessibility, mobile, perf

### Phase 5 — Nice-to-haves
- Auth for SnowGen users (Supabase Auth or Payload auth, choose one per audience)
- Job queue (CF Queues/Rabbit) for generation pipeline
- E2E tests (Playwright) for critical flows
- Payments (Stripe) for Plans/Marketplace

---

## 7) Scripts & Commands

**Root scripts (package.json)**
```json
{
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck"
  }
}
```

**apps/cms**
```json
{
  "scripts": {
    "dev": "payload dev",
    "build": "payload build",
    "start": "node dist/server.js"
  }
}
```

**apps/web & apps/generator**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

---

## 8) Risk Notes & Decisions

- **Why not Cloudflare Workers for CMS?** Payload requires a long‑lived Node server and richer DB features.
- **Why Supabase?** Managed Postgres, backups, observability; pairs cleanly with Payload.
- **Where are secrets?** Only on the CMS host and Supabase; Cloudflare frontends use public CMS URL.
- **tRPC placement?** In frontend apps as BFF. Keep CMS pure and decoupled.

---

## 9) Done Definition (MVP)

- Payload deployed at `https://cms.snowhq.org` with Admin access
- R2 uploads working; media served via public buckets or signed URLs
- snowhq.org pulling `Pages/Templates` and revalidating on publish
- SnowGen UI can trigger a generate job and show job status
- CI/CD green on all apps

---

_Updated on: 2025-08-08 05:35 UTC_


---

## 10) Hook Implementations & Placement

### **apps/cms/src/payload.config.ts**
```ts
// apps/cms/src/payload.config.ts
import path from 'path';
import { buildConfig } from 'payload/config';
import payloadCloud from '@payloadcms/plugin-cloud';

import Users from './collections/Users';
import Pages from './collections/Pages';
import Templates from './collections/Templates';
import Plans from './collections/Plans';
import SiteSettings from './globals/SiteSettings';
import SEO from './globals/SEO';

import pagesAfterChange from './hooks/pages.afterChange';
import templatesAfterChange from './hooks/templates.afterChange';

const collections = [
  Users,
  { ...Pages, hooks: { afterChange: [pagesAfterChange] } },
  { ...Templates, hooks: { afterChange: [templatesAfterChange] } },
  Plans,
];

// Optional media collection
if (process.env.ENABLE_MEDIA_STORAGE === 'true') {
  const Media = require('./collections/Media').default;
  collections.push(Media);
}

export default buildConfig({
  serverURL: process.env.SERVER_URL,
  secret: process.env.PAYLOAD_SECRET!,
  db: { url: process.env.DATABASE_URI! },
  collections,
  globals: [SiteSettings, SEO],
  typescript: { outputFile: path.resolve(__dirname, 'payload-types.ts') },
  csrf: false,
  cors: true,
  plugins: [
    payloadCloud(),
    // Optional S3 adapter
    ...(process.env.ENABLE_MEDIA_STORAGE === 'true'
      ? [
          require('@payloadcms/plugin-cloud-storage/s3').s3Adapter({
            config: {
              endpoint: process.env.S3_ENDPOINT!,
              credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID!,
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
              },
              region: process.env.S3_REGION || 'auto',
            },
            bucket: process.env.S3_BUCKET!,
          }),
        ]
      : []),
  ],
});

```

### **apps/cms/src/hooks/pages.afterChange.ts**
```ts
import type { AfterChangeHook } from 'payload/dist/collections/config/types';

const pagesAfterChange: AfterChangeHook = async ({ doc }) => {
  try {
    if (!process.env.WEB_REVALIDATE_URL || !process.env.WEB_REVALIDATE_TOKEN) {
      console.warn('Revalidation not configured.');
      return;
    }

    await fetch(process.env.WEB_REVALIDATE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.WEB_REVALIDATE_TOKEN}`,
      },
      body: JSON.stringify({ path: `/${doc.slug || ''}` }),
    });

    console.log(`Revalidated page: /${doc.slug || ''}`);
  } catch (err) {
    console.error('Error triggering page revalidation:', err);
  }
};

export default pagesAfterChange;
```

### **apps/cms/src/hooks/templates.afterChange.ts**
```ts
import type { AfterChangeHook } from 'payload/dist/collections/config/types';

const templatesAfterChange: AfterChangeHook = async ({ doc }) => {
  try {
    const genUrl = `${process.env.SERVER_URL}/api/generate`;
    const res = await fetch(genUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId: doc.id }),
    });

    if (!res.ok) {
      console.error(`Generation request failed: ${res.status}`);
    } else {
      console.log(`Generation triggered for template: ${doc.id}`);
    }
  } catch (err) {
    console.error('Error triggering generation:', err);
  }
};

export default templatesAfterChange;
```

**Directory placement:**
```
apps/
  cms/
    src/
      payload.config.ts
      hooks/
        pages.afterChange.ts
        templates.afterChange.ts
      collections/
        Pages.ts
        Templates.ts
        Users.ts
        Media.ts
        Plans.ts
      globals/
        SiteSettings.ts
        SEO.ts
```

## apps/cms/src/hooks/pages.afterChange.ts
```
import type { AfterChangeHook } from 'payload/dist/collections/config/types';

const pagesAfterChange: AfterChangeHook = async ({ doc }) => {
  try {
    if (!process.env.WEB_REVALIDATE_URL || !process.env.WEB_REVALIDATE_TOKEN) {
      console.warn('Revalidation not configured.');
      return;
    }

    await fetch(process.env.WEB_REVALIDATE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.WEB_REVALIDATE_TOKEN}`,
      },
      body: JSON.stringify({ path: `/${doc.slug || ''}` }),
    });

    console.log(`Revalidated page: /${doc.slug || ''}`);
  } catch (err) {
    console.error('Error triggering page revalidation:', err);
  }
};

export default pagesAfterChange;

```

## apps/cms/src/hooks/templates.afterChange.ts
```
import type { AfterChangeHook } from 'payload/dist/collections/config/types';

const templatesAfterChange: AfterChangeHook = async ({ doc }) => {
  try {
    const genUrl = `${process.env.SERVER_URL}/api/generate`;
    const res = await fetch(genUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId: doc.id }),
    });

    if (!res.ok) {
      console.error(`Generation request failed: ${res.status}`);
    } else {
      console.log(`Generation triggered for template: ${doc.id}`);
    }
  } catch (err) {
    console.error('Error triggering generation:', err);
  }
};

export default templatesAfterChange;
```

## Directory placement
```
apps/
  cms/
    src/
      payload.config.ts
      hooks/
        pages.afterChange.ts
        templates.afterChange.ts
      collections/
        Pages.ts
        Templates.ts
        Users.ts
        Media.ts
        Plans.ts
      globals/
        SiteSettings.ts
        SEO.ts
```