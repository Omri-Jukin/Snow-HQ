import type { CollectionConfig } from 'payload'

const Plans: CollectionConfig = {
  slug: 'plans',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'priceMonthly', type: 'number', required: true },
    { name: 'features', type: 'array', fields: [{ name: 'feature', type: 'text' }] },
  ],
}

export default Plans
