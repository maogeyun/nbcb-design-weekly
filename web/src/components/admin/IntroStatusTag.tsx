'use client';

import { Tag } from 'antd';
import type { Article } from '@/types';
import { getIntroStatus } from '@/lib/candidate-filters';
import { introStatusTagStyles } from '@/lib/tokens';

export function IntroStatusTag({ article }: { article: Article }) {
  const status = getIntroStatus(article);
  const style = introStatusTagStyles[status];

  return (
    <Tag
      variant="filled"
      style={{
        margin: 0,
        color: style.color,
        background: style.background,
        fontWeight: 500,
        border: 'none',
      }}
    >
      {style.label}
    </Tag>
  );
}
