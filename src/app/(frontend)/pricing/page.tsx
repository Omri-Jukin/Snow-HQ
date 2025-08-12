import { Box, Button, Card, CardActions, CardContent, Stack, Typography } from '@mui/material'

export default function PricingPage() {
  const tiers = [
    { id: 'free', name: 'Free', price: '$0', features: ['Basic templates', 'Community support'] },
    {
      id: 'pro',
      name: 'Pro',
      price: '$19',
      features: ['All templates', 'Priority support', 'Revalidation hooks'],
    },
    {
      id: 'team',
      name: 'Team',
      price: '$49',
      features: ['Seats', 'Shared analytics', 'Early access'],
    },
  ]
  return (
    <Box id="page-pricing" sx={{ p: 6 }}>
      <Stack id="pricing-hero" spacing={1} sx={{ mb: 4, textAlign: 'center' }}>
        <Typography id="pricing-title" variant="h3" fontWeight={800}>
          Pricing
        </Typography>
        <Typography id="pricing-sub" variant="h6" color="text.secondary">
          Pick a plan. You can edit all copy later.
        </Typography>
      </Stack>
      <Box
        id="pricing-grid"
        sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}
      >
        {tiers.map((t) => (
          <Card key={t.id} id={`pricing-card-${t.id}`} sx={{ height: '100%' }}>
            <CardContent>
              <Typography id={`pricing-card-${t.id}-name`} variant="h5" fontWeight={800}>
                {t.name}
              </Typography>
              <Typography
                id={`pricing-card-${t.id}-price`}
                variant="h4"
                color="primary"
                sx={{ my: 1 }}
              >
                {t.price}
              </Typography>
              <Stack id={`pricing-card-${t.id}-features`} spacing={0.5}>
                {t.features.map((f, i) => (
                  <Typography
                    key={i}
                    id={`pricing-card-${t.id}-feature-${i}`}
                    color="text.secondary"
                  >
                    {f}
                  </Typography>
                ))}
              </Stack>
            </CardContent>
            <CardActions>
              <Button id={`pricing-card-${t.id}-cta`} fullWidth variant="contained">
                Choose {t.name}
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>
    </Box>
  )
}
