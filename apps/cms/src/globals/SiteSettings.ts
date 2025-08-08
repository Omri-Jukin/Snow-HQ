import type { GlobalConfig } from 'payload'

const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  fields: [
    { name: 'siteName', type: 'text', required: true },
    {
      name: 'navigation',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
      ],
    },
    { name: 'footerText', type: 'text' },
  ],
}

export default SiteSettings
