import {
  Button as MuiButton,
  IconButton as MuiIconButton,
  ButtonBase as MuiButtonBase,
} from '@mui/material'
import { styled } from '@mui/material/styles'

export const StyledButton = styled(MuiButton)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  border: `1px solid ${theme.palette.text.primary}`,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1, 2),
}))

export const StyledButtonIcon = styled(MuiIconButton)(({ theme }) => ({
  marginRight: theme.spacing(1),
}))

export const StyledButtonText = styled(MuiButtonBase)(({ theme }) => ({
  marginRight: theme.spacing(1),
}))

export const RainbowButton = styled(StyledButton)(({ theme }) => ({
  width: '220px',
  height: '50px',
  border: 'none',
  outline: 'none',
  color: theme.palette.text.primary,
  background:
    theme.palette.mode === 'dark'
      ? theme.palette.background.paper
      : theme.palette.background.default,
  cursor: 'pointer',
  position: 'relative',
  zIndex: 0,
  borderRadius: '10px',
  '&:before': {
    content: '""',
    background:
      'linear-gradient(45deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000)',
    position: 'absolute',
    top: '-2px',
    left: '-2px',
    backgroundSize: '400%',
    zIndex: -1,
    filter: 'blur(5px)',
    width: 'calc(100% + 4px)',
    height: 'calc(100% + 4px)',
    animation: 'glowing 20s linear infinite',
    opacity: 0,
    transition: 'opacity .3s ease-in-out',
    borderRadius: '10px',
  },
  '&:active': {
    color: theme.palette.text.primary,
    '&:after': {
      background: 'transparent',
    },
  },
  '&:hover:before': {
    opacity: 1,
    '&:after': {
      background: 'transparent',
    },
  },
  '&:after': {
    zIndex: -1,
    content: '""',
    position: 'absolute',
    width: '100%',
    height: '100%',
    background: theme.palette.background.paper,
    left: '0',
    top: '0',
    borderRadius: '10px',
  },
  '@keyframes glowing': {
    '0%': { backgroundPosition: '0 0' },
    '50%': { backgroundPosition: '400% 0' },
    '100%': { backgroundPosition: '0 0' },
  },
}))

// Styled button variants with props
export const GradientButton = styled(MuiButton, {
  shouldForwardProp: (prop) => prop !== 'gradient',
})<{ gradient?: string }>(({ gradient }) => ({
  background: gradient || 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
  border: 0,
  borderRadius: 25,
  color: 'white',
  padding: '10px 30px',
  boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
  '&:hover': {
    background: gradient || 'linear-gradient(45deg, #ff5252, #26a69a)',
    transform: 'translateY(-2px)',
    boxShadow: '0 5px 15px 2px rgba(255, 105, 135, .4)',
  },
  transition: 'all 0.3s ease',
}))

export const NeonButton = styled(MuiButton, {
  shouldForwardProp: (prop) => prop !== 'neonColor' && prop !== 'opacity',
})<{ neonColor?: string; opacity?: string }>(({ neonColor, opacity }) => {
  const baseColor = neonColor || '#00ff88'
  const opacityValue = opacity ? parseFloat(opacity) : 1

  // Convert hex to rgb for rgba usage
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 255, b: 136 }
  }

  const rgb = hexToRgb(baseColor)
  const colorWithOpacity = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacityValue})`

  return {
    background: 'transparent',
    border: `2px solid ${colorWithOpacity}`,
    borderRadius: 25,
    color: colorWithOpacity,
    padding: '10px 30px',
    textShadow: `0 0 10px ${colorWithOpacity}`,
    boxShadow: `0 0 20px ${colorWithOpacity}`,
    '&:hover': {
      background: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacityValue * 0.1})`,
      border: `2px solid ${colorWithOpacity}`,
      color: colorWithOpacity,
      boxShadow: `0 0 30px ${colorWithOpacity}`,
      transform: 'scale(1.05)',
    },
    transition: 'all 0.3s ease',
  }
})

