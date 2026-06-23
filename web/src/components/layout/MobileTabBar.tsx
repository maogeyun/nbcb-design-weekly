'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Flex, Typography } from 'antd';
import {
  BookOutlined,
  FileSearchOutlined,
  FolderOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { brandTokens } from '@/lib/tokens';

const { Text } = Typography;

const TABS = [
  { key: '/weekly/current', label: '周刊', icon: BookOutlined },
  { key: '/search', label: '搜索', icon: FileSearchOutlined },
  { key: '/archive', label: '归档', icon: FolderOutlined },
  { key: '/skills', label: '技能', icon: ThunderboltOutlined },
  { key: '/about', label: '关于', icon: InfoCircleOutlined },
];

export function MobileTabBar({ latestIssueId }: { latestIssueId?: string | null }) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (key: string) => {
    if (key === '/weekly/current') {
      if (pathname === '/' || pathname === '/weekly/current') {
        return true;
      }
      const weeklyMatch = pathname.match(/^\/weekly\/([^/?#]+)/);
      if (weeklyMatch && latestIssueId && weeklyMatch[1] === latestIssueId) {
        return true;
      }
      return false;
    }
    return pathname === key || pathname.startsWith(key);
  };

  return (
    <nav
      className="mobile-tab-bar"
      style={{
        display: 'none',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 56,
        background: brandTokens.colorBgContainer,
        borderTop: `1px solid ${brandTokens.colorBorder}`,
        zIndex: 100,
      }}
    >
      <Flex style={{ height: '100%' }}>
        {TABS.map((tab) => {
          const active = isActive(tab.key);
          const Icon = tab.icon;
          return (
            <Flex
              key={tab.key}
              vertical
              align="center"
              justify="center"
              gap={2}
              flex={1}
              onClick={() => {
                if (tab.key === '/weekly/current') {
                  router.push('/');
                  return;
                }
                router.push(tab.key);
              }}
              style={{ cursor: 'pointer' }}
            >
              <Icon
                style={{
                  fontSize: 18,
                  color: active ? brandTokens.colorPrimary : brandTokens.colorTextTertiary,
                }}
              />
              <Text
                style={{
                  fontSize: 11,
                  color: active ? brandTokens.colorPrimary : brandTokens.colorTextTertiary,
                }}
              >
                {tab.label}
              </Text>
            </Flex>
          );
        })}
      </Flex>
    </nav>
  );
}
