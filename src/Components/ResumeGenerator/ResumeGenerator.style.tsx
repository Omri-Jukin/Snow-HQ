'use client'
import { styled } from '@mui/material/styles'
import { Box } from '@mui/material'

export const Root = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: theme.spacing(2),
  maxWidth: 960,
  margin: '0 auto',
  padding: theme.spacing(2),
}))

export const Row = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}))

export const Preview = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  minHeight: 240,
  background: theme.palette.background.paper,
  overflow: 'auto',
}))
