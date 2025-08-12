import { createTheme } from '@mui/material/styles'
import type { AppThemeOptions, AppThemeConfig } from './types'

export function createAppTheme(options: AppThemeOptions = {}) {
  const resolvedMode: 'light' | 'dark' = options.mode ?? 'dark'
  const resolvedPrimary = options.primary ?? '#1976d2'
  const resolvedSecondary = options.secondary ?? '#9c27b0'
  const resolvedBackground = options.background ?? (resolvedMode === 'dark' ? '#0c0c0c' : '#ffffff')
  const resolvedTextPrimary =
    options.textPrimary ?? (resolvedMode === 'dark' ? '#ffffff' : '#111111')
  const resolvedCalendly = options.calendly ?? {}
  const resolvedRounded = options.rounded ?? 10
  const resolvedFontFamily =
    options.fontFamily ?? 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif'

  const cfg: AppThemeConfig = {
    palette: {
      mode: resolvedMode,
      primary: { main: resolvedPrimary },
      secondary: { main: resolvedSecondary },
      background: { default: resolvedBackground, paper: resolvedBackground },
      text: { primary: resolvedTextPrimary },
      calendly: {
        primary: resolvedCalendly.primary || '#4ECDC4',
        contrastText: resolvedCalendly.contrastText || '#ffffff',
        background:
          resolvedCalendly.background || (resolvedMode === 'dark' ? '#0c0c0c' : '#ffffff'),
      },
    },
    shape: { borderRadius: resolvedRounded },
    typography: { fontFamily: resolvedFontFamily },
  }

  return createTheme(cfg)
}
