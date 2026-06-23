/** NBCB / Coffer 品牌令牌（与 theme.ts 对齐） */
export const brandTokens = {
  colorPrimary: '#FFA62F',
  colorPrimaryHover: '#E5952A',
  colorPrimaryBg: '#FFF6EA',
  colorPrimaryBorder: '#FFD397',
  colorBgLayout: '#F7F7F9',
  colorBgContainer: '#FFFFFF',
  colorBorder: '#E9E9E9',
  colorText: '#222222',
  colorTextSecondary: '#555555',
  colorTextTertiary: '#999999',
  colorSuccessBg: '#F0FDF4',
  colorSuccess: '#14532D',
  colorInfoBg: '#EFF6FF',
  colorInfo: '#1890FF',
  borderRadius: 8,
  borderRadiusLG: 12,
  borderRadiusXL: 16,
  /** 周刊/文章等阅读页内容区最大宽度 */
  contentMaxWidth: 900,
  /** 首页、顶栏等宽幅布局最大宽度 */
  layoutMaxWidth: 1280,
  colorBorderSecondary: '#F0F0F0',
  colorHeroBg: '#F5F5F5',
  colorTextMuted: '#888888',
} as const;

export const categoryTagStyles = {
  ui_design: {
    color: '#CC8524',
    background: '#FFF6EA',
  },
  design_experience: {
    color: '#14532D',
    background: '#F0FDF4',
  },
  ai_frontier: {
    color: '#1890FF',
    background: '#EFF6FF',
  },
} as const;

export const skillCategoryTagStyles = {
  requirements_analysis: {
    color: '#B45309',
    background: '#FFF6EA',
  },
  user_analysis: {
    color: '#7C3AED',
    background: '#F3E8FF',
  },
  solution_design: {
    color: '#0891B2',
    background: '#ECFEFF',
  },
  design_acceptance: {
    color: '#14532D',
    background: '#F0FDF4',
  },
  effect_validation: {
    color: '#BE185D',
    background: '#FDF2F8',
  },
} as const;
