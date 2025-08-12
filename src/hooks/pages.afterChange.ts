const pagesAfterChange = async ({ doc }: { doc: unknown }) => {
  try {
    const url = process.env.WEB_REVALIDATE_URL
    const token = process.env.WEB_REVALIDATE_TOKEN
    if (!url || !token) {
      console.warn('WEB_REVALIDATE_URL or WEB_REVALIDATE_TOKEN is not configured')
      return
    }

    const slug = (doc as { slug?: string })?.slug || ''
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ path: `/${slug}` }),
    })
  } catch (err) {
    console.error('Error triggering revalidation:', err)
  }
}

export default pagesAfterChange


