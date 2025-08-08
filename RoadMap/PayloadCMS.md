## Payload CMS: How to add collections, globals, blocks, hooks, and endpoints

This guide shows where to put Payload CMS code in this repo and the minimal steps to make new items appear in the Admin dashboard.

### Paths at a glance

- Monorepo CMS (preferred per plan):
  - Config: `apps/cms/src/payload.config.ts`
  - Collections: `apps/cms/src/collections/*`
  - Globals: `apps/cms/src/globals/*`
  - Hooks: `apps/cms/src/hooks/*`
  - Endpoints: `apps/cms/src/endpoints/*`
  - Drizzle: `apps/cms/src/lib/*`

- Current integrated app (already present):
  - Config: `src/payload.config.ts`
  - Collections: `src/collections/*`
  - Blocks: `src/blocks/sections.ts`

Use the monorepo locations when the CMS is split to `apps/cms`. While both exist, mirror changes in the one you actively run.

---

## Add a new Collection (shows as a tile in Admin)

1. Create the collection file

Example: `src/collections/Articles.ts` (or `apps/cms/src/collections/Articles.ts`)

```ts
import type { CollectionConfig } from 'payload'

const Articles: CollectionConfig = {
  slug: 'articles',
  admin: { useAsTitle: 'title' },
  access: {
    read: () => true, // public read
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'excerpt', type: 'textarea' },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
  ],
}

export default Articles
```

2. Register it in the Payload config

Open `src/payload.config.ts` (or `apps/cms/src/payload.config.ts`) and add the collection to `collections`:

```ts
import Articles from './collections/Articles'

export default buildConfig({
  // ...
  collections: [
    Users,
    Media,
    // existing collections…
    Articles, // <-- add here
  ],
})
```

3. Admin dashboard

- Save and restart the dev server if needed; the new tile appears automatically.

Tips

- Use `admin.useAsTitle` to control the card title.
- Add `auth: true` to make it an auth-enabled collection (like `users`).

---

## Add a Global

1. Create: `apps/cms/src/globals/SiteSettings.ts` (or `src/globals/SiteSettings.ts`)

```ts
import type { GlobalConfig } from 'payload'

const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  fields: [
    { name: 'siteName', type: 'text', required: true },
    { name: 'footerText', type: 'text' },
  ],
}

export default SiteSettings
```

2. Register in config:

```ts
import SiteSettings from './globals/SiteSettings'

export default buildConfig({
  // ...
  globals: [SiteSettings /* , other globals */],
})
```

---

## Add/extend Page “Sections” (Blocks)

- Blocks live in `src/blocks/sections.ts`.
- To add a new section type (e.g., `testimonials`):

```ts
import type { Block } from 'payload'

export const testimonialsSection: Block = {
  slug: 'testimonials',
  fields: [
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'quote', type: 'textarea', required: true },
        { name: 'author', type: 'text' },
      ],
    },
  ],
}

export const sectionBlocks: Block[] = [
  // existing blocks…
  testimonialsSection, // <-- include here so it appears in Pages/Templates
]
```

These blocks are used in `Pages.sections` and `Templates.defaultSections`. Once added to `sectionBlocks`, they appear in the Admin block picker.

---

## Add a Hook (e.g., afterChange)

1. Create a hook file: `apps/cms/src/hooks/pages.afterChange.ts`

```ts
export default async function pagesAfterChange({ doc }: { doc: unknown }) {
  if (!process.env.WEB_REVALIDATE_URL || !process.env.WEB_REVALIDATE_TOKEN) return
  await fetch(process.env.WEB_REVALIDATE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.WEB_REVALIDATE_TOKEN}`,
    },
    body: JSON.stringify({ path: `/${(doc as { slug?: string })?.slug || ''}` }),
  })
}
```

2. Attach it in the collection definition:

```ts
import pagesAfterChange from '../hooks/pages.afterChange'

const Pages: CollectionConfig = {
  slug: 'pages',
  fields: [
    /* … */
  ],
  hooks: { afterChange: [pagesAfterChange] },
}
```

Common hooks: `beforeValidate`, `beforeChange`, `afterChange`, `afterRead`.

---

## Add a Custom Endpoint (e.g., /api/generate)

1. Create: `apps/cms/src/endpoints/generate.ts`

```ts
import type { Endpoint, PayloadHandler } from 'payload'
import crypto from 'node:crypto'
import { db } from '../lib/db'
import { generationJobs } from '../lib/schema'

type ResLike = { status: (code: number) => { json: (data: unknown) => unknown } }

const generateEndpoint: Endpoint = {
  path: '/generate', // becomes /api/generate
  method: 'post',
  handler: (async (...args: unknown[]) => {
    const req = args[0] as { body?: { templateId?: string } } | undefined
    const res = args[1] as ResLike

    const templateId = req?.body?.templateId
    if (!templateId) return res.status(400).json({ error: 'templateId is required' })

    const id = crypto.randomUUID()
    await db.insert(generationJobs).values({ id, templateId, status: 'queued' })
    return res.status(200).json({ message: 'Generation enqueued', jobId: id, templateId })
  }) as unknown as PayloadHandler,
}

export default generateEndpoint
```

2. Register in config:

```ts
import generateEndpoint from './endpoints/generate'

export default buildConfig({
  // ...
  endpoints: [generateEndpoint],
})
```

---

## Media (Cloudflare R2 via S3 adapter)

Add env vars in CMS host, then configure the storage plugin in `payload.config.ts`.

Env

```
S3_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com
S3_BUCKET=snowhq-media
S3_REGION=auto
S3_ACCESS_KEY_ID=***
S3_SECRET_ACCESS_KEY=***
```

Plugin (example)

```ts
// inside plugins: []
// require('@payloadcms/plugin-cloud-storage/s3').s3Adapter({
//   config: { endpoint: process.env.S3_ENDPOINT!, credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID!, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY! }, region: process.env.S3_REGION || 'auto' },
//   bucket: process.env.S3_BUCKET!,
// })
```

---

## Database (Supabase Postgres)

- CMS must use Payload’s Postgres adapter under the hood; set `DATABASE_URI`.
- For custom jobs/data, Drizzle is available in `apps/cms/src/lib/*`.

`DATABASE_URI` example

```
postgresql://USER:PASSWORD@HOST:6543/postgres?sslmode=require
```

---

## Environment variables (CMS)

```
PAYLOAD_SECRET=sk_***
SERVER_URL=https://cms.snowhq.org (or http://localhost:3000)
DATABASE_URI=postgresql://... (Supabase connection string)
WEB_REVALIDATE_URL=https://snowhq.org/api/revalidate (or local)
WEB_REVALIDATE_TOKEN=rv_***
S3_* (if using R2)
```

Keep secrets only on the CMS host; never in frontends.

---

## Frontends (reading from CMS)

- REST example:

```
GET {NEXT_PUBLIC_CMS_URL}/api/pages?limit=10
```

- GraphQL example:

```
POST {NEXT_PUBLIC_CMS_URL}/api/graphql
```

Use server-side calls in Next.js (RSC/actions) with a server token when needed.

---

## Common commands

- Generate TS types from Payload config: `npm run generate:types` (or `payload generate:types`)
- Start dev: `npm run dev`
- Lint: `npm run lint`

---

## Troubleshooting

- Tile not showing in Admin: ensure the collection/global is imported and added to `collections`/`globals` in `payload.config.ts`; restart dev.
- Type errors after adding fields: regenerate types.
- CORS/CSRF during local API calls: keep `csrf: false` and `cors: true` (or configure arrays) while developing.
