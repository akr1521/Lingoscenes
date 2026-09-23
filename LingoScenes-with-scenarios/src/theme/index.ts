export const colors = {
  bg: '#FFFFFF',
  bgWarm: '#F4FBFC',
  bgElevated: '#E8F6F7',
  surface: '#FFFFFF',
  surfaceAlt: '#F5F7FA',
  border: '#D5E8EA',
  borderLight: '#E8F2F3',

  // Seedlang-inspired teal / cyan
  primary: '#00B4C8',
  primaryDark: '#0891A0',
  primaryLight: '#7EE8F0',
  primaryBg: '#E6FAFC',
  secondary: '#0B2C4A',
  secondaryDark: '#071E33',
  secondaryLight: '#1A4A6E',
  navy: '#0A1B33',
  navyMid: '#123055',
  teal: '#00C4C9',
  tealDeep: '#0E8A99',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  success: '#14B8A6',
  successLight: '#CCFBF1',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',

  textPrimary: '#1F2937',
  textSecondary: '#5B6B7A',
  textMuted: '#8A9AA8',
  textInverse: '#FFFFFF',

  overlay: 'rgba(0, 0, 0, 0.5)',
  inputBorder: '#D1D5DB',
  buttonDisabled: '#D1D5DB',
} as const;

export const gradient = {
  landing: ['#12C4C9', '#0AA7B8', '#0B8FA8'] as const,
  landingLocations: [0, 0.45, 1] as const,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  card: 28,
  full: 999,
} as const;

export const typography = {
  h1: { fontSize: 28, fontWeight: '800' as const, color: colors.textPrimary, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700' as const, color: colors.textPrimary, letterSpacing: -0.3 },
  h3: { fontSize: 17, fontWeight: '600' as const, color: colors.textPrimary },
  body: { fontSize: 16, fontWeight: '400' as const, color: colors.textPrimary, lineHeight: 24 },
  bodyMuted: { fontSize: 15, fontWeight: '400' as const, color: colors.textSecondary, lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: '500' as const, color: colors.textMuted },
  button: { fontSize: 16, fontWeight: '700' as const, color: colors.textInverse, letterSpacing: 0.4 },
  buttonSecondary: { fontSize: 16, fontWeight: '700' as const, color: colors.primary },
  hero: { fontSize: 34, fontWeight: '800' as const, color: colors.textInverse, letterSpacing: -0.6, textAlign: 'center' as const },
};

export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
};