export const GlassButton = styled(MuiButton, {
  shouldForwardProp: (prop) => prop !== 'intensity',
})<{ intensity?: 'low' | 'medium' | 'high' }>(({ intensity = 'medium' }) => ({
  position: 'relative',
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: 25,
  color: 'white',
  padding: '10px 30px',
  overflow: 'hidden',

  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 30%, rgba(255, 255, 255, 0.1) 31%, transparent 31%),
      linear-gradient(-45deg, transparent 30%, rgba(255, 255, 255, 0.05) 30%, rgba(255, 255, 255, 0.05) 31%, transparent 31%),
      linear-gradient(90deg, transparent 30%, rgba(255, 255, 255, 0.08) 30%, rgba(255, 255, 255, 0.08) 31%, transparent 31%),
      linear-gradient(0deg, transparent 30%, rgba(255, 255, 255, 0.06) 30%, rgba(255, 255, 255, 0.06) 31%, transparent 31%)
    `,
    backgroundSize:
      intensity === 'high'
        ? '20px 20px, 15px 15px, 25px 25px, 18px 18px'
        : intensity === 'medium'
          ? '30px 30px, 25px 25px, 35px 35px, 28px 28px'
          : '40px 40px, 35px 35px, 45px 45px, 38px 38px',
    animation: 'glassShift 8s ease-in-out infinite',
    zIndex: 1,
  },

  '&::after': {
    content: '""',
    position: 'absolute',
    top: '10%',
    left: '15%',
    right: '15%',
    bottom: '10%',
    background: `
      radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.08) 0%, transparent 50%)
    `,
    borderRadius: '20px',
    zIndex: 2,
  },

  '&:hover': {
    background: 'rgba(255, 255, 255, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    transform: 'translateY(-1px)',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
  },

  '& > span': {
    position: 'relative',
    zIndex: 3,
  },

  '@keyframes glassShift': {
    '0%, 100%': {
      transform: 'translateX(0) translateY(0)',
      opacity: 0.8,
    },
    '25%': {
      transform: 'translateX(2px) translateY(-1px)',
      opacity: 0.9,
    },
    '50%': {
      transform: 'translateX(-1px) translateY(2px)',
      opacity: 0.7,
    },
    '75%': {
      transform: 'translateX(1px) translateY(1px)',
      opacity: 0.85,
    },
  },

  transition: 'all 0.3s ease',
}))

export const BrokenGlassButton = styled(MuiButton, {
  shouldForwardProp: (prop) => prop !== 'intensity' && prop !== 'animation',
})<{ intensity?: 'low' | 'medium' | 'high'; animation?: boolean }>(
  ({ intensity = 'medium', animation = true }) => ({
    position: 'relative',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    color: 'white',
    padding: '10px 30px',
    overflow: 'hidden',

    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `
        linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 30%, rgba(255, 255, 255, 0.1) 31%, transparent 31%),
        linear-gradient(-45deg, transparent 30%, rgba(255, 255, 255, 0.05) 30%, rgba(255, 255, 255, 0.05) 31%, transparent 31%),
        linear-gradient(90deg, transparent 30%, rgba(255, 255, 255, 0.08) 30%, rgba(255, 255, 255, 0.08) 31%, transparent 31%),
        linear-gradient(0deg, transparent 30%, rgba(255, 255, 255, 0.06) 30%, rgba(255, 255, 255, 0.06) 31%, transparent 31%)
      `,
      backgroundSize:
        intensity === 'high'
          ? '20px 20px, 15px 15px, 25px 25px, 18px 18px'
          : intensity === 'medium'
            ? '30px 30px, 25px 25px, 35px 35px, 28px 28px'
            : '40px 40px, 35px 35px, 45px 45px, 38px 38px',
      animation: animation ? 'brokenGlassShift 8s ease-in-out infinite' : 'none',
      zIndex: 1,
    },

    '&::after': {
      content: '""',
      position: 'absolute',
      top: '10%',
      left: '15%',
      right: '15%',
      bottom: '10%',
      background: `
        radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.08) 0%, transparent 50%)
      `,
      borderRadius: '20px',
      zIndex: 2,
    },

    '&:hover': {
      background: 'rgba(255, 255, 255, 0.2)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      transform: 'translateY(-1px)',
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
    },

    '& > span': {
      position: 'relative',
      zIndex: 3,
    },

    // Crack lines
    '& .crack-line-1': {
      position: 'absolute',
      top: '20%',
      left: '10%',
      width: '2px',
      height: '60%',
      background: 'linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.3), transparent)',
      transform: 'rotate(15deg)',
      zIndex: 2,
    },

    '& .crack-line-2': {
      position: 'absolute',
      top: '30%',
      right: '20%',
      width: '1px',
      height: '40%',
      background: 'linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.2), transparent)',
      transform: 'rotate(-25deg)',
      zIndex: 2,
    },

    '& .crack-line-3': {
      position: 'absolute',
      top: '60%',
      left: '30%',
      width: '1.5px',
      height: '30%',
      background: 'linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.25), transparent)',
      transform: 'rotate(45deg)',
      zIndex: 2,
    },

    '@keyframes brokenGlassShift': {
      '0%, 100%': {
        transform: 'translateX(0) translateY(0)',
        opacity: 0.8,
      },
      '25%': {
        transform: 'translateX(2px) translateY(-1px)',
        opacity: 0.9,
      },
      '50%': {
        transform: 'translateX(-1px) translateY(2px)',
        opacity: 0.7,
      },
      '75%': {
        transform: 'translateX(1px) translateY(1px)',
        opacity: 0.85,
      },
    },

    transition: 'all 0.3s ease',
  }),
)

// export const CTA2Button = styled(StyledButton)(({ theme }) => ({
//   position: "relative",
//   padding: "1.4rem 4.2rem",
//   paddingRight: "3.1rem",
//   fontSize: "1.4rem",
//   color: theme.palette.text.primary,
//   letterSpacing: "1.1rem",
//   textTransform: "uppercase",
//   transition: "all 500ms cubic-bezier(0.77, 0, 0.175, 1)",
//   cursor: "pointer",
//   userSelect: "none",
//   "&:before, &:after": {
//     content: '""',
//     position: "absolute",
//     transition: "inherit",
//     zIndex: -1,
//   },
//   "&:hover": {
//     color: theme.palette.text.primary,
//     transitionDelay: ".5s",
//   },
//   "&:before": {
//     top: 0,
//     left: "50%",
//     height: "100%",
//     width: 0,
//     border: `1px solid ${theme.palette.text.primary}`,
//     borderLeft: "0",
//     borderRight: "0",
//   },
//   "&:after": {
//     bottom: 0,
//     left: 0,
//     height: 0,
//     width: "100%",
//     background: theme.palette.text.primary,
//   },
//   "&:hover:before": {
//     left: 0,
//     width: "100%",
//   },
//   "&:hover:after": {
//     top: 0,
//     height: "100%",
//   },
// }));
