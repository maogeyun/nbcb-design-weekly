'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Article, Skill, SkillCategory } from '@/types';
import { buildMobileHref } from '@/lib/app-link';
import { searchPublicContent } from '@/lib/search-client';
import { fetchSkillDetail } from '@/lib/public-data-client';
import { IOSNavBar } from '@/components/ios/IOSNavBar';
import { IOSSearchField } from '@/components/ios/IOSSearchField';
import { IOSSegmentedControl } from '@/components/ios/IOSSegmentedControl';
import { IOSGroupedList, IOSListCell, IOSFeedRow } from '@/components/ios/IOSGroupedList';
import { IOSSheet } from '@/components/ios/IOSSheet';
import { IOSMarkdown } from '@/components/ios/IOSMarkdown';
import { skillCategoryTagStyles } from '@/lib/tokens';
import { SKILL_CATEGORY_LABELS } from '@/lib/constants';

type SearchTab = 'articles' | 'skills';

interface SearchResults {
  articles: { article: Article; issue_number: number; issue_id: string }[];
  skills: Skill[];
}

function IOSSkillCategoryTag({ category }: { category: SkillCategory }) {
  const style = skillCategoryTagStyles[category];
  return (
    <span
      className="ios-category-tag"
      style={{ color: style.color, background: style.background }}
    >
      {SKILL_CATEGORY_LABELS[category]}
    </span>
  );
}

function pickDefaultTab(results: SearchResults): SearchTab {
  if (results.articles.length > 0) return 'articles';
  if (results.skills.length > 0) return 'skills';
  return 'articles';
}

function MobileSearchContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(initialQ);
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults>({ articles: [], skills: [] });
  const [activeTab, setActiveTab] = useState<SearchTab>('articles');
  const [skillSheet, setSkillSheet] = useState<{
    name: string;
    content: string;
    introduction: string;
    category: SkillCategory;
  } | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ articles: [], skills: [] });
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      searchPublicContent(query.trim())
        .then((data) => {
          setResults(data);
          setActiveTab(pickDefaultTab(data));
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const tabItems = useMemo(
    () => [
      { key: 'articles' as const, label: `文章 (${results.articles.length})` },
      { key: 'skills' as const, label: `技能 (${results.skills.length})` },
    ],
    [results.articles.length, results.skills.length],
  );

  const openSkill = async (skillId: string) => {
    try {
      const detail = await fetchSkillDetail(skillId);
      setSkillSheet({
        name: detail.name,
        content: detail.content ?? '',
        introduction: detail.introduction,
        category: detail.category,
      });
    } catch {
      // ignore
    }
  };

  return (
    <div>
      <IOSNavBar largeTitle="搜索" />
      <div
        onFocusCapture={() => setFocused(true)}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setFocused(false);
          }
        }}
      >
        <IOSSearchField
          value={query}
          onChange={setQuery}
          placeholder="搜索文章或技能"
          showCancel={focused || query.length > 0}
          onCancel={() => setFocused(false)}
        />
      </div>

      {!query.trim() && (
        <div className="ios-empty" style={{ paddingTop: 24 }}>
          输入关键词搜索文章与技能
        </div>
      )}

      {query.trim() && loading && <div className="ios-skeleton" />}

      {query.trim() && !loading && (
        <>
          <IOSSegmentedControl
            items={tabItems}
            activeKey={activeTab}
            onChange={setActiveTab}
          />

          {activeTab === 'articles' && (
            <>
              {results.articles.length === 0 ? (
                <div className="ios-empty">未找到相关文章</div>
              ) : (
                <IOSGroupedList>
                  {results.articles.map(({ article, issue_number }) => (
                    <IOSFeedRow
                      key={article.id}
                      title={article.title}
                      body={article.introduction}
                      category={article.category}
                      meta={`第 ${issue_number} 期 · ${article.source_name}`}
                      href={buildMobileHref(`/article/${article.id}`, { from: 'search' })}
                    />
                  ))}
                </IOSGroupedList>
              )}
            </>
          )}

          {activeTab === 'skills' && (
            <>
              {results.skills.length === 0 ? (
                <div className="ios-empty">未找到相关技能</div>
              ) : (
                <IOSGroupedList>
                  {results.skills.map((skill) => (
                    <IOSListCell
                      key={skill.id}
                      title={skill.name}
                      subtitle={skill.introduction}
                      onClick={() => openSkill(skill.id)}
                    />
                  ))}
                </IOSGroupedList>
              )}
            </>
          )}
        </>
      )}

      <IOSSheet
        open={!!skillSheet}
        onClose={() => setSkillSheet(null)}
        title={skillSheet?.name ?? ''}
      >
        {skillSheet && (
          <>
            <IOSSkillCategoryTag category={skillSheet.category} />
            <p className="ios-text-subhead" style={{ margin: '12px 0' }}>
              {skillSheet.introduction}
            </p>
            {skillSheet.content && <IOSMarkdown content={skillSheet.content} />}
          </>
        )}
      </IOSSheet>
    </div>
  );
}

export default function MobileSearchPage() {
  return (
    <Suspense>
      <MobileSearchContent />
    </Suspense>
  );
}
