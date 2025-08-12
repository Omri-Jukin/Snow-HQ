import { Box, Button, Stack, Typography } from '@mui/material'

export default function APIDocsHome() {
  return (
    <Box id="api-docs-home" sx={{ p: 6, textAlign: 'center' }}>
      <Stack spacing={2} alignItems="center">
        <Typography id="api-docs-title" variant="h3" fontWeight={800}>
          Snow API Docs
        </Typography>
        <Typography id="api-docs-sub" variant="h6" color="text.secondary">
          OpenAPI UI placeholder. Replace content later.
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button id="api-docs-cta" variant="contained">
            Open Spec
          </Button>
          <Button id="api-docs-examples" variant="outlined">
            Examples
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
