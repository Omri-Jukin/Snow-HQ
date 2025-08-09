import { Button as MuiButton } from '@mui/material'
import { ButtonProps as CustomButtonProps } from './Button.type'
import { GradientButton, NeonButton, GlassButton, BrokenGlassButton } from './Button.style'

export default function Button({
  children,
  variant = 'contained',
  gradient,
  neonColor,
  opacity,
  intensity = 'medium',
  animation = true,
  ...props
}: CustomButtonProps) {
  switch (variant) {
    case 'gradient':
      return (
        <GradientButton gradient={gradient} variant="contained" {...props}>
          {children}
        </GradientButton>
      )
    case 'neon':
      return (
        <NeonButton neonColor={neonColor} opacity={opacity} variant="outlined" {...props}>
          {children}
        </NeonButton>
      )
    case 'glass':
      return (
        <GlassButton intensity={intensity} variant="contained" {...props}>
          <span>{children}</span>
        </GlassButton>
      )
    case 'broken-glass':
      return (
        <BrokenGlassButton
          intensity={intensity}
          animation={animation}
          variant="contained"
          {...props}
        >
          <span>{children}</span>
          <div className="crack-line-1" />
          <div className="crack-line-2" />
          <div className="crack-line-3" />
        </BrokenGlassButton>
      )
    default:
      return (
        <MuiButton
          variant="contained"
          {...props}
          sx={{ color: 'inherit', backgroundColor: 'inherit', border: 'none' }}
        >
          {children}
        </MuiButton>
      )
  }
}
