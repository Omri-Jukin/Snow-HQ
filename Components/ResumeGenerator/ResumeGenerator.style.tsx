'use client'
import { styled } from '@mui/material/styles'
import { Box, Divider } from '@mui/material'

export const Root = styled(Box)(({ theme }) => ({
  background: 'transparent',
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: theme.spacing(2),
  maxWidth: 960,
  margin: '0 auto',
  padding: theme.spacing(2),
}))

export const Row = styled(Box)(({ theme }) => ({
  background: 'transparent',
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}))

export const Preview = styled(Box)(({ theme }) => ({
  background: 'transparent',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  minHeight: 240,
  maxHeight: 300,
  overflow: 'auto',
}))

export const Panel = styled(Box)(({ theme }) => ({
  background: 'transparent',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}))

export const PanelBody = styled(Box)(({ theme }) => ({
  background: 'transparent',
  padding: theme.spacing(2),
}))

export const PanelHeader = styled(Box)(({ theme }) => ({
  background: 'transparent',
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}))

export const Label = styled('label')(({ theme }) => ({
  background: 'transparent',
  fontWeight: 600,
  color: theme.palette.text.secondary,
}))

export const TextArea = styled('textarea')(({ theme }) => ({
  background: 'transparent',
  width: '100%',
  minHeight: 160,
  padding: theme.spacing(1.25),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  color: theme.palette.text.primary,
  resize: 'vertical',
}))

export const SelectEl = styled('select')(({ theme }) => ({
  background: 'transparent',
  width: '100%',
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  color: theme.palette.text.primary,
}))

export const Field = styled(Box)(({ theme }) => ({
  background: 'transparent',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}))

export const Separator = styled(Divider)(({ theme }) => ({
  background: 'transparent',
  margin: `${theme.spacing(2)} 0`,
}))
