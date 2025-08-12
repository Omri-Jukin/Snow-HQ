'use server'
import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import React from 'react'
import { fileURLToPath } from 'url'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Link from 'next/link'

import config from '@/payload.config'
import ResumeGenerator from 'Components/ResumeGenerator'
import './styles.css'

export default async function HomePage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers: await getHeaders() })

  const fileURL = `vscode://file/${fileURLToPath(import.meta.url)}`
  const studioUrl = process.env.DEV_NEXT_PUBLIC_STUDIO_URL || '/studio'

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography component="h1" variant="h4" sx={{ mb: 2 }}>
        {user ? `Welcome back, ${user.email}` : 'Welcome to Snow HQ'}
      </Typography>
      <Typography sx={{ mb: 2 }} className="links">
        <Link className="admin" href={payloadConfig.routes.admin} target="_blank">
          Go to admin panel
        </Link>
        {' · '}
        <Link className="admin" href={studioUrl} target="_blank">
          Go to Studio
        </Link>
        {' · '}
        <a
          className="docs"
          href="https://payloadcms.com/docs"
          target="_blank"
          rel="noopener noreferrer"
        >
          Documentation
        </a>
      </Typography>
      <ResumeGenerator />
      <div className="footer" style={{ marginTop: 24 }}>
        <p>Update this page by editing</p>
        <a className="codeLink" href={fileURL}>
          <code>app/(frontend)/page.tsx</code>
        </a>
      </div>
    </Container>
  )
}
