'use client';

import { Flex, Typography } from 'antd';
import type { ReactNode } from 'react';

const { Title, Text } = Typography;

interface PageHeaderProps {
  title: string;
  description?: string;
  extra?: ReactNode;
}

export function PageHeader({ title, description, extra }: PageHeaderProps) {
  return (
    <Flex vertical gap={4} style={{ marginBottom: 24 }} justify="space-between">
      <Flex align="flex-start" justify="space-between" gap={16}>
        <div>
          <Title level={2} style={{ margin: 0 }} suppressHydrationWarning>
            <span suppressHydrationWarning>{title}</span>
          </Title>
          {description && (
            <Text type="secondary" style={{ fontSize: 15 }}>
              {description}
            </Text>
          )}
        </div>
        {extra}
      </Flex>
    </Flex>
  );
}
