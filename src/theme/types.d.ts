import type { PaletteOptions, ThemeOptions } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface Palette {
    calendly?: {
      primary: string
      contrastText: string
      background: string
    }
  }
  interface PaletteOptions {
    calendly?: {
      primary: string
      contrastText: string
      background: string
    }
  }
}

export type AppThemeOptions = {
  mode?: 'light' | 'dark'
  primary?: string
  secondary?: string
  background?: string
  textPrimary?: string
  calendly?: { primary?: string; contrastText?: string; background?: string }
  rounded?: number
  fontFamily?: string
}

export type AppThemeConfig = ThemeOptions & { palette?: PaletteOptions }
