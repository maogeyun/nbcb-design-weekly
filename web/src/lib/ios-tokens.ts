import { brandTokens } from '@/lib/tokens';

/** iOS 27 semantic tokens — aligned with ios-27-design skill */
export const iosTokens = {
  accentBrand: brandTokens.colorPrimary,
  accentBrandBg: brandTokens.colorPrimaryBg,

  labelPrimary: '#000000',
  labelSecondary: 'rgba(60, 60, 67, 0.6)',
  labelTertiary: 'rgba(60, 60, 67, 0.3)',
  labelQuaternary: 'rgba(60, 60, 67, 0.18)',
  vibrantPrimary: '#1A1A1A',

  bgGrouped: '#F2F2F7',
  bgCell: '#FFFFFF',
  bgElevated: '#FFFFFF',

  separator: 'rgba(60, 60, 67, 0.29)',
  separatorOpaque: 'rgba(198, 198, 200, 1)',
  fillTertiary: 'rgba(118, 118, 128, 0.12)',
  fillQuaternary: 'rgba(116, 116, 128, 0.08)',

  glassBg: 'rgba(255, 255, 255, 0.72)',
  glassBorder: 'rgba(255, 255, 255, 0.4)',
  glassBlur: 'blur(20px) saturate(180%)',
  glassShadow: '0 8px 15px rgba(0, 0, 0, 0.02)',

  tabBarZone: 70,
  tabBarCapsuleHeight: 54,
  tabSelectionPill: '#EDEDED',
  tabBarInset: 8,

  sheetRadiusTop: 38,
  grabberWidth: 58,
  grabberHeight: 4,
  sheetOverlay: 'rgba(0, 0, 0, 0.2)',

  segmentedTrack: 'rgba(118, 118, 128, 0.12)',
  segmentedSelectedShadow: '0 2px 10px rgba(0, 0, 0, 0.06)',

  radiusCapsule: 1000,
  radiusCard: 12,
  radiusSearch: 10,

  fontFamily:
    '-apple-system, "SF Pro Text", "SF Pro Display", "PingFang SC", "Noto Sans SC", sans-serif',

  fontSizeLargeTitle: 34,
  fontWeightLargeTitle: 400,
  fontSizeTitle2: 22,
  fontSizeHeadline: 17,
  fontSizeBody: 17,
  fontSizeSubhead: 15,
  fontSizeFootnote: 13,
  fontSizeCaption2: 10,
  fontSizeTabIcon: 18,

  lineHeightLargeTitle: 41,
  lineHeightTitle2: 28,
  lineHeightBody: 22,
  letterSpacingLargeTitle: 0.37,
  letterSpacingBody: -0.43,

  navBarHeight: 44,
  minTouchTarget: 44,
  listRowMinHeight: 52,
  contentPaddingX: 16,
  groupedInsetMargin: 16,
  sectionGap: 24,

  buttonProminentHeight: 50,
} as const;

export const iosDarkTokens = {
  labelPrimary: '#FFFFFF',
  labelSecondary: 'rgba(235, 235, 245, 0.6)',
  labelTertiary: 'rgba(235, 235, 245, 0.3)',
  labelQuaternary: 'rgba(235, 235, 245, 0.18)',
  vibrantPrimary: '#FFFFFF',

  bgGrouped: '#000000',
  bgCell: '#1C1C1E',
  bgElevated: '#1C1C1E',

  separator: 'rgba(84, 84, 88, 0.65)',
  fillTertiary: 'rgba(118, 118, 128, 0.24)',
  fillQuaternary: 'rgba(118, 118, 128, 0.18)',

  glassBg: 'rgba(44, 44, 46, 0.82)',
  glassBorder: 'rgba(84, 84, 88, 0.65)',
  tabSelectionPill: 'rgba(120, 120, 128, 0.32)',
} as const;
