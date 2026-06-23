'use client';

import { Button, Card, Flex, Typography } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { motion, useReducedMotion } from 'framer-motion';
import type { Skill } from '@/types';
import { SkillCategoryTag } from '@/components/SkillCategoryTag';
import { brandTokens } from '@/lib/tokens';
import { getSkillDownload } from '@/lib/skill-utils';

const { Text, Paragraph } = Typography;

export function SkillCard({
  skill,
  onClick,
}: {
  skill: Skill;
  onClick?: () => void;
}) {
  const download = getSkillDownload(skill);
  const prefersReducedMotion = useReducedMotion();

  const baseShadow = '0 1px 2px rgba(0,0,0,0.04)';
  const hoverShadow =
    '0 8px 24px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)';

  const cardContent = (
    <Card
      hoverable={false}
      variant="borderless"
      style={{
        height: '100%',
        borderRadius: brandTokens.borderRadiusLG,
        background: brandTokens.colorBgContainer,
      }}
      styles={{ body: { height: '100%' } }}
    >
      <Flex vertical gap={12} style={{ height: '100%' }}>
        <Flex vertical gap={8} style={{ flex: 1 }}>
          <Text strong style={{ fontSize: 16 }}>
            {skill.name}
          </Text>
          <SkillCategoryTag category={skill.category} />
          <Paragraph
            type="secondary"
            ellipsis={{ rows: 3 }}
            style={{ marginBottom: 0, fontSize: 13 }}
          >
            {skill.introduction}
          </Paragraph>
        </Flex>

        {download && (
          <Button
            size="small"
            icon={<DownloadOutlined />}
            href={download.href}
            download={download.filename}
            target={download.external ? '_blank' : undefined}
            rel={download.external ? 'noopener noreferrer' : undefined}
            onClick={(e) => e.stopPropagation()}
          >
            下载 skill
          </Button>
        )}
      </Flex>
    </Card>
  );

  if (!onClick) {
    return cardContent;
  }

  // Interactive skill card: add same hover lift + shadow animation
  return (
    <motion.div
      whileHover={
        prefersReducedMotion ? {} : { y: -4, boxShadow: hoverShadow }
      }
      whileTap={prefersReducedMotion ? {} : { scale: 0.997 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { type: 'spring', stiffness: 400, damping: 30 }
      }
      onClick={onClick}
      style={{
        borderRadius: brandTokens.borderRadiusLG,
        boxShadow: baseShadow,
        cursor: 'pointer',
      }}
    >
      {cardContent}
    </motion.div>
  );
}
