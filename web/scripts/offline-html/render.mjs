import {
  CATEGORY_LABELS,
  SITE_NAME,
  SITE_TAGLINE,
  SKILL_CATEGORY_LABELS,
  buildArchiveStatsText,
  buildHeroSubtitle,
  truncateIntro,
} from './data.mjs';
import { assetUrl, escapeHtml, hrefTo, markdownToHtml } from './utils.mjs';

const NAV_ITEMS = [
  { key: 'index.html', label: '最新周刊' },
  { key: 'archive.html', label: '归档' },
  { key: 'search.html', label: '搜索' },
  { key: 'skills.html', label: '技能' },
  { key: 'about.html', label: '关于' },
];

function activeNav(currentFile, navKey) {
  if (navKey === 'index.html') {
    return currentFile === 'index.html';
  }
  return currentFile === navKey || currentFile.startsWith(navKey.replace('.html', '/'));
}

export function renderLayout({
  currentFile,
  title,
  activeNavKey,
  body,
  extraHead = '',
  extraScript = '',
}) {
  const pageTitle = title ? `${title} · ${SITE_NAME}` : SITE_NAME;
  const cssHref = assetUrl(currentFile, 'style.css');
  const logoHref = assetUrl(currentFile, 'nbcb-brand-logo.png');

  const nav = NAV_ITEMS.map((item) => {
    const isActive = activeNavKey
      ? item.key === activeNavKey
      : activeNav(currentFile, item.key);
    return `<a class="nav-link${isActive ? ' nav-link--active' : ''}" href="${hrefTo(currentFile, item.key)}">${escapeHtml(item.label)}</a>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="description" content="${escapeHtml(SITE_TAGLINE)}" />
  <link rel="stylesheet" href="${cssHref}" />
  ${extraHead}
</head>
<body>
  <div class="layout">
    <header class="site-header">
      <div class="site-header__inner">
        <a href="${hrefTo(currentFile, 'index.html')}" aria-label="${escapeHtml(SITE_NAME)}">
          <img class="site-brand-logo" src="${logoHref}" alt="宁波银行 UED" />
        </a>
        <nav class="desktop-nav" aria-label="主导航">${nav}</nav>
      </div>
    </header>
    <main class="site-main">${body}</main>
    <footer class="site-footer">
      <a href="${hrefTo(currentFile, 'about.html')}">关于</a>
      · 本文由 AI 辅助摘要，请访问原文获取完整内容
      · © 宁波银行 UED
    </footer>
  </div>
  ${extraScript}
</body>
</html>`;
}

function categoryTag(category) {
  return `<span class="tag tag--${category}">${escapeHtml(CATEGORY_LABELS[category] ?? category)}</span>`;
}

function skillCategoryTag(category) {
  return `<span class="tag tag--${category}">${escapeHtml(SKILL_CATEGORY_LABELS[category] ?? category)}</span>`;
}

function readOriginalButton(url, broken = false) {
  if (broken || !url?.trim()) {
    return '<span class="btn btn--default btn--small" style="opacity:0.5;cursor:not-allowed">阅读原文</span>';
  }
  return `<a class="btn btn--primary btn--small" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">阅读原文</a>`;
}

export function renderHome(currentFile, latest) {
  if (!latest) {
    return renderLayout({
      currentFile,
      activeNavKey: 'index.html',
      body: `<div class="page-wrap"><div class="empty"><p>首期周刊筹备中，敬请期待</p><p>${escapeHtml(SITE_TAGLINE)}</p></div></div>`,
    });
  }

  const subtitle = buildHeroSubtitle(latest);
  const stats = buildArchiveStatsText(latest.article_count, latest.category_counts);

  const cards = latest.preview_articles
    .map((article) => {
      const broken = article.link_status === 'link_broken' || !article.original_url?.trim();
      return `<article class="featured-card">
        <a href="${hrefTo(currentFile, `article/${article.id}.html`)}">
          <h3 class="featured-card__title">${escapeHtml(article.title)}</h3>
          <p class="featured-card__intro">${escapeHtml(article.introduction)}</p>
        </a>
        <div class="featured-card__actions">
          ${readOriginalButton(article.original_url, broken)}
        </div>
      </article>`;
    })
    .join('\n');

  const body = `
    <section class="hero">
      <div class="hero__inner">
        <span class="hero__badge">NEW ISSUE</span>
        <h1>第 ${latest.issue_number} 期 · ${escapeHtml(latest.publish_date)}</h1>
        <p class="hero__subtitle">${escapeHtml(subtitle)}</p>
        <span class="hero__divider"></span>
      </div>
    </section>
    <section class="section-white">
      <div class="section-inner">
        <div class="section-title-row">
          <h2>本期精选文章</h2>
          <a class="link-primary" href="${hrefTo(currentFile, `weekly/${latest.id}.html`)}">查看全部 →</a>
        </div>
        <div class="home-article-grid">${cards}</div>
        <div class="cta-center">
          <a class="btn btn--primary btn--large" href="${hrefTo(currentFile, 'archive.html')}">查看全部归档</a>
          <p style="margin:0;font-size:12px;color:var(--color-text-muted)">${escapeHtml(stats)}</p>
        </div>
      </div>
    </section>`;

  return renderLayout({ currentFile, activeNavKey: 'index.html', body });
}

export function renderArchive(currentFile, issues) {
  const list = issues
    .filter((i) => i.status === 'published')
    .map((issue) => {
      const c = issue.category_counts;
      return `<a class="archive-card" href="${hrefTo(currentFile, `weekly/${issue.id}.html`)}">
        <h3>第 ${issue.issue_number} 期</h3>
        <p>${escapeHtml(issue.publish_date)} · ${issue.article_count} 篇</p>
        ${issue.cover_summary?.trim() ? `<p>${escapeHtml(issue.cover_summary.trim())}</p>` : ''}
        <p>${escapeHtml(CATEGORY_LABELS.ui_design)} ${c.ui_design} · ${escapeHtml(CATEGORY_LABELS.design_experience)} ${c.design_experience} · ${escapeHtml(CATEGORY_LABELS.ai_frontier)} ${c.ai_frontier}</p>
      </a>`;
    })
    .join('\n');

  const body = `<div class="page-wrap page-wrap--wide">
    <div class="page-header">
      <h1>周刊归档</h1>
      <p>按发布时间倒序</p>
    </div>
    ${list || '<div class="empty">暂无已发布周刊</div>'}
  </div>`;

  return renderLayout({
    currentFile,
    title: '周刊归档',
    activeNavKey: 'archive.html',
    body,
  });
}

export function renderWeekly(currentFile, issue) {
  const articles = issue.articles
    .map((article) => {
      const broken = article.link_status === 'link_broken' || !article.original_url?.trim();
      return `<article class="card">
        ${categoryTag(article.category)}
        <h3><a href="${hrefTo(currentFile, `article/${article.id}.html`)}">${escapeHtml(article.title)}</a></h3>
        <p>${escapeHtml(truncateIntro(article.introduction, 120))}</p>
        <div class="card__meta">${escapeHtml(article.source_name)} · ${escapeHtml(article.published_at)}</div>
        <div class="card__actions">
          <a class="btn btn--default btn--small" href="${hrefTo(currentFile, `article/${article.id}.html`)}">查看介绍</a>
          ${readOriginalButton(article.original_url, broken)}
        </div>
      </article>`;
    })
    .join('\n');

  const body = `<div class="page-wrap">
    <p class="breadcrumb"><a href="${hrefTo(currentFile, 'index.html')}">首页</a> / 第 ${issue.issue_number} 期</p>
    <div class="page-header">
      <h1>第 ${issue.issue_number} 期</h1>
      <p>${escapeHtml(issue.publish_date)} · 共 ${issue.article_count} 篇</p>
    </div>
    ${issue.cover_summary ? `<div class="summary-box">${escapeHtml(issue.cover_summary)}</div>` : ''}
    ${articles || '<div class="empty">本期暂无文章</div>'}
  </div>`;

  return renderLayout({
    currentFile,
    title: `第 ${issue.issue_number} 期`,
    body,
  });
}

export function renderArticle(currentFile, article, issue) {
  const broken = article.link_status === 'link_broken' || !article.original_url?.trim();

  const body = `<div class="page-wrap">
    <p class="breadcrumb">
      <a href="${hrefTo(currentFile, 'index.html')}">首页</a> /
      <a href="${hrefTo(currentFile, `weekly/${issue.id}.html`)}">第 ${issue.issue_number} 期</a> /
      文章
    </p>
    ${categoryTag(article.category)}
    <div class="page-header">
      <h1 style="font-size:24px;line-height:32px">${escapeHtml(article.title)}</h1>
      <p>${escapeHtml(article.source_name)} · ${escapeHtml(article.published_at)} · ${article.language === 'zh' ? '中文' : '英文'}</p>
    </div>
    <div class="intro-box">${escapeHtml(article.introduction)}</div>
    <p style="margin-bottom:16px">${readOriginalButton(article.original_url, broken)}</p>
    ${broken ? `<p style="color:var(--color-text-secondary)">原文链接暂时无法访问：${escapeHtml(article.original_url)}</p>` : ''}
    <p style="margin-top:24px">
      <a class="btn btn--default" href="${hrefTo(currentFile, `weekly/${issue.id}.html`)}">返回第 ${issue.issue_number} 期</a>
    </p>
    <p style="font-size:13px;color:var(--color-text-tertiary);margin-top:24px">本文由 AI 辅助摘要，请访问原文获取完整内容</p>
  </div>`;

  return renderLayout({
    currentFile,
    title: article.title,
    body,
  });
}

export function renderAbout(currentFile) {
  const body = `<div class="page-wrap">
    <div class="page-header"><h1>关于设计周刊</h1></div>
    <div class="card">
      <h3>周刊宗旨</h3>
      <p>宁波银行设计周刊面向 UED 团队及关注设计趋势的同事，每周精选 UI 设计、设计经验与 AI 前沿领域的公开文章，提供 AI 辅助引言与原文链接，帮助大家在有限时间内完成「浏览 → 判断 → 深读」。</p>
      <h3>内容来源</h3>
      <p>收录文章均来自互联网公开发布渠道（如 Figma Blog、NN/g、优设、UX Collective 等），经编辑策展审核后发布。</p>
      <h3>版权声明</h3>
      <p>本站仅提供编辑策展与 AI 辅助摘要（150–300 字），不拥有原文著作权，不全文转载。如需阅读完整内容，请通过「阅读原文」访问原作者页面。</p>
      <h3>反馈</h3>
      <p>内容建议或链接问题反馈：UED 团队内部渠道</p>
    </div>
  </div>`;

  return renderLayout({
    currentFile,
    title: '关于设计周刊',
    activeNavKey: 'about.html',
    body,
  });
}

export function renderSearch(currentFile, searchIndex, skills) {
  const articleItems = searchIndex
    .map(({ article, issue_number, issue_id }) => {
      return `<article class="card search-item" data-type="article" data-text="${escapeHtml(`${article.title} ${article.introduction} ${article.source_name}`.toLowerCase())}">
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:center">
          ${categoryTag(article.category)}
          <span class="card__meta" style="margin:0">第 ${issue_number} 期</span>
        </div>
        <h3><a href="${hrefTo(currentFile, `article/${article.id}.html`)}">${escapeHtml(article.title)}</a></h3>
        <p>${escapeHtml(truncateIntro(article.introduction, 160))}</p>
        <div class="card__meta">${escapeHtml(article.source_name)} · ${escapeHtml(CATEGORY_LABELS[article.category])}</div>
      </article>`;
    })
    .join('\n');

  const skillItems = skills
    .map((skill) => {
      const haystack = `${skill.name} ${skill.id} ${skill.introduction} ${SKILL_CATEGORY_LABELS[skill.category]}`.toLowerCase();
      return `<a class="skill-card search-item" data-type="skill" data-text="${escapeHtml(haystack)}" href="${hrefTo(currentFile, `skills/${skill.id}.html`)}">
        ${skillCategoryTag(skill.category)}
        <h3>${escapeHtml(skill.name)}</h3>
        <p>${escapeHtml(skill.introduction)}</p>
      </a>`;
    })
    .join('\n');

  const script = `<script>
(function () {
  const input = document.getElementById('search-input');
  const items = Array.from(document.querySelectorAll('.search-item'));
  const empty = document.getElementById('search-empty');
  const articlesPane = document.getElementById('search-articles');
  const skillsPane = document.getElementById('search-skills');
  const tabs = Array.from(document.querySelectorAll('[data-search-tab]'));
  let activeTab = 'articles';

  function setTab(tab) {
    activeTab = tab;
    tabs.forEach((el) => {
      el.classList.toggle('tab--active', el.dataset.searchTab === tab);
    });
    articlesPane.classList.toggle('hidden', tab !== 'articles');
    skillsPane.classList.toggle('hidden', tab !== 'skills');
    filter();
  }

  function filter() {
    const q = (input.value || '').trim().toLowerCase();
    let visible = 0;
    items.forEach((el) => {
      const type = el.dataset.type;
      const match = !q || (el.dataset.text || '').includes(q);
      const inPane = (activeTab === 'articles' && type === 'article') || (activeTab === 'skills' && type === 'skill');
      const show = match && (q ? type === (activeTab === 'articles' ? 'article' : 'skill') : inPane);
      el.classList.toggle('hidden', !show);
      if (show) visible += 1;
    });
    empty.classList.toggle('hidden', visible > 0 || !q);
  }

  tabs.forEach((tab) => tab.addEventListener('click', () => setTab(tab.dataset.searchTab)));
  input.addEventListener('input', filter);
  const params = new URLSearchParams(location.search);
  if (params.get('q')) {
    input.value = params.get('q');
    filter();
  }
})();
</script>`;

  const body = `<div class="page-wrap page-wrap--wide">
    <div class="page-header">
      <h1>搜索</h1>
      <p>搜索文章标题、引言、来源，或设计方法论 Skill</p>
    </div>
    <div class="toolbar">
      <input id="search-input" class="input" type="search" placeholder="输入关键词" />
      <div class="tabs">
        <button type="button" class="tab tab--active" data-search-tab="articles">文章</button>
        <button type="button" class="tab" data-search-tab="skills">技能</button>
      </div>
    </div>
    <div id="search-empty" class="empty hidden">未找到相关内容，试试其他关键词</div>
    <div id="search-articles">${articleItems}</div>
    <div id="search-skills" class="skill-grid hidden">${skillItems}</div>
  </div>`;

  return renderLayout({
    currentFile,
    title: '搜索',
    activeNavKey: 'search.html',
    body,
    extraScript: script,
  });
}

export function renderSkillsList(currentFile, skills) {
  const cards = skills
    .map(
      (skill) => `<a class="skill-card" href="${hrefTo(currentFile, `skills/${skill.id}.html`)}">
        ${skillCategoryTag(skill.category)}
        <h3>${escapeHtml(skill.name)}</h3>
        <p>${escapeHtml(skill.introduction)}</p>
      </a>`,
    )
    .join('\n');

  const body = `<div class="page-wrap page-wrap--wide">
    <div class="page-header">
      <h1>设计技能库</h1>
      <p>UED 团队常用设计思维与方法技能，按阶段分类浏览</p>
    </div>
    <div class="skill-grid">${cards || '<div class="empty">暂无技能</div>'}</div>
  </div>`;

  return renderLayout({
    currentFile,
    title: '设计技能库',
    activeNavKey: 'skills.html',
    body,
  });
}

export function renderSkillDetail(currentFile, skill) {
  const contentHtml = markdownToHtml(skill.content || '');
  const download = skill.download_url
    ? `<p><a class="btn btn--primary" href="${escapeHtml(skill.download_url)}" target="_blank" rel="noopener noreferrer">下载资源</a></p>`
    : '';

  const body = `<div class="page-wrap">
    <p class="breadcrumb">
      <a href="${hrefTo(currentFile, 'skills.html')}">技能库</a> / ${escapeHtml(skill.name)}
    </p>
    ${skillCategoryTag(skill.category)}
    <div class="page-header">
      <h1 style="font-size:24px;line-height:32px">${escapeHtml(skill.name)}</h1>
      <p>${escapeHtml(skill.introduction)}</p>
    </div>
    ${download}
    <div class="markdown">${contentHtml || '<p class="empty">暂无正文内容</p>'}</div>
  </div>`;

  return renderLayout({
    currentFile,
    title: skill.name,
    activeNavKey: 'skills.html',
    body,
  });
}
