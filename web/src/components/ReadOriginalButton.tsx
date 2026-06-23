'use client';

import { Button, Tooltip } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import type { LinkStatus } from '@/types';

interface ReadOriginalButtonProps {
  url: string;
  linkStatus: LinkStatus;
  articleId?: string;
  size?: 'small' | 'middle' | 'large';
  block?: boolean;
  label?: string;
  showIcon?: boolean;
}

export function ReadOriginalButton({
  url,
  linkStatus,
  articleId,
  size = 'middle',
  block = false,
  label = '阅读原文',
  showIcon = true,
}: ReadOriginalButtonProps) {
  const broken = linkStatus === 'link_broken' || !url.trim();

  const handleClick = async () => {
    if (broken) return;
    if (articleId) {
      try {
        await fetch(`/api/articles/${articleId}/click`, { method: 'POST' });
      } catch {
        // non-blocking
      }
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const button = (
    <Button
      type="primary"
      size={size}
      block={block}
      icon={showIcon ? <ExportOutlined /> : undefined}
      disabled={broken}
      onClick={handleClick}
    >
      {label}
    </Button>
  );

  if (broken) {
    return (
      <Tooltip title="原文链接暂时无法访问">
        <span className={block ? 'block w-full' : ''}>{button}</span>
      </Tooltip>
    );
  }

  return button;
}
