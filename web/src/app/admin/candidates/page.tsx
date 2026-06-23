'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
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
import { SearchOutlined } from '@ant-design/icons';
import type { Article, ArticleCategory } from '@/types';
import { CATEGORY_LABELS } from '@/lib/constants';
import { ArticleAttachmentEditor } from '@/components/admin/ArticleAttachmentEditor';
import { IntroductionEditor } from '@/components/admin/IntroductionEditor';
import {
  DEFAULT_CANDIDATE_FILTERS,
  type IntroFilter,
  type CandidateSortKey,
  filterAndSortCandidates,
  getCandidateSources,
  introStatusLabel,
} from '@/lib/candidate-filters';

const { Title, Text, Link: TextLink } = Typography;

function isValidArticleUrl(url: string): boolean {
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function AdminCandidatesPage() {
  const { message } = App.useApp();
  const [data, setData] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Article | null>(null);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ArticleCategory | 'all'>(
    'all',
  );
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [introFilter, setIntroFilter] = useState<IntroFilter>('all');
  const [sortKey, setSortKey] = useState<CandidateSortKey>('published_at_desc');
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchCategory, setBatchCategory] = useState<ArticleCategory>(
    'ui_design',
  );
  const [isNewDraft, setIsNewDraft] = useState(false);
  const [creating, setCreating] = useState(false);

  const sources = useMemo(() => getCandidateSources(data), [data]);

  const filteredData = useMemo(
    () =>
      filterAndSortCandidates(data, {
        keyword,
        categoryFilter,
        sourceFilter,
        introFilter,
        sortKey,
      }),
    [data, keyword, categoryFilter, sourceFilter, introFilter, sortKey],
  );

  const resetFilters = () => {
    setKeyword(DEFAULT_CANDIDATE_FILTERS.keyword);
    setCategoryFilter(DEFAULT_CANDIDATE_FILTERS.categoryFilter);
    setSourceFilter(DEFAULT_CANDIDATE_FILTERS.sourceFilter);
    setIntroFilter(DEFAULT_CANDIDATE_FILTERS.introFilter);
    setSortKey(DEFAULT_CANDIDATE_FILTERS.sortKey);
  };

  const runBatch = async (payload: Record<string, unknown>) => {
    if (selectedRowKeys.length === 0) return;
    setBatchLoading(true);
    try {
      const res = await fetch('/api/admin/candidates/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedRowKeys, ...payload }),
      });
      const json = await res.json();
      if (!res.ok) {
        message.error(json.error ?? '批量操作失败');
        return;
      }
      message.success(`已处理 ${json.count} 篇`);
      setSelectedRowKeys([]);
      load();
    } finally {
      setBatchLoading(false);
    }
  };

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/candidates');
    if (res.status === 401) {
      window.location.href = '/admin/login';
      return;
    }
    const json = await res.json();
    setData(json.data ?? []);
    setSelectedRowKeys([]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const closeDrawer = () => {
    setEditing(null);
    setIsNewDraft(false);
  };

  const cancelDrawer = async () => {
    if (isNewDraft && editing) {
      await fetch(`/api/admin/articles/${editing.id}`, { method: 'DELETE' });
      load();
    }
    closeDrawer();
  };

  const createBlankArticle = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/admin/candidates', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) {
        message.error(json.error ?? '创建失败');
        return;
      }
      setEditing(json.data);
      setIsNewDraft(true);
      message.info('请填写文章详情后保存');
    } finally {
      setCreating(false);
    }
  };

  const saveArticle = async () => {
    if (!editing) return;
    if (!editing.title.trim()) {
      message.error('请输入文章标题');
      return;
    }
    const url = editing.original_url.trim();
    if (url && !isValidArticleUrl(url)) {
      message.error('请输入有效的原文链接（http:// 或 https://）');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/articles/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editing.title.trim(),
          original_url: url,
          source_name: editing.source_name.trim(),
          published_at: editing.published_at.trim(),
          language: editing.language,
          category: editing.category,
          introduction: editing.introduction,
          intro_reviewed: editing.intro_reviewed,
        }),
      });
      if (res.ok) {
        message.success('已保存');
        setIsNewDraft(false);
        closeDrawer();
        load();
      } else {
        const json = await res.json();
        message.error(json.error ?? '保存失败');
      }
    } finally {
      setSaving(false);
    }
  };

  const regenerate = async () => {
    if (!editing) return;
    setRegenerating(true);
    try {
      const res = await fetch(`/api/admin/articles/${editing.id}`, {
        method: 'POST',
      });
      if (res.ok) {
        const json = await res.json();
        setEditing(json.data);
        message.success('引言已重新生成，请审核');
      }
    } finally {
      setRegenerating(false);
    }
  };

  const deleteArticle = async () => {
    if (!editing) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/articles/${editing.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        message.success('已删除');
        closeDrawer();
        load();
      } else {
        const json = await res.json();
        message.error(json.error ?? '删除失败');
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>
      <Space style={{ marginBottom: 16 }}>
        <Link href="/admin">← 后台首页</Link>
      </Space>
      <Title level={3}>候选池</Title>

      <ImportAndCrawlBar onDone={load} />

      <Space style={{ marginBottom: 16 }}>
        <Button loading={creating} onClick={createBlankArticle}>
          手动新增
        </Button>
        <Text type="secondary">创建空白文章，在编辑抽屉中手动录入详情</Text>
      </Space>

      <Space wrap style={{ width: '100%', marginBottom: 16 }}>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="搜索标题或来源"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ width: 200 }}
        />
        <Select
          value={categoryFilter}
          style={{ width: 120 }}
          options={[
            { value: 'all', label: '全部栏目' },
            ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
              value,
              label,
            })),
          ]}
          onChange={setCategoryFilter}
        />
        <Select
          value={sourceFilter}
          style={{ width: 160 }}
          showSearch
          optionFilterProp="label"
          options={[
            { value: 'all', label: '全部来源' },
            ...sources.map((source) => ({ value: source, label: source })),
          ]}
          onChange={setSourceFilter}
        />
        <Select
          value={introFilter}
          style={{ width: 120 }}
          options={[
            { value: 'all', label: '全部引言' },
            { value: 'reviewed', label: '已审核' },
            { value: 'pending', label: '待审核' },
            { value: 'empty', label: '未生成' },
          ]}
          onChange={setIntroFilter}
        />
        <Select
          value={sortKey}
          style={{ width: 160 }}
          options={[
            { value: 'published_at_desc', label: '发布日期 ↓' },
            { value: 'published_at_asc', label: '发布日期 ↑' },
            { value: 'title_asc', label: '标题 A→Z' },
            { value: 'title_desc', label: '标题 Z→A' },
            { value: 'source_asc', label: '来源 A→Z' },
          ]}
          onChange={setSortKey}
        />
        <Button onClick={resetFilters}>重置</Button>
      </Space>

      {selectedRowKeys.length > 0 && (
        <Space wrap style={{ marginBottom: 16 }}>
          <Text>已选 {selectedRowKeys.length} 篇</Text>
          <Popconfirm
            title={`确定删除选中的 ${selectedRowKeys.length} 篇候选文章？`}
            description="删除后不可恢复"
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            onConfirm={() => runBatch({ action: 'delete' })}
          >
            <Button danger loading={batchLoading}>
              批量删除
            </Button>
          </Popconfirm>
          <Space.Compact>
            <Select
              value={batchCategory}
              style={{ width: 120 }}
              options={Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
                value,
                label,
              }))}
              onChange={setBatchCategory}
            />
            <Button
              loading={batchLoading}
              onClick={() =>
                runBatch({ action: 'update', category: batchCategory })
              }
            >
              批量设栏目
            </Button>
          </Space.Compact>
          <Button
            loading={batchLoading}
            onClick={() =>
              runBatch({ action: 'update', intro_reviewed: true })
            }
          >
            标记引言已审核
          </Button>
          <Button type="link" onClick={() => setSelectedRowKeys([])}>
            取消选择
          </Button>
        </Space>
      )}

      <Table
        loading={loading}
        dataSource={filteredData}
        rowKey="id"
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys as string[]),
        }}
        pagination={{
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 篇`,
          pageSizeOptions: [10, 20, 50, 100],
        }}
        columns={[
          { title: '标题', dataIndex: 'title', ellipsis: true },
          { title: '来源', dataIndex: 'source_name', width: 140, ellipsis: true },
          {
            title: '栏目',
            dataIndex: 'category',
            width: 100,
            render: (c: ArticleCategory) => CATEGORY_LABELS[c],
          },
          {
            title: '发布日期',
            dataIndex: 'published_at',
            width: 110,
          },
          {
            title: '引言',
            width: 90,
            render: (_, r) => introStatusLabel(r),
          },
          {
            title: '操作',
            width: 80,
            fixed: 'right',
            render: (_, r) => (
              <Button size="small" onClick={() => {
                setIsNewDraft(false);
                setEditing({ ...r });
              }}>
                编辑
              </Button>
            ),
          },
        ]}
      />

      <Drawer
        title={isNewDraft ? '录入候选文章' : '编辑候选文章'}
        size={520}
        open={Boolean(editing)}
        onClose={cancelDrawer}
        destroyOnHidden
        footer={
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Popconfirm
              title="确定删除该候选文章？"
              description="删除后不可恢复"
              okText="删除"
              cancelText="取消"
              okButtonProps={{ danger: true, loading: deleting }}
              onConfirm={deleteArticle}
            >
              <Button danger loading={deleting}>
                删除
              </Button>
            </Popconfirm>
            <Space>
              <Button onClick={cancelDrawer}>取消</Button>
              <Button loading={regenerating} onClick={regenerate}>
                重新生成引言
              </Button>
              <Button type="primary" loading={saving} onClick={saveArticle}>
                保存
              </Button>
            </Space>
          </div>
        }
      >
        {editing && (
          <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Text type="secondary">标题</Text>
              <Input
                style={{ marginTop: 8 }}
                value={editing.title}
                placeholder="文章标题"
                onChange={(e) =>
                  setEditing({ ...editing, title: e.target.value })
                }
              />
            </div>

            <div>
              <Text type="secondary">来源</Text>
              <Input
                style={{ marginTop: 8 }}
                value={editing.source_name}
                placeholder="如：优设网、Figma Blog"
                onChange={(e) =>
                  setEditing({ ...editing, source_name: e.target.value })
                }
              />
            </div>

            <div>
              <Text type="secondary">发布日期</Text>
              <DatePicker
                style={{ width: '100%', marginTop: 8 }}
                value={
                  editing.published_at ? dayjs(editing.published_at) : null
                }
                onChange={(_, dateString) =>
                  setEditing({ ...editing, published_at: dateString || '' })
                }
                format="YYYY-MM-DD"
                placeholder="发布日期"
              />
            </div>

            <div>
              <Text type="secondary">语言</Text>
              <Select
                style={{ width: '100%', marginTop: 8 }}
                value={editing.language}
                options={[
                  { value: 'zh', label: '中文' },
                  { value: 'en', label: '英文' },
                ]}
                onChange={(v) =>
                  setEditing({ ...editing, language: v as 'zh' | 'en' })
                }
              />
            </div>

            <div>
              <Text type="secondary">原文链接</Text>
              <Input
                style={{ marginTop: 8 }}
                value={editing.original_url}
                placeholder="选填，https://example.com/article"
                onChange={(e) =>
                  setEditing({ ...editing, original_url: e.target.value })
                }
              />
              {isValidArticleUrl(editing.original_url) && (
                <TextLink
                  href={editing.original_url.trim()}
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
                value={editing.category}
                options={Object.entries(CATEGORY_LABELS).map(([k, v]) => ({
                  value: k,
                  label: v,
                }))}
                onChange={(v) =>
                  setEditing({ ...editing, category: v as ArticleCategory })
                }
              />
            </div>

            <ArticleAttachmentEditor
              articleId={editing.id}
              attachment={editing.attachment}
              onUpdated={(attachment) =>
                setEditing({ ...editing, attachment: attachment ?? undefined })
              }
            />

            <IntroductionEditor
              value={editing.introduction}
              onChange={(introduction) =>
                setEditing({ ...editing, introduction })
              }
            />

            <Checkbox
              checked={editing.intro_reviewed}
              onChange={(e) =>
                setEditing({ ...editing, intro_reviewed: e.target.checked })
              }
            >
              引言已审核
            </Checkbox>
          </Space>
        )}
      </Drawer>
    </div>
  );
}

function ImportAndCrawlBar({ onDone }: { onDone: () => void }) {
  const { message } = App.useApp();
  const [url, setUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [crawling, setCrawling] = useState(false);

  const handleImport = async () => {
    if (!url.trim()) return;
    setImporting(true);
    try {
      const res = await fetch('/api/admin/candidates/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        message.error(json.error ?? '导入失败');
        return;
      }
      message.success('已加入候选池');
      setUrl('');
      onDone();
    } finally {
      setImporting(false);
    }
  };

  const handleCrawl = async () => {
    setCrawling(true);
    try {
      const res = await fetch('/api/admin/crawl', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) {
        message.error(json.error ?? '抓取失败');
        return;
      }
      const { imported, skipped, filtered, feeds, wechat } = json.data;
      const failedFeeds = (feeds ?? []).filter(
        (f: { status: string }) => f.status === 'error',
      );
      const okFeeds = (feeds ?? []).filter(
        (f: { status: string }) => f.status === 'ok',
      );
      message.success(
        `抓取完成：新增 ${imported} 篇，跳过 ${skipped} 篇（重复），规则过滤 ${filtered} 篇；${okFeeds.length} 个源成功${failedFeeds.length ? `，${failedFeeds.length} 个源失败` : ''}`,
        failedFeeds.length ? 6 : 3,
      );
      if (wechat && !wechat.configured && wechat.total > 0) {
        message.info(
          `已配置 ${wechat.active}/${wechat.total} 个公众号源。部署 WeWe RSS 后设置 WECHAT_RSS_BASE_URL 与 WECHAT_RSS_FEEDS 即可启用（见 web/.env.example）`,
          8,
        );
      }
      if (failedFeeds.length) {
        message.warning(
          `部分源抓取失败：${failedFeeds.map((f: { source_name: string }) => f.source_name).join('、')}`,
          8,
        );
      }
      onDone();
    } finally {
      setCrawling(false);
    }
  };

  return (
    <Space orientation="vertical" style={{ width: '100%', marginBottom: 16 }}>
      <Space.Compact style={{ width: '100%' }}>
        <Input
          placeholder="粘贴文章 URL 手动添加"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onPressEnter={handleImport}
        />
        <Button loading={importing} onClick={handleImport}>
          导入
        </Button>
      </Space.Compact>
      <Button type="primary" loading={crawling} onClick={handleCrawl}>
        RSS 抓取（白名单源 · 近 14 天）
      </Button>
    </Space>
  );
}
