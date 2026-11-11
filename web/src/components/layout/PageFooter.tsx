import Link from 'next/link';
import { Flex, Layout, Typography } from 'antd';
import { toMobileHref } from '@/lib/app-link';
import { brandTokens } from '@/lib/tokens';

const { Footer } = Layout;
const { Text } = Typography;

export function PageFooter() {
  return (
    <Footer
      style={{
        textAlign: 'center',
        borderTop: `1px solid ${brandTokens.colorBorder}`,
        background: brandTokens.colorBgContainer,
        paddingBottom: 32,
      }}
    >
      <Flex vertical gap={4} align="center">
        <Text type="secondary" style={{ fontSize: 12 }}>
          <Link href="/about" style={{ color: brandTokens.colorTextSecondary }}>
            关于
          </Link>
          {' · '}
          <Link href={toMobileHref('/')} style={{ color: brandTokens.colorTextSecondary }}>
            移动版
          </Link>
          {' · '}
          本文由 AI 辅助摘要，请访问原文获取完整内容
          {' · '}
          © 宁波银行 UED
        </Text>
      </Flex>
    </Footer>
  );
}
