'use client'

import * as React from 'react'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'

const theme = createTheme({})

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
