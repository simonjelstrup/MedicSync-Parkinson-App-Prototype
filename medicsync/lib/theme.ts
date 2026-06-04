export const colors = {
  // Backgrounds
  bg: '#FDF8F3',
  bgCard: '#FFFFFF',
  bgSoft: '#FDF0E4',
  bgPositive: '#EAF3DE',
  bgError: '#FCEDEC',
  bgNeutral: '#F1EFE8',
  bgEat: '#F5FAF0',

  // Primary terracotta
  primary: '#C8914F',
  primaryDark: '#B07845',
  primarySoft: '#E8C49A',
  primaryDarkerText: '#7A4F20',
  primaryDarkestText: '#5C3D1E',
  primaryTextOn: '#FDF8F3',

  // Positive sage
  positive: '#7DAF5A',
  positiveDark: '#27500A',
  positiveMid: '#5A9E35',
  positiveSoft: '#A8CC85',
  positiveText: '#2D4A20',
  positiveSub: '#6B9050',

  // Error red
  error: '#D94F4F',
  errorDark: '#8B1A1A',

  // Text
  textPrimary: '#3D2B1F',
  textSecondary: '#8B6E52',
  textTertiary: '#B07845',
  textMuted: '#5F5E5A',
  textDeep: '#4A3728',

  // Borders
  border: '#EDD9C4',
  borderStrong: '#D0B090',
  borderDivider: '#F0E0CC',
  borderDividerSoft: '#F5EAD8',
} as const;

export const typography = {
  screenTitle: {
    fontSize: 26,
    fontWeight: '700' as const,
    letterSpacing: -0.26,
    fontFamily: 'Manrope_700Bold',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    fontFamily: 'Manrope_600SemiBold',
  },
  body: {
    fontSize: 17,
    fontWeight: '400' as const,
    lineHeight: 26,
    fontFamily: 'Manrope_400Regular',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
    fontFamily: 'Manrope_700Bold',
  },
  helper: {
    fontSize: 14,
    fontWeight: '500' as const,
    fontFamily: 'Manrope_500Medium',
  },
  buttonPrimary: {
    fontSize: 17,
    fontWeight: '700' as const,
    fontFamily: 'Manrope_700Bold',
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    fontFamily: 'Manrope_600SemiBold',
  },
} as const;

export const spacing = {
  screenEdge: 20,
  cardPadding: 18,
  tapMin: 54,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const radii = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  badge: 20,
  full: 9999,
} as const;

export const shadows = {
  card: {
    shadowColor: '#C8914F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sheet: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;
