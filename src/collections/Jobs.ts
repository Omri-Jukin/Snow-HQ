import type { CollectionConfig } from 'payload'

const Jobs: CollectionConfig = {
  slug: 'jobs',
  admin: { useAsTitle: 'id' },
  access: { read: () => true },
  timestamps: true,
  fields: [
    {
      name: 'template',
      type: 'relationship',
      relationTo: 'templates',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'queued',
      options: [
        { label: 'Queued', value: 'queued' },
        { label: 'Processing', value: 'processing' },
        { label: 'Done', value: 'done' },
        { label: 'Error', value: 'error' },
      ],
    },
    { name: 'error', type: 'textarea' },
  ],
}

export default Jobs
