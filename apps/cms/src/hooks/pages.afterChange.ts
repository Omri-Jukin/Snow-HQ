const pagesAfterChange = async ({ doc }: { doc: unknown }) => {
  try {
    if (!process.env.WEB_REVALIDATE_URL || !process.env.WEB_REVALIDATE_TOKEN) {
      console.warn('Revalidation not configured.')
      return
    }

    await fetch(process.env.WEB_REVALIDATE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.WEB_REVALIDATE_TOKEN}`,
      },
      body: JSON.stringify({ path: `/${(doc as unknown as { slug?: string })?.slug || ''}` }),
    })

    console.log(`Revalidated page: /${(doc as unknown as { slug?: string })?.slug || ''}`)
  } catch (err) {
    console.error('Error triggering page revalidation:', err)
  }
}

export default pagesAfterChange
