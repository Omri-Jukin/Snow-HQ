import type { Block } from 'payload'

export const heroSection: Block = {
  slug: 'hero',
  fields: [
    { name: 'heading', type: 'text', required: true },
    { name: 'subheading', type: 'textarea' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'ctaText', type: 'text' },
    { name: 'ctaHref', type: 'text' },
  ],
}

export const featuresSection: Block = {
  slug: 'features',
  fields: [
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        { name: 'icon', type: 'text' },
      ],
    },
  ],
}

export const pricingSection: Block = {
  slug: 'pricing',
  fields: [
    {
      name: 'plans',
      type: 'array',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'price', type: 'text', required: true },
        { name: 'features', type: 'array', fields: [{ name: 'item', type: 'text' }] },
        { name: 'ctaText', type: 'text' },
        { name: 'ctaHref', type: 'text' },
      ],
    },
  ],
}

export const faqSection: Block = {
  slug: 'faq',
  fields: [
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'textarea', required: true },
      ],
    },
  ],
}

export const ctaSection: Block = {
  slug: 'cta',
  fields: [
    { name: 'text', type: 'text', required: true },
    { name: 'href', type: 'text', required: true },
  ],
}

export const sectionBlocks: Block[] = [
  heroSection,
  featuresSection,
  pricingSection,
  faqSection,
  ctaSection,
]
