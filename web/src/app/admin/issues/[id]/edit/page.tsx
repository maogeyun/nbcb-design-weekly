'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Alert,
  Button,
  Checkbox,
  DatePicker,
  Drawer,
  Input,
  Popconfirm,
  Select,
  Space,
  Table,
  Typography,
  App,
} from 'antd';
import dayjs from 'dayjs';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { Article, ArticleCategory, IssueDetail } from '@/types';
import { CATEGORY_LABELS } from '@/lib/constants';
import { CandidatePickerModal } from '@/components/admin/CandidatePickerModal';
import { ArticleAttachmentEditor } from '@/components/admin/ArticleAttachmentEditor';
import { IntroductionEditor } from '@/components/admin/IntroductionEditor';

const { Title, Text, Link: TextLink } = Typography;
const { TextArea } = Input;

function isValidArticleUrl(url: string): boolean {
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function AdminIssueEditPage() {
  const { message } = App.useApp();
  const params = useParams();
  const issueId = params.id as string;
  const [issue, setIssue] = useState<IssueDetail | null>(null);
  const [candidates, setCandidates] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [addingArticles, setAddingArticles] = useState(false);
  const [validation, setValidation] = useState<{
    ok: boolean;
    errors: string[];
    warnings: string[];
  } | null>(null);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [savingArticle, setSavingArticle] = useState(false);

  const loadIssue = useCallback(async () => {
    const res = await fetch(`/api/admin/issues/${issueId}`);
    if (res.status === 401) {
      window.location.href = '/admin/login';
      return;
    }
    const json = await res.json();
    setIssue(json.data);
    setLoading(false);
  }, [issueId]);

  const loadCandidates = async () => {
    const res = await fetch('/api/admin/candidates');
    const json = await res.json();
    setCandidates(json.data ?? []);
  };

  useEffect(() => {
    loadIssue();
  }, [loadIssue]);

  const saveIssueMeta = async () => {
    if (!issue) return;
    await fetch(`/api/admin/issues/${issueId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: issue.title,
        publish_date: issue.publish_date,
        cover_summary: issue.cover_summary,
      }),
    });
    message.success('周刊信息已保存');
  };

  const addArticle = async (articleId: string) => {
    setAddingArticles(true);
    try {
      const res = await fetch(`/api/admin/issues/${issueId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_article', articleId }),
      });
      const json = await res.json();
      if (!res.ok) {
        message.error(json.error ?? '添加失败');
        return;
      }
      setIssue(json.data);
      await loadCandidates();
      message.success('已加入周刊');
    } finally {
      setAddingArticles(false);
    }
  };

  const addArticles = async (articleIds: string[]) => {
    setAddingArticles(true);
    try {
      const res = await fetch(`/api/admin/issues/${issueId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_articles', articleIds }),
      });
      const json = await res.json();
      if (!res.ok) {
        message.error(json.error ?? '添加失败');
        return;
      }
      setIssue(json.data);
      await loadCandidates();

      const { added, failed } = json.result as {
        added: string[];
        failed: { id: string; error: string }[];
      };
      if (failed.length === 0) {
        message.success(`已加入 ${added.length} 篇`);
      } else {
        const failSummary = [...new Set(failed.map((f) => f.error))].join('；');
        message.warning(
          `成功 ${added.length} 篇，${failed.length} 篇失败：${failSummary}`,
        );
      }
    } finally {
      setAddingArticles(false);
    }
  };

  const removeArticle = async (articleId: string) => {
    const res = await fetch(`/api/admin/issues/${issueId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'remove_article', articleId }),
    });
    const json = await res.json();
    setIssue(json.data);
  };

  const moveArticle = async (index: number, direction: -1 | 1) => {
    if (!issue) return;
    const ids = issue.articles.map((a) => a.id);
    const target = index + direction;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    const res = await fetch(`/api/admin/issues/${issueId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reorder', articleIds: ids }),
    });
    const json = await res.json();
    setIssue(json.data);
  };

  const checkPublish = async () => {
    const res = await fetch(`/api/admin/issues/${issueId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'validate' }),
    });
    setValidation(await res.json());
  };

  const publish = async () => {
    const res = await fetch(`/api/admin/issues/${issueId}/publish`, {
      method: 'POST',
    });
    const json = await res.json();
    if (!res.ok) {
      setValidation(json);
      message.error(json.errors?.join('；') ?? '发布失败');
      return;
    }
    message.success('发布成功');
    window.location.href = '/admin/issues';
  };

  const saveArticle = async () => {
    if (!editingArticle) return;
    if (!editingArticle.title.trim()) {
      message.error('请输入文章标题');
      return;
    }
    const url = editingArticle.original_url.trim();
    if (url && !isValidArticleUrl(url)) {
      message.error('请输入有效的原文链接（http:// 或 https://）');
      return;
    }
    setSavingArticle(true);
    try {
      const res = await fetch(`/api/admin/articles/${editingArticle.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingArticle.title.trim(),
          original_url: url,
          source_name: editingArticle.source_name.trim(),
          published_at: editingArticle.published_at.trim(),
          language: editingArticle.language,
          category: editingArticle.category,
          introduction: editingArticle.introduction,
          intro_reviewed: editingArticle.intro_reviewed,
        }),
      });
      if (res.ok) {
        message.success('文章已保存');
        setEditingArticle(null);
        loadIssue();
      } else {
        const json = await res.json();
        message.error(json.error ?? '保存失败');
      }
    } finally {
      setSavingArticle(false);
    }
  };

  if (loading || !issue) {
    return <div style={{ padding: 24 }}>加载中…</div>;
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>
      <Link href="/admin/issues">← 周刊列表</Link>
      <Title level={3} style={{ marginTop: 16 }}>
        组刊：第 {issue.issue_number} 期
      </Title>

      <Space orientation="vertical" style={{ width: '100%', marginBottom: 24 }}>
        <Input
          value={issue.title}
          onChange={(e) => setIssue({ ...issue, title: e.target.value })}
          placeholder="周刊标题"
        />
        <DatePicker
          style={{ width: '100%' }}
          value={issue.publish_date ? dayjs(issue.publish_date) : null}
          onChange={(_, dateString) =>
            setIssue({ ...issue, publish_date: dateString || '' })
          }
          format="YYYY-MM-DD"
          placeholder="发布日期"
        />
        <TextArea
          rows={2}
          value={issue.cover_summary}
          onChange={(e) =>
            setIssue({ ...issue, cover_summary: e.target.value })
          }
          placeholder="本期导语"
        />
        <Button onClick={saveIssueMeta}>保存周刊信息</Button>
      </Space>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          width: '100%',
        }}
      >
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            loadCandidates();
            setPickerOpen(true);
          }}
        >
          从候选池添加
        </Button>
        <Space>
          <Button onClick={checkPublish}>检查发布门禁</Button>
          {issue.status === 'draft' && (
            <Button type="primary" onClick={publish}>
              发布周刊
            </Button>
          )}
        </Space>
      </div>

      {validation && !validation.ok && (
        <Alert
          type="error"
          showIcon
          message="发布门禁未通过"
          description={validation.errors.join('；')}
          style={{ marginBottom: 16 }}
        />
      )}
      {validation?.warnings && validation.warnings.length > 0 && (
        <Alert
          type="warning"
          showIcon
          message="警告"
          description={validation.warnings.join('；')}
          style={{ marginBottom: 16 }}
        />
      )}

      <Table
        dataSource={issue.articles}
        rowKey="id"
        pagination={false}
        columns={[
          {
            title: '排序',
            width: 80,
            render: (_, __, index) => (
              <Space>
                <Button
                  size="small"
                  icon={<ArrowUpOutlined />}
                  disabled={index === 0}
                  onClick={() => moveArticle(index, -1)}
                />
                <Button
                  size="small"
                  icon={<ArrowDownOutlined />}
                  disabled={index === issue.articles.length - 1}
                  onClick={() => moveArticle(index, 1)}
                />
              </Space>
            ),
          },
          { title: '标题', dataIndex: 'title', ellipsis: true },
          {
            title: '栏目',
            dataIndex: 'category',
            width: 100,
            render: (c: ArticleCategory) => CATEGORY_LABELS[c],
          },
          {
            title: '引言',
            width: 90,
            render: (_, r) => (r.intro_reviewed ? '已审核' : '待审核'),
          },
          {
            title: '操作',
            width: 160,
            render: (_, r) => (
              <Space>
                <Button size="small" onClick={() => setEditingArticle({ ...r })}>
                  编辑
                </Button>
                <Popconfirm
                  title="确定从本期周刊移除该文章？"
                  description="移除后文章仍保留在候选池"
                  okText="移除"
                  cancelText="取消"
                  okButtonProps={{ danger: true }}
                  onConfirm={() => removeArticle(r.id)}
                >
                  <Button size="small" danger>
                    移除
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <CandidatePickerModal
        open={pickerOpen}
        candidates={candidates}
        currentCount={issue?.articles.length ?? 0}
        loading={addingArticles}
        onCancel={() => setPickerOpen(false)}
        onPick={addArticle}
        onPickMany={addArticles}
      />

      {editingArticle && (
        <Drawer
          title="编辑文章"
          size={520}
          open={Boolean(editingArticle)}
          onClose={() => setEditingArticle(null)}
          destroyOnHidden
          footer={
            <Space style={{ float: 'right' }}>
              <Button onClick={() => setEditingArticle(null)}>取消</Button>
              <Button type="primary" loading={savingArticle} onClick={saveArticle}>
                保存
              </Button>
            </Space>
          }
        >
          <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Text type="secondary">标题</Text>
              <Input
                style={{ marginTop: 8 }}
                value={editingArticle.title}
                placeholder="文章标题"
                onChange={(e) =>
                  setEditingArticle({
                    ...editingArticle,
                    title: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <Text type="secondary">来源</Text>
              <Input
                style={{ marginTop: 8 }}
                value={editingArticle.source_name}
                placeholder="如：优设网、Figma Blog"
                onChange={(e) =>
                  setEditingArticle({
                    ...editingArticle,
                    source_name: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <Text type="secondary">发布日期</Text>
              <DatePicker
                style={{ width: '100%', marginTop: 8 }}
                value={
                  editingArticle.published_at
                    ? dayjs(editingArticle.published_at)
                    : null
                }
                onChange={(_, dateString) =>
                  setEditingArticle({
                    ...editingArticle,
                    published_at: dateString || '',
                  })
                }
                format="YYYY-MM-DD"
                placeholder="发布日期"
              />
            </div>

            <div>
              <Text type="secondary">语言</Text>
              <Select
                style={{ width: '100%', marginTop: 8 }}
                value={editingArticle.language}
                options={[
                  { value: 'zh', label: '中文' },
                  { value: 'en', label: '英文' },
                ]}
                onChange={(v) =>
                  setEditingArticle({
                    ...editingArticle,
                    language: v as 'zh' | 'en',
                  })
                }
              />
            </div>

            <div>
              <Text type="secondary">原文链接</Text>
              <Input
                style={{ marginTop: 8 }}
                value={editingArticle.original_url}
                placeholder="选填，https://example.com/article"
                onChange={(e) =>
                  setEditingArticle({
                    ...editingArticle,
                    original_url: e.target.value,
                  })
                }
              />
              {isValidArticleUrl(editingArticle.original_url) && (
                <TextLink
                  href={editingArticle.original_url.trim()}
                  target="_blank"
                  style={{ fontSize: 12, marginTop: 4, display: 'inline-block' }}
                >
                  在新窗口打开
                </TextLink>
              )}
            </div>

            <div>
              <Text type="secondary">栏目</Text>
              <Select
                style={{ width: '100%', marginTop: 8 }}
                value={editingArticle.category}
                options={Object.entries(CATEGORY_LABELS).map(([k, v]) => ({
                  value: k,
                  label: v,
                }))}
                onChange={(v) =>
                  setEditingArticle({
                    ...editingArticle,
                    category: v as ArticleCategory,
                  })
                }
              />
            </div>

            <ArticleAttachmentEditor
              articleId={editingArticle.id}
              attachment={editingArticle.attachment}
              onUpdated={(attachment) =>
                setEditingArticle({
                  ...editingArticle,
                  attachment: attachment ?? undefined,
                })
              }
            />

            <IntroductionEditor
              value={editingArticle.introduction}
              onChange={(introduction) =>
                setEditingArticle({
                  ...editingArticle,
                  introduction,
                })
              }
            />

            <Checkbox
              checked={editingArticle.intro_reviewed}
              onChange={(e) =>
                setEditingArticle({
                  ...editingArticle,
                  intro_reviewed: e.target.checked,
                })
              }
            >
              引言已审核
            </Checkbox>
          </Space>
        </Drawer>
      )}
    </div>
  );
}
