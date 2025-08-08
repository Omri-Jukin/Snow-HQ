const templatesAfterChange = async ({ doc }: { doc: unknown }) => {
  try {
    const genUrl = `${process.env.SERVER_URL}/api/generate`
    const res = await fetch(genUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId: (doc as unknown as { id?: string })?.id }),
    })

    if (!res.ok) {
      console.error(`Generation request failed: ${res.status}`)
    } else {
      console.log(`Generation triggered for template: ${(doc as unknown as { id?: string })?.id}`)
    }
  } catch (err) {
    console.error('Error triggering generation:', err)
  }
}

export default templatesAfterChange
