import type { ThemeConfig } from 'antd';
import { brandTokens } from './tokens';

export const appTheme: ThemeConfig = {
  token: {
    colorPrimary: brandTokens.colorPrimary,
    colorPrimaryHover: brandTokens.colorPrimaryHover,
    colorPrimaryBg: brandTokens.colorPrimaryBg,
    colorPrimaryBorder: brandTokens.colorPrimaryBorder,
    colorBgLayout: brandTokens.colorBgLayout,
    colorBgContainer: brandTokens.colorBgContainer,
    colorBorder: brandTokens.colorBorder,
    colorText: brandTokens.colorText,
    colorTextSecondary: brandTokens.colorTextSecondary,
    colorTextTertiary: brandTokens.colorTextTertiary,
    colorLink: brandTokens.colorPrimary,
    colorLinkHover: brandTokens.colorPrimaryHover,
    borderRadius: brandTokens.borderRadius,
    borderRadiusLG: brandTokens.borderRadiusLG,
    fontFamily:
      '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
    fontSize: 14,
    controlHeight: 36,
  },
  components: {
    Layout: {
      headerHeight: 64,
      headerBg: brandTokens.colorBgContainer,
      bodyBg: brandTokens.colorBgLayout,
      footerBg: brandTokens.colorBgContainer,
      footerPadding: '24px 24px',
    },
    Menu: {
      horizontalItemSelectedColor: brandTokens.colorPrimary,
      itemSelectedColor: brandTokens.colorPrimary,
      itemHoverColor: brandTokens.colorPrimary,
      activeBarHeight: 0,
      activeBarBorderWidth: 0,
      iconMarginInlineEnd: 4,
    },
    Card: {
      paddingLG: 24,
      borderRadiusLG: brandTokens.borderRadiusLG,
    },
    Button: {
      primaryShadow: 'none',
      defaultShadow: 'none',
      fontWeight: 500,
    },
    Tabs: {
      inkBarColor: brandTokens.colorPrimary,
      itemSelectedColor: brandTokens.colorPrimary,
      itemHoverColor: brandTokens.colorPrimaryHover,
    },
    Tag: {
      defaultBg: brandTokens.colorPrimaryBg,
    },
    Typography: {
      titleMarginBottom: '0.5em',
      titleMarginTop: 0,
    },
  },
};
