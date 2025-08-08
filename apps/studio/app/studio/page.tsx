'use client'
import { useState } from 'react'

export default function StudioMain() {
  const [cvText, setCvText] = useState('')
  const [jdText, setJdText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | Record<string, unknown> | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onGenerate() {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/studio/generate-local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText, jdText }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Generation failed')
      setResult(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Studio</h1>
      <p style={{ opacity: 0.9, marginBottom: 16 }}>
        Paste your CV and the job description. Keep data private.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <section>
          <h2 style={{ fontSize: 16, marginBottom: 6 }}>CV (text)</h2>
          <textarea
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
            rows={16}
            style={{ width: '100%' }}
          />
        </section>
        <section>
          <h2 style={{ fontSize: 16, marginBottom: 6 }}>Job Description (text)</h2>
          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            rows={16}
            style={{ width: '100%' }}
          />
        </section>
      </div>
      <button
        onClick={onGenerate}
        disabled={loading}
        style={{ marginTop: 16, padding: '10px 14px' }}
      >
        {loading ? 'Generating…' : 'Generate Artifacts'}
      </button>
      {typeof error === 'string' && <p style={{ color: 'crimson', marginTop: 12 }}>{error}</p>}
      {result && (
        <div style={{ marginTop: 24 }}>
          <h2>Results</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>
            {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </main>
  )
}
