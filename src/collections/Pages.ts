import type { CollectionConfig } from 'payload'
import { sectionBlocks } from '../blocks/sections'

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
}

export default Pages
