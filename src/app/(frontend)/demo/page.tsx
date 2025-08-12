import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material'

export default function DemoPage() {
  return (
    <Box id="page-demo" sx={{ p: 6 }}>
      <Stack id="demo-hero" spacing={1} sx={{ mb: 4, textAlign: 'center' }}>
        <Typography id="demo-title" variant="h3" fontWeight={800}>
          Live Demos
        </Typography>
        <Typography id="demo-sub" variant="h6" color="text.secondary">
          Explore interactive previews. Replace with your content later.
        </Typography>
      </Stack>
      <Card id="demo-card" sx={{ maxWidth: 1200, mx: 'auto' }}>
        <CardContent>
          <Typography id="demo-card-title" variant="h6" fontWeight={700} gutterBottom>
            Embedded Preview
          </Typography>
          <Box
            id="demo-embed"
            sx={{
              aspectRatio: '16 / 9',
              width: '100%',
              bgcolor: 'background.default',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          />
          <Stack id="demo-actions" direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button id="demo-open" variant="contained">
              Open
            </Button>
            <Button id="demo-docs" variant="outlined">
              Docs
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
