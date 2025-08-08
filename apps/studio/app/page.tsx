export default function StudioHome() {
  const enabled = process.env.NEXT_PUBLIC_STUDIO_ENABLED === 'true'
  return (
    <main style={{ padding: 24, maxWidth: 820, margin: '0 auto', lineHeight: 1.5 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>SnowHQ Studio</h1>
      {!enabled ? (
        <p style={{ opacity: 0.8 }}>
          Studio is disabled. Set <code>NEXT_PUBLIC_STUDIO_ENABLED=true</code> to enable the UI.
        </p>
      ) : (
        <>
          <p style={{ opacity: 0.9 }}>
            Private tool for generating application-centered artifacts (resume text, cover letter,
            portfolio suggestions, and a personal note) from your CV and a job post.
          </p>
          <p style={{ marginTop: 8 }}>
            Go to{' '}
            <a href="/studio" style={{ textDecoration: 'underline' }}>
              Studio
            </a>{' '}
            to start.
          </p>
          <div style={{ marginTop: 24, padding: 16, border: '1px solid #e5e7eb', borderRadius: 8 }}>
            <h2 style={{ fontSize: 20, marginBottom: 12 }}>Getting Started</h2>
            <ol style={{ paddingLeft: 18 }}>
              <li>
                Enable the feature flag: <code>NEXT_PUBLIC_STUDIO_ENABLED=true</code>.
              </li>
              <li>Upload your CV (PDF/DOCX) or paste the text.</li>
              <li>Paste the job description or provide a public URL.</li>
              <li>Review and export generated artifacts.</li>
            </ol>
          </div>
        </>
      )}
    </main>
  )
}
