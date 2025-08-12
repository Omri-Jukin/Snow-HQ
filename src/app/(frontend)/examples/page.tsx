import { Box, Card, CardContent, CardMedia, Stack, Typography } from '@mui/material'

export default function ExamplesPage() {
  return (
    <Box id="page-examples" sx={{ p: 6 }}>
      <Stack id="examples-hero" spacing={1} sx={{ mb: 4, textAlign: 'center' }}>
        <Typography id="examples-title" variant="h3" fontWeight={800}>
          Examples
        </Typography>
        <Typography id="examples-sub" variant="h6" color="text.secondary">
          Browse generated sites. Replace images and links later.
        </Typography>
      </Stack>
      <Box
        id="examples-grid"
        sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3 }}
      >
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <Card key={n} id={`examples-card-${n}`} sx={{ height: '100%' }}>
            <CardMedia
              id={`examples-card-${n}-media`}
              component="img"
              image={`https://picsum.photos/seed/${n}/800/400`}
              alt={`Example ${n}`}
              height={160}
            />
            <CardContent>
              <Typography id={`examples-card-${n}-title`} variant="subtitle1" fontWeight={700}>
                Example {n}
              </Typography>
              <Typography id={`examples-card-${n}-desc`} color="text.secondary">
                A brief description to be replaced later.
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  )
}
