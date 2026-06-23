'use client';

import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Input, Modal, Select, Space, Table, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { Article, ArticleCategory } from '@/types';
import { CATEGORY_LABELS, ISSUE_MAX_ARTICLES } from '@/lib/constants';
import {
  DEFAULT_CANDIDATE_FILTERS,
  type CandidateFilterState,
  type IntroFilter,
  type CandidateSortKey,
  filterAndSortCandidates,
  getCandidateSources,
  introStatusLabel,
} from '@/lib/candidate-filters';

const { Text } = Typography;

interface CandidatePickerModalProps {
  open: boolean;
  candidates: Article[];
  currentCount: number;
  loading?: boolean;
  onCancel: () => void;
  onPick: (articleId: string) => void | Promise<void>;
  onPickMany: (articleIds: string[]) => void | Promise<void>;
}

export function CandidatePickerModal({
  open,
  candidates,
  currentCount,
  loading = false,
  onCancel,
  onPick,
  onPickMany,
}: CandidatePickerModalProps) {
  const [filters, setFilters] = useState<CandidateFilterState>(
    DEFAULT_CANDIDATE_FILTERS,
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  const remainingSlots = ISSUE_MAX_ARTICLES - currentCount;
  const isFull = remainingSlots <= 0;

  useEffect(() => {
    if (!open) {
      setFilters(DEFAULT_CANDIDATE_FILTERS);
      setSelectedRowKeys([]);
    }
  }, [open]);

  const sources = useMemo(() => getCandidateSources(candidates), [candidates]);
  const filteredData = useMemo(
    () => filterAndSortCandidates(candidates, filters),
    [candidates, filters],
  );

  const updateFilter = <K extends keyof CandidateFilterState>(
    key: K,
    value: CandidateFilterState[K],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handlePickMany = async () => {
    if (selectedRowKeys.length === 0 || isFull) return;
    await onPickMany(selectedRowKeys);
    setSelectedRowKeys([]);
  };

  return (
    <Modal
      title="从候选池选稿"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={720}
      destroyOnHidden
    >
      <Space orientation="vertical" style={{ width: '100%' }} size={12}>
        <Text type="secondary">
          本期已 {currentCount} / {ISSUE_MAX_ARTICLES} 篇
          {isFull ? '（已满，无法继续添加）' : `，还可添加 ${remainingSlots} 篇`}
        </Text>

        {isFull && (
          <Alert type="warning" showIcon message="本期文章已达上限" />
        )}

        <Space wrap style={{ width: '100%' }}>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="搜索标题或来源"
            value={filters.keyword}
            onChange={(e) => updateFilter('keyword', e.target.value)}
            style={{ width: 180 }}
          />
          <Select
            value={filters.categoryFilter}
            style={{ width: 110 }}
            options={[
              { value: 'all', label: '全部栏目' },
              ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
                value,
                label,
              })),
            ]}
            onChange={(v) => updateFilter('categoryFilter', v)}
          />
          <Select
            value={filters.sourceFilter}
            style={{ width: 140 }}
            showSearch
            optionFilterProp="label"
            options={[
              { value: 'all', label: '全部来源' },
              ...sources.map((source) => ({ value: source, label: source })),
            ]}
            onChange={(v) => updateFilter('sourceFilter', v)}
          />
          <Select
            value={filters.introFilter}
            style={{ width: 110 }}
            options={[
              { value: 'all', label: '全部引言' },
              { value: 'reviewed', label: '已审核' },
              { value: 'pending', label: '待审核' },
              { value: 'empty', label: '未生成' },
            ]}
            onChange={(v) => updateFilter('introFilter', v as IntroFilter)}
          />
          <Select
            value={filters.sortKey}
            style={{ width: 130 }}
            options={[
              { value: 'published_at_desc', label: '发布日期 ↓' },
              { value: 'published_at_asc', label: '发布日期 ↑' },
              { value: 'title_asc', label: '标题 A→Z' },
              { value: 'title_desc', label: '标题 Z→A' },
              { value: 'source_asc', label: '来源 A→Z' },
            ]}
            onChange={(v) => updateFilter('sortKey', v as CandidateSortKey)}
          />
          <Button onClick={() => setFilters(DEFAULT_CANDIDATE_FILTERS)}>
            重置
          </Button>
        </Space>

        {selectedRowKeys.length > 0 && (
          <Space wrap>
            <Text>已选 {selectedRowKeys.length} 篇</Text>
            <Button
              type="primary"
              loading={loading}
              disabled={
                isFull || selectedRowKeys.length > remainingSlots
              }
              onClick={handlePickMany}
            >
              添加选中 ({selectedRowKeys.length})
            </Button>
            {selectedRowKeys.length > remainingSlots && (
              <Text type="danger">
                超出剩余可添 {remainingSlots} 篇，请减少选择
              </Text>
            )}
            <Button type="link" onClick={() => setSelectedRowKeys([])}>
              取消选择
            </Button>
          </Space>
        )}

        <Table
          size="small"
          dataSource={filteredData}
          rowKey="id"
          rowSelection={
            isFull
              ? undefined
              : {
                  selectedRowKeys,
                  onChange: (keys) => setSelectedRowKeys(keys as string[]),
                  getCheckboxProps: (record) => ({
                    disabled:
                      selectedRowKeys.length >= remainingSlots &&
                      !selectedRowKeys.includes(record.id),
                  }),
                }
          }
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 篇`,
            pageSizeOptions: [10, 20, 50],
          }}
          columns={[
            { title: '标题', dataIndex: 'title', ellipsis: true },
            {
              title: '来源',
              dataIndex: 'source_name',
              width: 120,
              ellipsis: true,
            },
            {
              title: '栏目',
              dataIndex: 'category',
              width: 88,
              render: (c: ArticleCategory) => CATEGORY_LABELS[c],
            },
            {
              title: '引言',
              width: 72,
              render: (_, r) => introStatusLabel(r),
            },
            {
              title: '操作',
              width: 64,
              fixed: 'right',
              render: (_, r) => (
                <Button
                  size="small"
                  type="link"
                  disabled={isFull || loading}
                  onClick={() => onPick(r.id)}
                >
                  添加
                </Button>
              ),
            },
          ]}
        />
      </Space>
    </Modal>
  );
}
