import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(__dirname, '..');
const STORE_PATH = path.join(WEB_ROOT, 'data', 'store.json');
const SEED_PATH = path.join(WEB_ROOT, 'src', 'mocks', 'seed.json');
const SKILLS_JSON_PATH = path.join(WEB_ROOT, 'data', 'skills.json');
const SKILLS_DIR = path.join(WEB_ROOT, 'public', 'skills');
const STATIC_DATA_DIR = path.join(WEB_ROOT, 'public', 'static-data');
const IOS_BUNDLE_DIR = path.resolve(
  WEB_ROOT,
  '..',
  'ios',
  'NBCBDesignWeekly',
  'NBCBDesignWeekly',
  'Resources',
  'BundledData',
);

const HOME_PREVIEW_ARTICLE_COUNT = 3;
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

function countByCategory(articles) {
  return {
    ui_design: articles.filter((a) => a.category === 'ui_design').length,
    design_experience: articles.filter((a) => a.category === 'design_experience').length,
    ai_frontier: articles.filter((a) => a.category === 'ai_frontier').length,
  };
}

function getIssueArticles(store, issue) {
  return issue.article_ids
    .map((id) => store.articles.find((a) => a.id === id))
    .filter(Boolean)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

function getLatestPublishedIssueHomePreview(store) {
  const issue = [...store.issues]
    .filter((i) => i.status === 'published')
    .sort((a, b) => b.issue_number - a.issue_number)[0];
  if (!issue) return null;

  const articles = getIssueArticles(store, issue).filter((a) => a.status === 'published');
  return {
    ...issue,
    article_count: articles.length,
    category_counts: countByCategory(articles),
    preview_articles: articles.slice(0, HOME_PREVIEW_ARTICLE_COUNT),
  };
}

function getPublishedIssues(store) {
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

function getIssueDetail(store, id) {
  const issue = store.issues.find((i) => i.id === id);
  if (!issue || issue.status !== 'published') return null;
  const articles = getIssueArticles(store, issue).filter((a) => a.status === 'published');
  return {
    ...issue,
    articles,
    article_count: articles.length,
    category_counts: countByCategory(articles),
  };
}

function buildSearchIndex(store) {
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

function readSkillMarkdown(filePath) {
  if (!SKILL_FILE_PATH_RE.test(filePath)) return '';
  const diskPath = path.resolve(SKILLS_DIR, filePath);
  if (!diskPath.startsWith(SKILLS_DIR + path.sep) || !fs.existsSync(diskPath)) {
    return '';
  }
  return parseSkillMarkdown(fs.readFileSync(diskPath, 'utf-8'));
}

function skillPackageExists(packagePath) {
  if (!SKILL_PACKAGE_PATH_RE.test(packagePath)) return false;
  const diskPath = path.resolve(SKILLS_DIR, packagePath);
  const packagesDir = path.join(SKILLS_DIR, 'packages');
  return diskPath.startsWith(packagesDir + path.sep) && fs.existsSync(diskPath);
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf-8');
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function bakeStaticData(store, skills) {
  if (fs.existsSync(STATIC_DATA_DIR)) {
    fs.rmSync(STATIC_DATA_DIR, { recursive: true, force: true });
  }

  writeJson(path.join(STATIC_DATA_DIR, 'latest-issue.json'), {
    data: getLatestPublishedIssueHomePreview(store),
  });
  writeJson(path.join(STATIC_DATA_DIR, 'issues.json'), {
    data: getPublishedIssues(store),
  });
  writeJson(path.join(STATIC_DATA_DIR, 'skills.json'), { data: skills });
  writeJson(path.join(STATIC_DATA_DIR, 'search-index.json'), {
    articles: buildSearchIndex(store),
    skills,
  });

  for (const skill of skills) {
    const content = skill.file_path ? readSkillMarkdown(skill.file_path) : '';
    const has_package = skill.package_path ? skillPackageExists(skill.package_path) : false;
    writeJson(path.join(STATIC_DATA_DIR, 'skills', `${skill.id}.json`), {
      data: { ...skill, content, has_package },
    });
  }

  for (const issue of store.issues.filter((i) => i.status === 'published')) {
    const detail = getIssueDetail(store, issue.id);
    if (detail) {
      writeJson(path.join(STATIC_DATA_DIR, 'issues', `${issue.id}.json`), { data: detail });
    }
    for (const article of getIssueArticles(store, issue).filter((a) => a.status === 'published')) {
      writeJson(path.join(STATIC_DATA_DIR, 'articles', `${article.id}.json`), { data: article });
    }
  }

  writeJson(path.join(STATIC_DATA_DIR, 'manifest.json'), {
    generated_at: new Date().toISOString(),
    published_issues: store.issues.filter((i) => i.status === 'published').length,
    skills: skills.length,
  });
}

function exportToIOSBundle() {
  const store = loadJson(STORE_PATH, loadJson(SEED_PATH, { issues: [], articles: [] }));
  const skillsData = loadJson(SKILLS_JSON_PATH, { skills: [] });
  const skills = skillsData.skills ?? [];

  bakeStaticData(store, skills);

  if (fs.existsSync(IOS_BUNDLE_DIR)) {
    fs.rmSync(IOS_BUNDLE_DIR, { recursive: true, force: true });
  }
  copyDir(STATIC_DATA_DIR, IOS_BUNDLE_DIR);

  console.log(`[ios-bundle] exported to ${IOS_BUNDLE_DIR}`);
}

exportToIOSBundle();
