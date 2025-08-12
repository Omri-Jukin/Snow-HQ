import { Avatar, Box, Button, Stack, Typography } from '@mui/material'

export default function PortfolioHome() {
  return (
    <Box id="portfolio-home" sx={{ p: 6, textAlign: 'center' }}>
      <Stack spacing={2} alignItems="center">
        <Avatar id="portfolio-avatar" sx={{ width: 96, height: 96 }} />
        <Typography id="portfolio-title" variant="h4" fontWeight={800}>
          Portfolio
        </Typography>
        <Typography id="portfolio-sub" variant="h6" color="text.secondary">
          Personal showcase coming soon.
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button id="portfolio-projects" variant="contained">
            Projects
          </Button>
          <Button id="portfolio-contact" variant="outlined">
            Contact
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
