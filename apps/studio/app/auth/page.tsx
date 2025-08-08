'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function AuthPage() {
  const params = useSearchParams()
  const router = useRouter()
  const [tokenInput, setTokenInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setError(null)
  }, [])

  async function signIn(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const res = await fetch('/api/studio/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: tokenInput }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError((data && data.error) || 'Auth failed')
      return
    }
    const redirectTo = params.get('redirect') || '/'
    router.replace(redirectTo)
  }

  return (
    <main style={{ padding: 24, maxWidth: 460, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Studio Access</h1>
      <p style={{ opacity: 0.9, marginBottom: 16 }}>Enter your access token to continue.</p>
      <form onSubmit={signIn}>
        <input
          type="password"
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
          placeholder="Access token"
          style={{ width: '100%', padding: 10, border: '1px solid #e5e7eb', borderRadius: 6 }}
        />
        <button type="submit" style={{ marginTop: 12, padding: '10px 14px' }}>
          Continue
        </button>
        {error && <p style={{ color: 'crimson', marginTop: 12 }}>{error}</p>}
      </form>
    </main>
  )
}
