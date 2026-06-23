'use client';

import { Tag } from 'antd';
import type { SkillCategory } from '@/types';
import { SKILL_CATEGORY_LABELS } from '@/lib/constants';
import { skillCategoryTagStyles } from '@/lib/tokens';

export function SkillCategoryTag({ category }: { category: SkillCategory }) {
  const style = skillCategoryTagStyles[category];
  return (
    <Tag
      variant="filled"
      style={{
        margin: 0,
        width: 'fit-content',
        alignSelf: 'flex-start',
        color: style.color,
        background: style.background,
        fontWeight: 500,
      }}
    >
      {SKILL_CATEGORY_LABELS[category]}
    </Tag>
  );
}
