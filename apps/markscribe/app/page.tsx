import { Box, Button, Stack, Typography } from '@mui/material'

export default function MarkscribeHome() {
  return (
    <Box id="markscribe-home" sx={{ p: 6, textAlign: 'center' }}>
      <Stack spacing={2} alignItems="center">
        <Typography id="markscribe-title" variant="h3" fontWeight={800}>
          SnowScribe
        </Typography>
        <Typography id="markscribe-sub" variant="h6" color="text.secondary">
          Markdown → DOCX conversion coming soon. Replace text later.
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button id="markscribe-cta" variant="contained">
            Try Converter
          </Button>
          <Button id="markscribe-docs" variant="outlined">
            Docs
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
