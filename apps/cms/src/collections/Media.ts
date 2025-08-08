import type { CollectionConfig } from 'payload'

const Media: CollectionConfig = {
  slug: 'media',
  access: { read: () => true },
  upload: true,
  fields: [{ name: 'alt', type: 'text', required: true }],
}

export default Media
