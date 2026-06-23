'use client';

import Link from 'next/link';
import { Button, Flex, Typography } from 'antd';
import { motion, useReducedMotion } from 'framer-motion';
import type { IssueSummary } from '@/types';
import { buildArchiveStatsText } from '@/lib/home-utils';
import { brandTokens } from '@/lib/tokens';

const { Text } = Typography;

interface HomeArchiveCTAProps {
  issue: IssueSummary;
}

export function HomeArchiveCTA({ issue }: HomeArchiveCTAProps) {
  const statsText = buildArchiveStatsText(
    issue.article_count,
    issue.category_counts,
  );
  const prefersReducedMotion = useReducedMotion();

  return (
    <Flex
      vertical
      align="center"
      gap={24}
      style={{ paddingTop: 20, width: '100%' }}
    >
      <Link href="/archive" style={{ textDecoration: 'none' }}>
        <motion.div
          whileHover={prefersReducedMotion ? {} : { scale: 1.015 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { type: 'spring', stiffness: 420, damping: 28 }
          }
          style={{ display: 'inline-block' }}
        >
          <Button
            type="primary"
            size="large"
            style={{
              width: 280,
              height: 52,
              fontSize: 16,
              borderRadius: brandTokens.borderRadius,
            }}
          >
            查看全部归档
          </Button>
        </motion.div>
      </Link>
      <Text
        style={{
          fontSize: 12,
          lineHeight: '20px',
          color: brandTokens.colorTextMuted,
          textAlign: 'center',
        }}
      >
        {statsText}
      </Text>
    </Flex>
  );
}
