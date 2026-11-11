import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  buildSearchIndex,
  getIssueDetail,
  getLatestPublishedIssueHomePreview,
  getPublishedArticle,
  getPublishedIssues,
  getSkillDetail,
  loadSkills,
  loadStore,
  PUBLIC_DIR,
  WEB_ROOT,
} from './offline-html/data.mjs';
import {
  renderAbout,
  renderArchive,
  renderArticle,
  renderHome,
  renderSearch,
  renderSkillDetail,
  renderSkillsList,
  renderWeekly,
} from './offline-html/render.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(WEB_ROOT, '..');
const OUT_DIR = path.join(REPO_ROOT, 'offline-site');
const CSS_SRC = path.join(__dirname, 'offline-html', 'offline.css');

function writeHtml(filePath, html) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, html, 'utf-8');
}

function copyAssets() {
  const assetsDir = path.join(OUT_DIR, 'assets');
  fs.mkdirSync(assetsDir, { recursive: true });
  fs.copyFileSync(CSS_SRC, path.join(assetsDir, 'style.css'));

  for (const logo of ['nbcb-brand-logo.png', 'nbcb-logo-icon.png']) {
    const src = path.join(PUBLIC_DIR, logo);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(assetsDir, logo));
    }
  }
}

function main() {
  if (fs.existsSync(OUT_DIR)) {
    fs.rmSync(OUT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });
  copyAssets();

  const store = loadStore();
  const skills = loadSkills();
  const searchIndex = buildSearchIndex(store);
  const latest = getLatestPublishedIssueHomePreview(store);
  const issues = getPublishedIssues(store);

  let pageCount = 0;

  writeHtml(path.join(OUT_DIR, 'index.html'), renderHome('index.html', latest));
  pageCount += 1;

  writeHtml(path.join(OUT_DIR, 'archive.html'), renderArchive('archive.html', issues));
  pageCount += 1;

  writeHtml(path.join(OUT_DIR, 'search.html'), renderSearch('search.html', searchIndex, skills));
  pageCount += 1;

  writeHtml(path.join(OUT_DIR, 'skills.html'), renderSkillsList('skills.html', skills));
  pageCount += 1;

  writeHtml(path.join(OUT_DIR, 'about.html'), renderAbout('about.html'));
  pageCount += 1;

  for (const issue of store.issues.filter((i) => i.status === 'published')) {
    const detail = getIssueDetail(store, issue.id);
    if (!detail) continue;
    const rel = `weekly/${issue.id}.html`;
    writeHtml(path.join(OUT_DIR, rel), renderWeekly(rel, detail));
    pageCount += 1;
  }

  for (const hit of searchIndex) {
    const result = getPublishedArticle(store, hit.article.id);
    if (!result) continue;
    const rel = `article/${hit.article.id}.html`;
    writeHtml(
      path.join(OUT_DIR, rel),
      renderArticle(rel, result.article, result.issue),
    );
    pageCount += 1;
  }

  for (const skill of skills) {
    const detail = getSkillDetail(skill);
    const rel = `skills/${skill.id}.html`;
    writeHtml(path.join(OUT_DIR, rel), renderSkillDetail(rel, detail));
    pageCount += 1;
  }

  const manifest = {
    generated_at: new Date().toISOString(),
    pages: pageCount,
    mode: 'offline-file',
    note: '可直接双击 HTML 打开，或通过本地文件夹浏览',
  };
  fs.writeFileSync(
    path.join(OUT_DIR, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf-8',
  );

  console.log(`[offline-html] generated ${pageCount} pages → ${OUT_DIR}`);
  console.log('[offline-html] open offline-site/index.html directly in your browser');
}

main();
