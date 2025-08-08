import type { CollectionConfig } from 'payload'

const Pages: CollectionConfig = {
  slug: 'pages',
  admin: { useAsTitle: 'title' },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'content', type: 'richText' },
  ],
}

export default Pages
