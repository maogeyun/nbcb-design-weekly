'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  App,
  Button,
  Input,
  Popconfirm,
  Select,
  Space,
  Table,
  Typography,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { Skill, SkillCategory } from '@/types';
import {
  SKILL_CATEGORY_LABELS,
  SKILL_CATEGORY_ORDER,
} from '@/lib/constants';
import { filterSkillsByCategory, filterSkillsByKeyword } from '@/lib/skill-utils';
import { SkillCategoryTag } from '@/components/SkillCategoryTag';
import { SkillEditor } from '@/components/admin/SkillEditor';

const { Title, Text } = Typography;

function getFileStatusLabel(skill: Skill): string {
  if (skill.download_url) return '外链';
  if (skill.package_path) return `包 ${skill.package_path}`;
  if (skill.file_path) return skill.file_path;
  return '无文件';
}

export default function AdminSkillsPage() {
  const { message } = App.useApp();
  const [data, setData] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<SkillCategory | 'all'>(
    'all',
  );
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/skills');
    if (res.status === 401) {
      window.location.href = '/admin/login';
      return;
    }
    const json = await res.json();
    setData(json.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filteredData = useMemo(() => {
    let list = filterSkillsByCategory(
      data,
      categoryFilter === 'all' ? undefined : categoryFilter,
    );
    if (keyword.trim()) {
      list = filterSkillsByKeyword(list, keyword);
    }
    return list;
  }, [data, categoryFilter, keyword]);

  const openCreate = () => {
    setEditingId(null);
    setEditorOpen(true);
  };

  const openEdit = (id: string) => {
    setEditingId(id);
    setEditorOpen(true);
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/skills/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) {
      message.error(json.error ?? '删除失败');
      return;
    }
    message.success('已删除');
    load();
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>
      <Link href="/admin">← 后台首页</Link>
      <Space
        style={{ width: '100%', justifyContent: 'space-between', marginTop: 16 }}
      >
        <Title level={3} style={{ margin: 0 }}>
          技能管理
        </Title>
        <Button type="primary" onClick={openCreate}>
          新建技能
        </Button>
      </Space>

      <Space wrap style={{ marginTop: 16 }}>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="搜索名称、ID、简介"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ width: 240 }}
        />
        <Select
          value={categoryFilter}
          onChange={setCategoryFilter}
          style={{ width: 160 }}
          options={[
            { value: 'all', label: '全部分类' },
            ...SKILL_CATEGORY_ORDER.map((key) => ({
              value: key,
              label: SKILL_CATEGORY_LABELS[key],
            })),
          ]}
        />
      </Space>

      <Table
        loading={loading}
        dataSource={filteredData}
        rowKey="id"
        style={{ marginTop: 16 }}
        columns={[
          { title: '名称', dataIndex: 'name', width: 160 },
          {
            title: '分类',
            width: 120,
            render: (_, record) => (
              <SkillCategoryTag category={record.category} />
            ),
          },
          {
            title: '简介',
            dataIndex: 'introduction',
            ellipsis: true,
            render: (text: string) => (
              <Text type="secondary" ellipsis>
                {text}
              </Text>
            ),
          },
          {
            title: '文件',
            width: 140,
            render: (_, record) => getFileStatusLabel(record),
          },
          {
            title: '操作',
            width: 140,
            render: (_, record) => (
              <Space>
                <Button type="link" size="small" onClick={() => openEdit(record.id)}>
                  编辑
                </Button>
                <Popconfirm
                  title="确认删除该技能？"
                  description="将同时删除 JSON 记录与 Markdown 文件"
                  onConfirm={() => handleDelete(record.id)}
                >
                  <Button type="link" size="small" danger>
                    删除
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <SkillEditor
        open={editorOpen}
        skillId={editingId}
        onClose={() => setEditorOpen(false)}
        onSaved={load}
      />
    </div>
  );
}
