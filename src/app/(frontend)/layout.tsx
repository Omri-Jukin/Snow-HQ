import React from 'react'
import './styles.css'
import Header from 'Components/Header'
import Footer from 'Components/Footer'
import ThemeRegistry from '@/app/ThemeRegistry'

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
          <main>{children}</main>
          <Footer />
        </ThemeRegistry>
      </body>
    </html>
  )
}
