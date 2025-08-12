import type { CollectionConfig } from 'payload'
import { sectionBlocks } from '../blocks/sections'
import templatesAfterChange from '@/hooks/templates.afterChange'

const Templates: CollectionConfig = {
  slug: 'templates',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'key', type: 'text', required: true, unique: true },
    { name: 'name', type: 'text', required: true },
    { name: 'summary', type: 'textarea' },
    { name: 'previewImage', type: 'upload', relationTo: 'media' },

    // New fields for external sources
    { name: 'demoUrl', type: 'text' },
    { name: 'repoUrl', type: 'text' }, // add GitHub URL when you have it
    { name: 'branch', type: 'text', defaultValue: 'main' },
    {
      name: 'packageManager',
      type: 'select',
      options: ['npm', 'pnpm', 'yarn'],
      defaultValue: 'npm',
    },
    { name: 'buildCommand', type: 'text', defaultValue: 'npm run build' },
    { name: 'devCommand', type: 'text', defaultValue: 'npm run dev' },
    { name: 'outputDir', type: 'text', defaultValue: 'out' },

    // Optional: parameters for generator UI
    {
      name: 'variables',
      type: 'array',
      fields: [
        { name: 'key', type: 'text', required: true },
        { name: 'label', type: 'text', required: true },
        { name: 'defaultValue', type: 'text' },
        { name: 'description', type: 'textarea' },
      ],
    },

    // Pre-filled page sections usable immediately
    {
      name: 'defaultSections',
      type: 'blocks',
      blocks: sectionBlocks,
    },
  ],
  hooks: { afterChange: [templatesAfterChange] },
}

export default Templates
