'use client';

import { useState } from 'react';
import { App, Button, Space, Typography, Upload } from 'antd';
import {
  DeleteOutlined,
  DownloadOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import type { ArticleAttachment } from '@/types';

const { Text } = Typography;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface ArticleAttachmentEditorProps {
  articleId: string;
  attachment?: ArticleAttachment | null;
  onUpdated: (attachment: ArticleAttachment | null) => void;
}

export function ArticleAttachmentEditor({
  articleId,
  attachment,
  onUpdated,
}: ArticleAttachmentEditorProps) {
  const { message } = App.useApp();
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);

  const uploadProps: UploadProps = {
    accept: '.pdf,.zip,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.webp,.gif,.txt,.md',
    maxCount: 1,
    showUploadList: false,
    customRequest: async ({ file, onError, onSuccess }) => {
      const uploadFile = file as File;
      const formData = new FormData();
      formData.append('file', uploadFile);
      setUploading(true);
      try {
        const res = await fetch(`/api/admin/articles/${articleId}/attachment`, {
          method: 'POST',
          body: formData,
        });
        const json = await res.json();
        if (!res.ok) {
          message.error(json.error ?? '上传失败');
          onError?.(new Error(json.error ?? '上传失败'));
          return;
        }
        onUpdated(json.data.attachment ?? null);
        message.success('附件已上传');
        onSuccess?.(json);
      } catch (error) {
        onError?.(error as Error);
      } finally {
        setUploading(false);
      }
    },
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      const res = await fetch(`/api/admin/articles/${articleId}/attachment`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok) {
        message.error(json.error ?? '删除失败');
        return;
      }
      onUpdated(null);
      message.success('附件已删除');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div>
      <Text type="secondary">文章附件</Text>
      {attachment ? (
        <Space orientation="vertical" style={{ width: '100%', marginTop: 8 }}>
          <Space wrap>
            <Text>{attachment.original_name}</Text>
            <Text type="secondary">({formatFileSize(attachment.size)})</Text>
          </Space>
          <Space wrap>
            <Button
              size="small"
              icon={<DownloadOutlined />}
              href={attachment.url}
              target="_blank"
            >
              下载
            </Button>
            <Upload {...uploadProps}>
              <Button size="small" icon={<UploadOutlined />} loading={uploading}>
                替换
              </Button>
            </Upload>
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              loading={removing}
              onClick={handleRemove}
            >
              删除
            </Button>
          </Space>
        </Space>
      ) : (
        <>
          <Upload {...uploadProps}>
            <Button
              style={{ marginTop: 8 }}
              icon={<UploadOutlined />}
              loading={uploading}
            >
              上传附件
            </Button>
          </Upload>
          <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 4 }}>
            支持 PDF、Office、图片、ZIP 等，最大 20MB
          </Text>
        </>
      )}
    </div>
  );
}
