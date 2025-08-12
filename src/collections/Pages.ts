import type { CollectionConfig } from 'payload'
import { sectionBlocks } from '../blocks/sections'
import pagesAfterChange from '@/hooks/pages.afterChange'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: { useAsTitle: 'title' },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    {
      name: 'template',
      type: 'relationship',
      relationTo: 'templates',
    },
    {
      name: 'sections',
      type: 'blocks',
      blocks: sectionBlocks,
    },
  ],
  hooks: { afterChange: [pagesAfterChange] },
}

export default Pages
