export type ThemeName = 'light' | 'dark' | 'neon' | 'minimal' | 'experimental'

export const THEMES: ThemeName[] = ['dark', 'light', 'neon', 'minimal', 'experimental']

export const themeTokens: Record<ThemeName, Record<string, string>> = {
  dark: {
    '--bg': '#07050d',
    '--bg-elevated': '#120b21',
    '--fg': '#f5f0ff',
    '--fg-muted': '#b9aecf',
    '--accent': '#9b5fd6',
    '--accent-soft': '#c69af6',
    '--line': 'rgba(255,255,255,0.12)',
  },
  light: {
    '--bg': '#f9f6ff',
    '--bg-elevated': '#f0e8ff',
    '--fg': '#170f2a',
    '--fg-muted': '#594d72',
    '--accent': '#7f41d8',
    '--accent-soft': '#a77bf0',
    '--line': 'rgba(23,15,42,0.16)',
  },
  neon: {
    '--bg': '#060016',
    '--bg-elevated': '#12003b',
    '--fg': '#f5ecff',
    '--fg-muted': '#b8a7ff',
    '--accent': '#a100ff',
    '--accent-soft': '#00e5ff',
    '--line': 'rgba(161,0,255,0.4)',
  },
  minimal: {
    '--bg': '#111111',
    '--bg-elevated': '#1a1a1a',
    '--fg': '#f2f2f2',
    '--fg-muted': '#b9b9b9',
    '--accent': '#9d7cff',
    '--accent-soft': '#d0c1ff',
    '--line': 'rgba(255,255,255,0.15)',
  },
  experimental: {
    '--bg': '#15041f',
    '--bg-elevated': '#260a35',
    '--fg': '#fff4fb',
    '--fg-muted': '#ebb8da',
    '--accent': '#f24eb4',
    '--accent-soft': '#9a7eff',
    '--line': 'rgba(242,78,180,0.35)',
  },
}

export const spacingScale = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
}
