import type { GlobalConfig } from 'payload'

const SEO: GlobalConfig = {
  slug: 'seo',
  fields: [
    { name: 'titleTemplate', type: 'text' },
    { name: 'defaultDescription', type: 'textarea' },
    { name: 'openGraphImage', type: 'upload', relationTo: 'media' },
  ],
}

export default SEO
