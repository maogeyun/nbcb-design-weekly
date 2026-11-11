'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Skill, SkillCategory } from '@/types';
import { SKILL_CATEGORY_LABELS, SKILL_CATEGORY_ORDER } from '@/lib/constants';
import {
  filterSkillsByCategory,
  filterSkillsByKeyword,
  parseSkillCategory,
} from '@/lib/skill-utils';
import { fetchSkillsList, fetchSkillDetail } from '@/lib/public-data-client';
import { IOSNavBar } from '@/components/ios/IOSNavBar';
import { IOSSearchField } from '@/components/ios/IOSSearchField';
import { IOSSegmentedControl } from '@/components/ios/IOSSegmentedControl';
import { IOSGroupedList, IOSListCell } from '@/components/ios/IOSGroupedList';
import { IOSSheet } from '@/components/ios/IOSSheet';
import { IOSMarkdown } from '@/components/ios/IOSMarkdown';
import { skillCategoryTagStyles } from '@/lib/tokens';

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

function buildSkillsHref(category?: SkillCategory, keyword?: string): string {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (keyword?.trim()) params.set('q', keyword.trim());
  const query = params.toString();
  return query ? `/m/skills?${query}` : '/m/skills';
}

function MobileSkillsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCategory = searchParams.get('category');
  const keyword = searchParams.get('q') ?? '';
  const category = parseSkillCategory(rawCategory);

  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(keyword);
  const [sheet, setSheet] = useState<{
    name: string;
    introduction: string;
    category: SkillCategory;
    content: string;
  } | null>(null);

  useEffect(() => {
    fetchSkillsList()
      .then((data) => {
        setSkills(data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (rawCategory && !category) {
      router.replace(buildSkillsHref(undefined, keyword));
    }
  }, [rawCategory, category, keyword, router]);

  const filtered = useMemo(() => {
    let list = filterSkillsByCategory(skills, category);
    if (search.trim()) {
      list = filterSkillsByKeyword(list, search.trim());
    }
    return list;
  }, [skills, category, search]);

  const tabItems = [
    { key: 'all' as const, label: '全部' },
    ...SKILL_CATEGORY_ORDER.map((c) => ({
      key: c,
      label: SKILL_CATEGORY_LABELS[c],
    })),
  ];

  const activeKey = category ?? 'all';

  const openSkill = async (skillId: string) => {
    try {
      const detail = await fetchSkillDetail(skillId);
      setSheet({
        name: detail.name,
        introduction: detail.introduction,
        category: detail.category,
        content: detail.content ?? '',
      });
    } catch {
      // ignore
    }
  };

  return (
    <div>
      <IOSNavBar largeTitle="设计技能" />

      <IOSSearchField
        value={search}
        onChange={(v) => {
          setSearch(v);
          router.replace(buildSkillsHref(category, v));
        }}
        placeholder="搜索技能"
      />

      <IOSSegmentedControl
        items={tabItems}
        activeKey={activeKey}
        onChange={(key) => {
          router.replace(
            buildSkillsHref(key === 'all' ? undefined : key, search),
          );
        }}
      />

      {loading && (
        <>
          <div className="ios-skeleton" />
          <div className="ios-skeleton" />
        </>
      )}

      {!loading && filtered.length === 0 && (
        <div className="ios-empty">暂无匹配的技能</div>
      )}

      {!loading && filtered.length > 0 && (
        <IOSGroupedList>
          {filtered.map((skill) => (
            <IOSListCell
              key={skill.id}
              title={
                <span style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <IOSSkillCategoryTag category={skill.category} />
                  <span>{skill.name}</span>
                </span>
              }
              subtitle={skill.introduction}
              onClick={() => openSkill(skill.id)}
            />
          ))}
        </IOSGroupedList>
      )}

      <IOSSheet open={!!sheet} onClose={() => setSheet(null)} title={sheet?.name ?? ''}>
        {sheet && (
          <>
            <IOSSkillCategoryTag category={sheet.category} />
            <p className="ios-text-subhead" style={{ margin: '12px 0' }}>
              {sheet.introduction}
            </p>
            {sheet.content && <IOSMarkdown content={sheet.content} />}
          </>
        )}
      </IOSSheet>
    </div>
  );
}

export default function MobileSkillsPage() {
  return (
    <Suspense>
      <MobileSkillsContent />
    </Suspense>
  );
}
