import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const WEB_ROOT = path.resolve(__dirname, '../..');
const STORE_PATH = path.join(WEB_ROOT, 'data', 'store.json');
const SEED_PATH = path.join(WEB_ROOT, 'src', 'mocks', 'seed.json');
const SKILLS_JSON_PATH = path.join(WEB_ROOT, 'data', 'skills.json');
export const SKILLS_DIR = path.join(WEB_ROOT, 'public', 'skills');
export const PUBLIC_DIR = path.join(WEB_ROOT, 'public');

export const HOME_PREVIEW_ARTICLE_COUNT = 3;

export const CATEGORY_LABELS = {
  ui_design: 'UI设计',
  design_experience: '设计经验',
  ai_frontier: 'AI前沿',
};

export const CATEGORY_ORDER = ['ui_design', 'design_experience', 'ai_frontier'];

export const SITE_NAME = '宁波银行设计周刊';
export const SITE_TAGLINE = '每周精选 UI 设计、设计经验与 AI 前沿';

export const SKILL_CATEGORY_LABELS = {
  requirements_analysis: '需求分析',
  user_analysis: '用户分析',
  solution_design: '方案设计',
  design_acceptance: '设计验收',
  effect_validation: '效果验证',
};

export const SKILL_CATEGORY_ORDER = [
  'requirements_analysis',
  'user_analysis',
  'solution_design',
  'design_acceptance',
  'effect_validation',
];

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
const SKILL_FILE_PATH_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;
const SKILL_PACKAGE_PATH_RE = /^packages\/[a-z0-9]+(?:-[a-z0-9]+)*\.zip$/;

function loadJson(filePath, fallback) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch {
    // fall through
  }
  return fallback;
}

export function loadStore() {
  return loadJson(STORE_PATH, loadJson(SEED_PATH, { issues: [], articles: [] }));
}

export function loadSkills() {
  return (loadJson(SKILLS_JSON_PATH, { skills: [] }).skills ?? []);
}

export function countByCategory(articles) {
  return {
    ui_design: articles.filter((a) => a.category === 'ui_design').length,
    design_experience: articles.filter((a) => a.category === 'design_experience')
      .length,
    ai_frontier: articles.filter((a) => a.category === 'ai_frontier').length,
  };
}

export function getIssueArticles(store, issue) {
  return issue.article_ids
    .map((id) => store.articles.find((a) => a.id === id))
    .filter(Boolean)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

export function getLatestPublishedIssueHomePreview(store) {
  const issue = [...store.issues]
    .filter((i) => i.status === 'published')
    .sort((a, b) => b.issue_number - a.issue_number)[0];
  if (!issue) return null;

  const articles = getIssueArticles(store, issue).filter(
    (a) => a.status === 'published',
  );

  return {
    ...issue,
    article_count: articles.length,
    category_counts: countByCategory(articles),
    preview_articles: articles.slice(0, HOME_PREVIEW_ARTICLE_COUNT),
  };
}

export function getPublishedIssues(store) {
  return [...store.issues]
    .filter((i) => i.status === 'published' || i.status === 'unpublished')
    .sort((a, b) => b.issue_number - a.issue_number)
    .map((issue) => {
      const articles = getIssueArticles(store, issue);
      return {
        ...issue,
        article_count: articles.length,
        category_counts: countByCategory(articles),
      };
    });
}

export function getIssueDetail(store, id) {
  const issue = store.issues.find((i) => i.id === id);
  if (!issue || issue.status === 'draft') return null;
  const articles = getIssueArticles(store, issue).filter(
    (a) => a.status === 'published',
  );
  return {
    ...issue,
    articles,
    article_count: articles.length,
    category_counts: countByCategory(articles),
  };
}

export function getPublishedArticle(store, id) {
  const article = store.articles.find((a) => a.id === id);
  if (!article || article.status !== 'published' || !article.issue_id) return null;
  const issue = store.issues.find((i) => i.id === article.issue_id);
  if (!issue || issue.status !== 'published') return null;
  return { article, issue };
}

export function buildSearchIndex(store) {
  const articles = [];
  for (const issue of store.issues.filter((i) => i.status === 'published')) {
    for (const article of getIssueArticles(store, issue)) {
      if (article.status !== 'published') continue;
      articles.push({
        article,
        issue_number: issue.issue_number,
        issue_id: issue.id,
      });
    }
  }
  return articles;
}

function parseSkillMarkdown(raw) {
  const match = raw.match(FRONTMATTER_RE);
  return match ? match[2] : raw;
}

export function readSkillMarkdown(filePath) {
  if (!SKILL_FILE_PATH_RE.test(filePath)) return '';
  const diskPath = path.resolve(SKILLS_DIR, filePath);
  if (!diskPath.startsWith(SKILLS_DIR + path.sep) || !fs.existsSync(diskPath)) {
    return '';
  }
  return parseSkillMarkdown(fs.readFileSync(diskPath, 'utf-8'));
}

export function skillPackageExists(packagePath) {
  if (!SKILL_PACKAGE_PATH_RE.test(packagePath)) return false;
  const diskPath = path.resolve(SKILLS_DIR, packagePath);
  const packagesDir = path.join(SKILLS_DIR, 'packages');
  return (
    diskPath.startsWith(packagesDir + path.sep) && fs.existsSync(diskPath)
  );
}

export function getSkillDetail(skill) {
  const content = skill.file_path ? readSkillMarkdown(skill.file_path) : '';
  const has_package = skill.package_path
    ? skillPackageExists(skill.package_path)
    : false;
  return { ...skill, content, has_package };
}

export function buildHeroSubtitle(issue) {
  if (issue.cover_summary?.trim()) return issue.cover_summary.trim();
  const themes = CATEGORY_ORDER.filter((c) => issue.category_counts[c] > 0).map(
    (c) => CATEGORY_LABELS[c],
  );
  if (themes.length === 0) return '本周精选文章';
  return `本周精选：${themes.join(' · ')}`;
}

export function buildArchiveStatsText(articleCount, counts) {
  const themes = CATEGORY_ORDER.filter((c) => counts[c] > 0).map(
    (c) => CATEGORY_LABELS[c],
  );
  const themePart = themes.length > 0 ? `，涵盖 ${themes.join('、')}` : '';
  return `共收录 ${articleCount} 篇精选文章${themePart}`;
}

export function truncateIntro(text, max = 120) {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max)}…`;
}
