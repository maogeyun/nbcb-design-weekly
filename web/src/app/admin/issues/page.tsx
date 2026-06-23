'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { App, Button, Input, Space, Table, Typography } from 'antd';
import type { WeeklyIssue } from '@/types';

const { Title } = Typography;

export default function AdminIssuesPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const [data, setData] = useState<WeeklyIssue[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch('/api/admin/issues')
      .then((res) => {
        if (res.status === 401) {
          window.location.href = '/admin/login';
          return null;
        }
        return res.json();
      })
      .then((json) => {
        if (json) setData(json.data ?? []);
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const createIssue = async () => {
    const res = await fetch('/api/admin/issues', { method: 'POST' });
    const json = await res.json();
    if (res.ok) {
      message.success('草稿已创建');
      router.push(`/admin/issues/${json.data.id}/edit`);
    }
  };

  const handlePublish = async (id: string) => {
    const res = await fetch(`/api/admin/issues/${id}/publish`, {
      method: 'POST',
    });
    const json = await res.json();
    if (!res.ok) {
      message.error(json.errors?.join('；') ?? '发布失败');
      return;
    }
    message.success('发布成功');
    load();
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>
      <Link href="/admin">← 后台首页</Link>
      <Space
        style={{ width: '100%', justifyContent: 'space-between', marginTop: 16 }}
      >
        <Title level={3} style={{ margin: 0 }}>
          周刊列表
        </Title>
        <Button type="primary" onClick={createIssue}>
          创建新周刊
        </Button>
      </Space>

      <Table
        loading={loading}
        dataSource={data}
        rowKey="id"
        style={{ marginTop: 16 }}
        columns={[
          { title: '期次', render: (_, r) => `第 ${r.issue_number} 期` },
          { title: '标题', dataIndex: 'title' },
          { title: '发布日期', dataIndex: 'publish_date' },
          { title: '状态', dataIndex: 'status' },
          {
            title: '操作',
            render: (_, r) => (
              <Space>
                <Link href={`/admin/issues/${r.id}/edit`}>组刊</Link>
                {r.status === 'published' && (
                  <Link href={`/weekly/${r.id}`}>预览</Link>
                )}
                {r.status === 'draft' && (
                  <Button size="small" type="primary" onClick={() => handlePublish(r.id)}>
                    发布
                  </Button>
                )}
              </Space>
            ),
          },
        ]}
      />
    </div>
  );
}
