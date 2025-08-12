import { getPayload } from 'payload'
import config from '@/payload.config'

export default async function TemplatesPage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const data = await payload.find({ collection: 'templates', limit: 20 })
  const items = data?.docs || []

  return (
    <div style={{ padding: 24 }}>
      <h1>Templates</h1>
      {items.length === 0 && <p>No templates yet.</p>}
      <ul style={{ display: 'grid', gap: 16, listStyle: 'none', padding: 0 }}>
        {items.map((t) => (
          <li key={t.id} style={{ border: '1px solid #333', padding: 16, borderRadius: 8 }}>
            <div style={{ fontWeight: 600 }}>{t.name}</div>
            {t.summary && <div style={{ opacity: 0.8 }}>{t.summary}</div>}
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              {t.demoUrl && (
                <a href={t.demoUrl} target="_blank" rel="noreferrer noopener">
                  Demo
                </a>
              )}
              {t.repoUrl && (
                <a href={t.repoUrl} target="_blank" rel="noreferrer noopener">
                  Repo
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
