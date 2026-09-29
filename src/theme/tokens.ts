/**
 * Aquafort Mobile - Design Tokens
 * 
 * Single source of truth for colors, spacing, typography, border radius, shadows.
 * Aligned with the dark theme used across the app (#0f172a background, #0ea5e9 primary).
 */

// ─────────────────────────────────────────────────────────────────────────────
// Colors
// ─────────────────────────────────────────────────────────────────────────────

export const colors = {
  // Brand / Primary
  primary: {
    50: '#e0f2fe',
    100: '#bae6fd',
    200: '#7dd3fc',
    300: '#38bdf8',
    400: '#0ea5e9',  // Main primary
    500: '#0284c7',
    600: '#0369a1',
    700: '#075985',
    800: '#0c4a6e',
    900: '#082f49',
  },

  // Semantic - Status (for O₂ semaphore, etc.)
  success: {
    light: '#22c55e',
    dark: '#16a34a',
  },
  warning: {
    light: '#f59e0b',
    dark: '#d97706',
  },
  error: {
    light: '#ef4444',
    dark: '#dc2626',
  },

  // Neutral / Surface (Dark theme)
  neutral: {
    0: '#ffffff',
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },

  // Surface aliases for dark theme
  surface: {
    background: '#0f172a',      // neutral.900
    card: '#1e293b',            // neutral.800
    cardHover: '#334155',       // neutral.700
    border: '#334155',          // neutral.700
    borderFocus: '#0ea5e9',     // primary.400
  },

  // Text colors (dark theme)
  text: {
    primary: '#ffffff',         // neutral.0
    secondary: '#94a3b8',       // neutral.400
    muted: '#64748b',           // neutral.500
    inverse: '#0f172a',         // neutral.900
    onPrimary: '#ffffff',
    onError: '#ffffff',
    onSuccess: '#ffffff',
    onWarning: '#0f172a',
  },

  // Status badge backgrounds (with opacity for badges)
  badge: {
    success: 'rgba(34, 197, 94, 0.12)',
    successBorder: 'rgba(34, 197, 94, 0.3)',
    successText: '#22c55e',
    warning: 'rgba(245, 158, 11, 0.12)',
    warningBorder: 'rgba(245, 158, 11, 0.3)',
    warningText: '#f59e0b',
    error: 'rgba(239, 68, 68, 0.12)',
    errorBorder: 'rgba(239, 68, 68, 0.3)',
    errorText: '#ef4444',
    info: 'rgba(14, 165, 233, 0.12)',
    infoBorder: 'rgba(14, 165, 233, 0.3)',
    infoText: '#0ea5e9',
  },

  // Overlay / Scrim
  overlay: {
    backdrop: 'rgba(0, 0, 0, 0.5)',
    modal: 'rgba(0, 0, 0, 0.7)',
  },

  // Phase colors (biometrics)
  phase: {
    preBercario: '#6366f1',   // indigo
    bercario: '#0f766e',      // teal
    engorda: '#0ea5e9',       // sky
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Spacing
// ─────────────────────────────────────────────────────────────────────────────

export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Typography
// ─────────────────────────────────────────────────────────────────────────────

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 11,
    sm: 12,
    base: 14,
    lg: 15,
    xl: 16,
    '2xl': 18,
    '3xl': 20,
    '4xl': 24,
    '5xl': 32,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '800',
  },
  lineHeight: {
    tight: 1.1,
    snug: 1.25,
    normal: 1.5,
    relaxed: 1.625,
  },
  letterSpacing: {
    tighter: -0.02,
    tight: -0.01,
    normal: 0,
    wide: 0.01,
    wider: 0.02,
    widest: 0.08,
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Border Radius
// ─────────────────────────────────────────────────────────────────────────────

export const borderRadius = {
  none: 0,
  sm: 4,
  base: 6,
  md: 8,
  lg: 10,
  xl: 12,
  '2xl': 16,
  full: 9999,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Shadows (for elevation)
// ─────────────────────────────────────────────────────────────────────────────

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
    elevation: 2,
  },
  base: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 16,
  },
  // Primary-colored shadows for FABs, etc.
  primary: {
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  success: {
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  error: {
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Breakpoints (for reference)
// ─────────────────────────────────────────────────────────────────────────────

export const breakpoints = {
  sm: 375,   // iPhone SE / small phones
  md: 428,   // iPhone 14 Pro
  lg: 768,   // Tablet
  xl: 1024,  // Desktop
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Z-Index
// ─────────────────────────────────────────────────────────────────────────────

export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modalBackdrop: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
  toast: 800,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Transitions / Animation
// ─────────────────────────────────────────────────────────────────────────────

export const transitions = {
  fast: 150,
  base: 200,
  slow: 300,
  slower: 400,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Theme object (for ThemeProvider)
// ─────────────────────────────────────────────────────────────────────────────

export const theme = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  breakpoints,
  zIndex,
  transitions,
} as const;

export type Theme = typeof theme;
export type Colors = typeof colors;
export type Spacing = typeof spacing;
export type Typography = typeof typography;
export type BorderRadius = typeof borderRadius;
export type Shadows = typeof shadows;