import type { ArticleCategory, SkillCategory } from '@/types';

export const CATEGORY_LABELS: Record<ArticleCategory, string> = {
  ui_design: 'UI设计',
  design_experience: '设计经验',
  ai_frontier: 'AI前沿',
};

export const CATEGORY_ORDER: ArticleCategory[] = [
  'ui_design',
  'design_experience',
  'ai_frontier',
];

export const SITE_NAME = '宁波银行设计周刊';
export const SITE_TAGLINE = '每周精选 UI 设计、设计经验与 AI 前沿';

export const INTRO_MIN = 150;
export const INTRO_MAX = 300;
/** 发布门禁：文章总数超过 3 篇即可（不区分栏目） */
export const ISSUE_MIN_ARTICLES = 3;
export const ISSUE_MAX_ARTICLES = 15;

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  requirements_analysis: '需求分析',
  user_analysis: '用户分析',
  solution_design: '方案设计',
  design_acceptance: '设计验收',
  effect_validation: '效果验证',
};

export const SKILL_CATEGORY_ORDER: SkillCategory[] = [
  'requirements_analysis',
  'user_analysis',
  'solution_design',
  'design_acceptance',
  'effect_validation',
];
