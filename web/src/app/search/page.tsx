'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, Empty, Flex, Input, Skeleton, Tabs, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { motion, useReducedMotion } from 'framer-motion';
import type { Article, Skill } from '@/types';
import { CATEGORY_LABELS } from '@/lib/constants';
import { buildAppHref } from '@/lib/app-link';
import { CategoryTag } from '@/components/CategoryTag';
import { SkillCard } from '@/components/SkillCard';
import { SkillDetailModal } from '@/components/SkillDetailModal';
import { brandTokens } from '@/lib/tokens';
import { searchPublicContent } from '@/lib/search-client';
import { PageHeader } from '@/components/layout/PageHeader';

const { Text, Paragraph } = Typography;

type SearchTab = 'articles' | 'skills';

interface SearchHit {
  article: Article;
  issue_number: number;
  issue_id: string;
}

interface SearchResults {
  articles: SearchHit[];
  skills: Skill[];
}

function pickDefaultTab(results: SearchResults): SearchTab {
  if (results.articles.length > 0) return 'articles';
  if (results.skills.length > 0) return 'skills';
  return 'articles';
}

function ArticleResults({ articles }: { articles: SearchHit[] }) {
  const prefersReducedMotion = useReducedMotion();

  if (articles.length === 0) {
    return <Empty description="未找到相关文章，试试其他关键词" />;
  }

  const baseShadow = '0 1px 2px rgba(0,0,0,0.04)';
  const hoverShadow =
    '0 8px 24px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)';

  return (
    <Flex vertical gap={12}>
      {articles.map(({ article, issue_number }) => (
        <Link
          key={article.id}
          href={buildAppHref(`/article/${article.id}`, { from: 'search' })}
          style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
        >
          <motion.div
            whileHover={
              prefersReducedMotion ? {} : { y: -4, boxShadow: hoverShadow }
            }
            whileTap={
              prefersReducedMotion ? {} : { scale: 0.997 }
            }
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 400, damping: 30 }
            }
            style={{
              borderRadius: brandTokens.borderRadiusLG,
              boxShadow: baseShadow,
            }}
          >
            <Card
              hoverable={false}
              variant="borderless"
              style={{
                borderRadius: brandTokens.borderRadiusLG,
                background: brandTokens.colorBgContainer,
              }}
            >
              <Flex vertical gap={8}>
                <Flex align="center" justify="space-between">
                  <CategoryTag category={article.category} />
                  <Text type="secondary">第 {issue_number} 期</Text>
                </Flex>
                <Text strong style={{ fontSize: 16 }}>
                  {article.title}
                </Text>
                <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ marginBottom: 0 }}>
                  {article.introduction}
                </Paragraph>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {article.source_name} · {CATEGORY_LABELS[article.category]}
                </Text>
              </Flex>
            </Card>
          </motion.div>
        </Link>
      ))}
    </Flex>
  );
}

function SkillResults({
  skills,
  onOpenSkill,
}: {
  skills: Skill[];
  onOpenSkill: (id: string) => void;
}) {
  if (skills.length === 0) {
    return <Empty description="未找到相关 Skill，试试其他关键词" />;
  }

  return (
    <div className="skill-grid">
      {skills.map((skill) => (
        <SkillCard
          key={skill.id}
          skill={skill}
          onClick={() => onOpenSkill(skill.id)}
        />
      ))}
    </div>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<SearchResults>({ articles: [], skills: [] });
  const [activeTab, setActiveTab] = useState<SearchTab>('articles');
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);

  const openSkillDetail = (skillId: string) => {
    setSelectedSkillId(skillId);
  };

  const closeSkillDetail = () => {
    setSelectedSkillId(null);
  };

  const doSearch = async (q: string) => {
    setSelectedSkillId(null);
    setLoading(true);
    try {
      const nextResults = await searchPublicContent(q);
      setResults(nextResults);
      setActiveTab(pickDefaultTab(nextResults));
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(initialQ);
    setSelectedSkillId(null);
    if (initialQ) {
      doSearch(initialQ);
    } else {
      setResults({ articles: [], skills: [] });
      setActiveTab('articles');
      setSearched(false);
    }
  }, [initialQ]);

  const { articles, skills } = results;
  const hasResults = articles.length > 0 || skills.length > 0;

  const tabItems = useMemo(
    () => [
      { key: 'articles', label: `文章 (${articles.length})` },
      { key: 'skills', label: `技能 (${skills.length})` },
    ],
    [articles.length, skills.length],
  );

  return (
    <Flex vertical>
      <PageHeader
        title="搜索"
        description="搜索文章标题、引言、来源，或设计方法论 Skill"
      />

      <div
        className={
          !loading && searched && hasResults
            ? 'search-sticky-toolbar search-sticky-toolbar--with-results'
            : 'search-sticky-toolbar'
        }
      >
        <div className="search-sticky-toolbar__inner">
          <Input.Search
            placeholder="输入关键词"
            enterButton={
              <>
                <SearchOutlined /> 搜索
              </>
            }
            size="large"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onSearch={(v) => {
              const url = new URL(window.location.href);
              if (v) url.searchParams.set('q', v);
              else url.searchParams.delete('q');
              window.history.replaceState({}, '', url.toString());
              setSelectedSkillId(null);
              doSearch(v);
            }}
            loading={loading}
          />
          {!loading && searched && hasResults && (
            <Tabs
              className="search-page-tabs"
              activeKey={activeTab}
              items={tabItems}
              onChange={(key) => setActiveTab(key as SearchTab)}
            />
          )}
        </div>
      </div>

      <div className="search-page-content">
        {loading && <Skeleton active paragraph={{ rows: 4 }} />}

        {!loading && searched && !hasResults && (
          <Empty description="未找到相关文章或 Skill，试试其他关键词" />
        )}

        {!loading && searched && hasResults && (
          activeTab === 'articles' ? (
            <ArticleResults articles={articles} />
          ) : (
            <SkillResults
              skills={skills}
              onOpenSkill={openSkillDetail}
            />
          )
        )}
      </div>

      <SkillDetailModal
        open={Boolean(selectedSkillId)}
        skillId={selectedSkillId}
        onClose={closeSkillDetail}
      />
    </Flex>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <Flex vertical gap={20}>
          <PageHeader title="搜索" />
          <Skeleton active paragraph={{ rows: 2 }} />
        </Flex>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
