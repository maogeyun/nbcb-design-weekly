'use client';

import { Tag } from 'antd';
import type { ArticleCategory } from '@/types';
import { CATEGORY_LABELS } from '@/lib/constants';
import { categoryTagStyles } from '@/lib/tokens';

export function CategoryTag({ category }: { category: ArticleCategory }) {
  const style = categoryTagStyles[category];
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
      {CATEGORY_LABELS[category]}
    </Tag>
  );
}
