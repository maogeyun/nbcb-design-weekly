'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Empty, Flex, Input, Skeleton, Tabs, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { motion, useMotionValue, useSpring, useTransform, useAnimationFrame, useReducedMotion } from 'framer-motion';
import type { Skill, SkillCategory } from '@/types';
import { SKILL_CATEGORY_LABELS, SKILL_CATEGORY_ORDER } from '@/lib/constants';
import {
  filterSkillsByCategory,
  filterSkillsByKeyword,
  parseSkillCategory,
} from '@/lib/skill-utils';
import { SkillCard } from '@/components/SkillCard';
import { SkillDetailModal } from '@/components/SkillDetailModal';
import { PageHeader } from '@/components/layout/PageHeader';

const { Text } = Typography;

function SkillTabLabel({ name, count }: { name: string; count: number }) {
  return (
    <span>
      {name}
      <Text type="secondary" style={{ marginLeft: 6, fontSize: 13, fontWeight: 400 }}>
        {count}
      </Text>
    </span>
  );
}

function buildSkillsHref(
  category?: SkillCategory,
  skillId?: string | null,
  keyword?: string,
): string {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (skillId) params.set('skill', skillId);
  if (keyword?.trim()) params.set('q', keyword.trim());
  const query = params.toString();
  return query ? `/skills?${query}` : '/skills';
}

// Client-only decorative liquid background.
// Rendered only after mount to avoid any SSR/client style serialization differences
// that cause hydration mismatch (numbers vs "xxpx", expanded border-radius, etc.).
function LiquidBackground() {
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [winSize, setWinSize] = useState({ w: 1280, h: 900 });

  // === ALL hooks must be called unconditionally (Rules of Hooks) ===
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springCfg = { stiffness: 48, damping: 26, mass: 1.25 };
  const smoothX = useSpring(mouseX, springCfg);
  const smoothY = useSpring(mouseY, springCfg);

  const drift1 = useMotionValue(0);
  const drift2 = useMotionValue(0);
  const drift3 = useMotionValue(0);
  const drift4 = useMotionValue(0);
  const drift5 = useMotionValue(0);
  const drift6 = useMotionValue(0);

  useAnimationFrame((t) => {
    if (!mounted || prefersReducedMotion) return;
    const s = t * 0.001;
    drift1.set(Math.sin(s * 0.95) * 92);
    drift2.set(Math.cos(s * 0.72 + 1.1) * 116);
    drift3.set(Math.sin(s * 1.05 + 2.3) * 78);
    drift4.set(Math.cos(s * 0.63 + 3.7) * 102);
    drift5.set(Math.sin(s * 0.82 + 0.6) * 88);
    drift6.set(Math.cos(s * 1.01 + 4.9) * 72);
  });

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const nw = window.innerWidth;
      const nh = window.innerHeight;
      setWinSize({ w: nw, h: nh });
      // Prime initial mouse position for blob attraction (centerish)
      mouseX.set(nw * 0.55);
      mouseY.set(nh * 0.42);
    }
  }, []);

  useEffect(() => {
    if (!mounted || prefersReducedMotion) return;
    const onMove = (e: PointerEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [mounted, prefersReducedMotion, mouseX, mouseY]);

  useEffect(() => {
    if (!mounted || prefersReducedMotion) return;
    const onResize = () => {
      const nw = window.innerWidth;
      const nh = window.innerHeight;
      setWinSize({ w: nw, h: nh });
      mouseX.set(nw * 0.55);
      mouseY.set(nh * 0.42);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [mounted, prefersReducedMotion, mouseX, mouseY]);

  // Compute reactive blob positions (hooks must stay above any early return)
  // winSize is set post-mount via useEffect (no window access during render to satisfy hydration rules)
  const w = winSize.w;
  const h = winSize.h;

  const blob1X = useTransform([smoothX, drift1], ([mx, d]: number[]) => (mx - w * 0.5) * 0.068 + d);
  const blob1Y = useTransform([smoothY, drift2], ([my, d]: number[]) => (my - h * 0.38) * 0.056 + d);

  const blob2X = useTransform([smoothX, drift2], ([mx, d]: number[]) => (mx - w * 0.5) * 0.097 + d);
  const blob2Y = useTransform([smoothY, drift3], ([my, d]: number[]) => (my - h * 0.62) * 0.080 + d);

  const blob3X = useTransform([smoothX, drift3], ([mx, d]: number[]) => (mx - w * 0.5) * 0.053 + d);
  const blob3Y = useTransform([smoothY, drift4], ([my, d]: number[]) => (my - h * 0.29) * 0.046 + d);

  const blob4X = useTransform([smoothX, drift4], ([mx, d]: number[]) => (mx - w * 0.5) * 0.083 + d);
  const blob4Y = useTransform([smoothY, drift5], ([my, d]: number[]) => (my - h * 0.71) * 0.071 + d);

  const blob5X = useTransform([smoothX, drift5], ([mx, d]: number[]) => (mx - w * 0.5) * 0.060 + d);
  const blob5Y = useTransform([smoothY, drift6], ([my, d]: number[]) => (my - h * 0.48) * 0.065 + d);

  const blob6X = useTransform([smoothX, drift6], ([mx, d]: number[]) => (mx - w * 0.5) * 0.109 + d);
  const blob6Y = useTransform([smoothY, drift1], ([my, d]: number[]) => (my - h * 0.55) * 0.044 + d);

  // Base wash (kept calmer than main blobs)
  const baseWashX = useTransform([smoothX, drift1], ([mx, d]: number[]) => (mx - w * 0.5) * 0.013 + d);
  const baseWashY = useTransform([smoothY, drift2], ([my, d]: number[]) => (my - h * 0.38) * 0.010 + d);

  // Only after ALL hooks can we decide to render nothing
  if (!mounted || prefersReducedMotion) {
    return null;
  }

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
    >
      {/* Large low-opacity base wash layer (first, behind colored blobs) */}
      <motion.div
        style={{
          position: 'absolute',
          left: '50%',
          top: '38%',
          width: '920px',
          height: '920px',
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,166,47,0.10) 0%, rgba(255,166,47,0.03) 60%, transparent 82%)',
          filter: 'blur(110px)',
          x: baseWashX,
          y: baseWashY,
        }}
      />
      <motion.div
        style={{
          position: 'absolute',
          left: '-4%',
          top: '22%',
          width: '380px',
          height: '380px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 40% 30%, rgba(255,166,47,0.42) 0%, rgba(255,166,47,0.14) 55%, transparent 80%)',
          filter: 'blur(58px)',
          x: blob1X,
          y: blob1Y,
        }}
      />
      <motion.div
        style={{
          position: 'absolute',
          right: '-2%',
          top: '31%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 55% 40%, rgba(124,58,237,0.36) 0%, rgba(124,58,237,0.12) 60%, transparent 82%)',
          filter: 'blur(58px)',
          x: blob2X,
          y: blob2Y,
        }}
      />
      <motion.div
        style={{
          position: 'absolute',
          left: '22%',
          bottom: '18%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 65%, rgba(8,145,178,0.38) 0%, rgba(8,145,178,0.12) 58%, transparent 78%)',
          filter: 'blur(56px)',
          x: blob3X,
          y: blob3Y,
        }}
      />
      <motion.div
        style={{
          position: 'absolute',
          right: '2%',
          bottom: '24%',
          width: '480px',
          height: '480px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 60% 55%, rgba(20,83,45,0.33) 0%, rgba(20,83,45,0.11) 62%, transparent 80%)',
          filter: 'blur(68px)',
          x: blob4X,
          y: blob4Y,
        }}
      />
      <motion.div
        style={{
          position: 'absolute',
          left: '38%',
          top: '12%',
          width: '310px',
          height: '310px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 45% 35%, rgba(204,133,36,0.39) 0%, rgba(204,133,36,0.12) 55%, transparent 75%)',
          filter: 'blur(52px)',
          x: blob5X,
          y: blob5Y,
        }}
      />
      <motion.div
        style={{
          position: 'absolute',
          right: '18%',
          top: '40%',
          width: '420px',
          height: '420px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 48%, rgba(56,189,248,0.32) 0%, rgba(56,189,248,0.10) 60%, transparent 78%)',
          filter: 'blur(66px)',
          x: blob6X,
          y: blob6Y,
        }}
      />
    </div>
  );
}

function SkillsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCategory = searchParams.get('category');
  const category = parseSkillCategory(rawCategory);
  const keywordFromUrl = searchParams.get('q') ?? '';

  const rawSkill = searchParams.get('skill');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [draftKeyword, setDraftKeyword] = useState(keywordFromUrl);
  const [isToolbarStuck, setIsToolbarStuck] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const isComposingRef = useRef(false);

  useEffect(() => {
    if (!isComposingRef.current) {
      setDraftKeyword(keywordFromUrl);
    }
  }, [keywordFromUrl]);

  const syncKeywordToUrl = (value: string) => {
    router.replace(buildSkillsHref(category, null, value));
  };

  const handleKeywordChange = (value: string) => {
    setDraftKeyword(value);
    if (!isComposingRef.current) {
      syncKeywordToUrl(value);
    }
  };

  const handleCompositionEnd = (
    e: React.CompositionEvent<HTMLInputElement>,
  ) => {
    isComposingRef.current = false;
    const value = e.currentTarget.value;
    setDraftKeyword(value);
    syncKeywordToUrl(value);
  };

  useEffect(() => {
    if (rawCategory && !category) {
      router.replace(buildSkillsHref(undefined, rawSkill, draftKeyword));
    }
  }, [rawCategory, category, router, rawSkill, draftKeyword]);

  useEffect(() => {
    fetch('/api/skills')
      .then((r) => r.json())
      .then((json) => {
        setSkills(json.data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let frame = 0;

    const updateToolbarState = () => {
      const toolbar = toolbarRef.current;
      if (!toolbar) return;

      const rootStyle = getComputedStyle(document.documentElement);
      const headerHeight = Number.parseFloat(
        rootStyle.getPropertyValue('--app-header-height'),
      ) || 64;
      const isStuck = toolbar.getBoundingClientRect().top <= headerHeight + 0.5;
      setIsToolbarStuck(isStuck);
    };

    const requestUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateToolbarState);
    };

    requestUpdate();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, []);

  const keywordFilteredSkills = useMemo(() => {
    if (!draftKeyword.trim()) return skills;
    return filterSkillsByKeyword(skills, draftKeyword);
  }, [skills, draftKeyword]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: keywordFilteredSkills.length,
    };
    for (const c of SKILL_CATEGORY_ORDER) {
      counts[c] = keywordFilteredSkills.filter((skill) => skill.category === c).length;
    }
    return counts;
  }, [keywordFilteredSkills]);

  const filtered = useMemo(
    () => filterSkillsByCategory(keywordFilteredSkills, category),
    [keywordFilteredSkills, category],
  );

  const selectedSkillId = useMemo(() => {
    if (loading || !rawSkill) return null;
    return filtered.some((s) => s.id === rawSkill) ? rawSkill : null;
  }, [loading, rawSkill, filtered]);

  useEffect(() => {
    if (loading || !rawSkill) return;
    if (!filtered.some((s) => s.id === rawSkill)) {
      router.replace(buildSkillsHref(category, null, draftKeyword));
    }
  }, [loading, rawSkill, filtered, category, draftKeyword, router]);

  const openSkillDetail = (skillId: string) => {
    router.replace(buildSkillsHref(category, skillId, draftKeyword));
  };

  const closeSkillDetail = () => {
    router.replace(buildSkillsHref(category, null, draftKeyword));
  };

  const tabItems = useMemo(
    () => [
      {
        key: 'all',
        label: <SkillTabLabel name="全部" count={tabCounts.all ?? 0} />,
      },
      ...SKILL_CATEGORY_ORDER.map((c) => ({
        key: c,
        label: (
          <SkillTabLabel
            name={SKILL_CATEGORY_LABELS[c]}
            count={tabCounts[c] ?? 0}
          />
        ),
      })),
    ],
    [tabCounts],
  );

  const activeKey = category ?? 'all';

  if (loading) {
    return (
      <>
        <LiquidBackground />
        <div className="relative z-[1]">
          <Flex vertical gap={16}>
            <PageHeader
              title="设计技能库"
              description="UED 团队常用设计思维与方法技能，按阶段分类浏览与下载"
            />
            <Skeleton active paragraph={{ rows: 8 }} />
          </Flex>
        </div>
      </>
    );
  }

  return (
    <>
      <LiquidBackground />

      <div className="relative z-[1]">
        <Flex vertical>
          <PageHeader
            title="设计技能库"
            description="UED 团队常用设计思维与方法技能，按阶段分类浏览与下载"
          />

          <div
            ref={toolbarRef}
            className={
              isToolbarStuck
                ? 'skills-sticky-toolbar skills-sticky-toolbar--stuck'
                : 'skills-sticky-toolbar'
            }
          >
            <div className="skills-sticky-toolbar__inner">
              <Input
                allowClear
                prefix={<SearchOutlined />}
                placeholder="搜索名称、简介、分类"
                value={draftKeyword}
                onChange={(e) => handleKeywordChange(e.target.value)}
                onCompositionStart={() => {
                  isComposingRef.current = true;
                }}
                onCompositionEnd={handleCompositionEnd}
              />

              <Tabs
                className="skills-page-tabs"
                activeKey={activeKey}
                items={tabItems}
                onChange={(key) => {
                  router.replace(
                    buildSkillsHref(
                      key === 'all' ? undefined : (key as SkillCategory),
                      null,
                      draftKeyword,
                    ),
                  );
                }}
              />
            </div>
          </div>

          <div className="skills-page-content">
            {filtered.length === 0 ? (
              <Empty
                description={
                  draftKeyword.trim()
                    ? `未找到与「${draftKeyword.trim()}」相关的技能`
                    : `暂无${category ? SKILL_CATEGORY_LABELS[category] : ''}技能`
                }
              />
            ) : (
              <div className="skill-grid">
                {filtered.map((skill) => (
                  <SkillCard
                    key={skill.id}
                    skill={skill}
                    onClick={() => openSkillDetail(skill.id)}
                  />
                ))}
              </div>
            )}
          </div>

          <SkillDetailModal
            open={Boolean(selectedSkillId)}
            skillId={selectedSkillId}
            onClose={closeSkillDetail}
          />
        </Flex>
      </div>
    </>
  );
}

export default function SkillsPage() {
  return (
    <Suspense
      fallback={
        <Flex vertical gap={16}>
          <PageHeader
            title="设计技能库"
            description="UED 团队常用设计思维与方法技能，按阶段分类浏览与下载"
          />
          <Skeleton active paragraph={{ rows: 8 }} />
        </Flex>
      }
    >
      <SkillsContent />
    </Suspense>
  );
}
