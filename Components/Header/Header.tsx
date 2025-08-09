'use client'
import { Box, Typography } from '@mui/material'
import { AppBar, Toolbar } from './Header.style'
import Image from 'next/image'
import Logo from '../../Images/logo-3d.png'
import Link from 'next/link'

export default function Header({ children }: { children: React.ReactNode }) {
  return (
    <AppBar position="fixed" color="transparent" elevation={0} dir="ltr">
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link href="/" aria-label="Home">
            <Image src={Logo} alt="Logo" width={48} height={48} />
          </Link>
          <Typography variant="h6">{children}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Theme toggle can be wired later with a client island */}
        </Box>
      </Toolbar>
    </AppBar>
  )
}
