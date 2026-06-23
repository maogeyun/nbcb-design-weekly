import { Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import type { ArticleAttachment } from '@/types';

interface ArticleAttachmentDownloadProps {
  attachment: ArticleAttachment;
  size?: 'small' | 'middle' | 'large';
  block?: boolean;
}

export function ArticleAttachmentDownload({
  attachment,
  size = 'small',
  block = false,
}: ArticleAttachmentDownloadProps) {
  return (
    <Button
      size={size}
      block={block}
      icon={<DownloadOutlined />}
      href={attachment.url}
      download={attachment.original_name}
      target="_blank"
    >
      下载附件
    </Button>
  );
}
