const templatesAfterChange = async ({ doc }: { doc: unknown }) => {
  try {
    const serverUrl = process.env.SERVER_URL || ''
    const url = serverUrl ? `${serverUrl}/api/generate` : ''
    if (!url) return

    const id = (doc as { id?: string })?.id
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId: id }),
    })
  } catch (err) {
    console.error('Error triggering generation:', err)
  }
}

export default templatesAfterChange
