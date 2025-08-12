'use client'

import * as React from 'react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { createAppTheme } from '@/theme'

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const theme = React.useMemo(
    () =>
      createAppTheme({
        mode: (process.env.NEXT_PUBLIC_THEME_MODE as 'light' | 'dark') || 'dark',
        primary: process.env.NEXT_PUBLIC_THEME_PRIMARY || undefined,
        secondary: process.env.NEXT_PUBLIC_THEME_SECONDARY || undefined,
        background: process.env.NEXT_PUBLIC_THEME_BG || undefined,
        textPrimary: process.env.NEXT_PUBLIC_THEME_TEXT || undefined,
      }),
    [],
  )
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
