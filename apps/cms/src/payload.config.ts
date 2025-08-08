import path from 'path'
import { buildConfig } from 'payload'

import Users from './collections/Users'
import Pages from './collections/Pages'
import Templates from './collections/Templates'
import Plans from './collections/Plans'
import Media from './collections/Media'

import SiteSettings from './globals/SiteSettings'
import SEO from './globals/SEO'

import pagesAfterChange from './hooks/pages.afterChange'
import templatesAfterChange from './hooks/templates.afterChange'
import generateEndpoint from './endpoints/generate'
import { DatabaseAdapterResult } from 'node_modules/payload/dist/database/types'

export default buildConfig({
  serverURL: process.env.SERVER_URL,
  secret: process.env.PAYLOAD_SECRET || '',
  db: {
    // Expect Supabase Postgres connection string
    url: process.env.DATABASE_URI || '',
  } as unknown as DatabaseAdapterResult,
  collections: [
    Users,
    { ...Pages, hooks: { afterChange: [pagesAfterChange] } },
    { ...Templates, hooks: { afterChange: [templatesAfterChange] } },
    Media,
    Plans,
  ],
  globals: [SiteSettings, SEO],
  typescript: { outputFile: path.resolve(__dirname, 'payload-types.ts') },
  csrf: ['*'],
  cors: ['*'],
  endpoints: [generateEndpoint],
})
