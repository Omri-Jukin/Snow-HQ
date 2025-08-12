import React from 'react'
import './styles.css'
import Header from 'Components/Header'
import Footer from 'Components/Footer'
import ThemeRegistry from '@/app/ThemeRegistry'
import Link from 'next/link'

export const metadata = {
  description: 'A blank template using Payload in a Next.js app.',
  title: 'Payload Blank Template',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <Header>Omri Jukin</Header>
          <nav className="main-nav" style={{ marginTop: 72, padding: '0 24px' }}>
            <Link href="/demo">Demo</Link>
            <Link href="/templates">Templates</Link>
            <Link href="/docs">Docs</Link>
            <Link href="/examples">Examples</Link>
            <Link href="/pricing">Pricing</Link>
          </nav>
          <main>{children}</main>
          <Footer />
        </ThemeRegistry>
      </body>
    </html>
  )
}
