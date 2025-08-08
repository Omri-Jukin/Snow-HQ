import type { CollectionConfig } from 'payload'

const Templates: CollectionConfig = {
  slug: 'templates',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
  ],
}

export default Templates
