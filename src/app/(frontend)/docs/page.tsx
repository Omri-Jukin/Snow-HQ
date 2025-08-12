import { Box, Button, Card, CardActions, CardContent, Stack, Typography } from '@mui/material'

export default function DocsPage() {
  return (
    <Box id="page-docs" sx={{ p: 6, display: 'grid', gap: 4, placeItems: 'center' }}>
      <Stack
        id="docs-hero"
        alignItems="center"
        spacing={2}
        sx={{ textAlign: 'center', maxWidth: 900 }}
      >
        <Typography id="docs-title" variant="h3" fontWeight={800}>
          Documentation
        </Typography>
        <Typography id="docs-sub" variant="h6" color="text.secondary">
          Discover how to use SnowHQ components and APIs. Replace this copy later with your content.
        </Typography>
        <Stack id="docs-cta" direction="row" spacing={2}>
          <Button id="docs-get-started" variant="contained" color="primary" size="large">
            Get started
          </Button>
          <Button id="docs-api-ref" variant="outlined" color="primary" size="large">
            API Reference
          </Button>
        </Stack>
      </Stack>
      <Stack
        id="docs-cards"
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        sx={{ width: '100%', maxWidth: 1200 }}
      >
        {[
          { id: 'guide', title: 'Guides', body: 'Step-by-step recipes to integrate SnowHQ.' },
          { id: 'concepts', title: 'Concepts', body: 'Understand core ideas and data flows.' },
          { id: 'examples', title: 'Examples', body: 'Practical samples to kickstart quickly.' },
        ].map((c) => (
          <Card key={c.id} id={`docs-card-${c.id}`} sx={{ flex: 1 }}>
            <CardContent>
              <Typography id={`docs-card-${c.id}-title`} variant="h6" fontWeight={700} gutterBottom>
                {c.title}
              </Typography>
              <Typography id={`docs-card-${c.id}-body}`} color="text.secondary">
                {c.body}
              </Typography>
            </CardContent>
            <CardActions>
              <Button id={`docs-card-${c.id}-action`} size="small">
                Explore
              </Button>
            </CardActions>
          </Card>
        ))}
      </Stack>
    </Box>
  )
}
