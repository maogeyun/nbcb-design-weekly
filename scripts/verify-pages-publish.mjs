import fs from 'fs';
import http from 'http';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONFIG_PATH = path.join(REPO_ROOT, 'publish.config.json');

const FIXED_ROUTES = [
  'index.html',
  'archive/index.html',
  'skills/index.html',
  'about/index.html',
  'search/index.html',
  'm/index.html',
  'm/archive/index.html',
  'm/skills/index.html',
  'm/search/index.html',
  'm/about/index.html',
  'weekly/current/index.html',
];

const FORBIDDEN_DIR_NAMES = new Set(['admin', 'api', 'node_modules']);
const SECRET_FILE_RE = /^(?:\.env(?:\..*)?|.*\.(?:pem|key)|id_rsa.*|credentials(?:\..*)?)$/i;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function loadConfig() {
  const config = readJson(CONFIG_PATH);
  if (config.publishDirectory !== 'static-site') {
    throw new Error('publish.config.json 的 publishDirectory 必须是 static-site');
  }
  if (config.cloudflarePages?.buildDirectory !== 'static-site') {
    throw new Error('publish.config.json 的 buildDirectory 必须是 static-site');
  }
  return config;
}

function isSourceOrRepoRoot(dir) {
  return (
    fs.existsSync(path.join(dir, 'data', 'store.json')) ||
    fs.existsSync(path.join(dir, 'src', 'app', 'admin')) ||
    fs.existsSync(path.join(dir, 'src', 'app', 'api')) ||
    fs.existsSync(path.join(dir, 'web', 'data', 'store.json')) ||
    fs.existsSync(path.join(dir, 'web', 'src', 'app', 'admin')) ||
    (fs.existsSync(path.join(dir, 'static-site', 'index.html')) &&
      fs.existsSync(path.join(dir, 'web', 'package.json')))
  );
}

function walk(dir, onEntry) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    onEntry(fullPath, entry);
    if (entry.isDirectory()) {
      walk(fullPath, onEntry);
    }
  }
}

function safeChild(root, relPosix) {
  const rel = relPosix.replace(/^\/+/, '');
  if (!rel || rel.split('/').some((part) => part === '' || part === '.' || part === '..')) {
    return null;
  }
  const resolved = path.resolve(root, rel);
  const rootResolved = path.resolve(root);
  if (resolved !== rootResolved && !resolved.startsWith(rootResolved + path.sep)) {
    return null;
  }
  return resolved;
}

function push(errors, code, message) {
  errors.push({ code, message });
}

function verifyPublishDir(dir) {
  const errors = [];
  const resolved = path.resolve(dir);
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isDirectory()) {
    push(errors, 'MISSING_DIR', `发布目录不存在: ${resolved}`);
    return { ok: false, errors, summary: null };
  }
  if (isSourceOrRepoRoot(resolved)) {
    push(
      errors,
      'REPO_ROOT',
      `拒绝把 ${resolved} 当作站点根。其中含有后台、API 或 data/store.json。Cloudflare Build directory 必须是 static-site。`,
    );
    return { ok: false, errors, summary: null };
  }

  walk(resolved, (fullPath, entry) => {
    if (entry.isSymbolicLink()) {
      push(errors, 'SYMLINK', `发布目录不允许符号链接: ${path.relative(resolved, fullPath)}`);
      return;
    }
    if (entry.isDirectory() && FORBIDDEN_DIR_NAMES.has(entry.name)) {
      push(errors, 'FORBIDDEN_PATH', `发布目录含禁止目录 ${entry.name}: ${path.relative(resolved, fullPath)}`);
    }
    if (entry.isFile()) {
      if (entry.name === 'store.json') {
        push(errors, 'FORBIDDEN_PATH', `发布目录含数据文件 store.json: ${path.relative(resolved, fullPath)}`);
      }
      if (SECRET_FILE_RE.test(entry.name)) {
        push(errors, 'FORBIDDEN_PATH', `发布目录含凭据文件: ${path.relative(resolved, fullPath)}`);
      }
    }
  });

  const manifestPath = path.join(resolved, 'static-data', 'manifest.json');
  const issuesPath = path.join(resolved, 'static-data', 'issues.json');
  const skillsPath = path.join(resolved, 'static-data', 'skills.json');
  const searchPath = path.join(resolved, 'static-data', 'search-index.json');
  for (const filePath of [manifestPath, issuesPath, skillsPath, searchPath]) {
    if (!fs.existsSync(filePath)) {
      push(errors, 'MISSING_MANIFEST', `缺少 ${path.relative(resolved, filePath)}`);
    }
  }
  if (errors.some((error) => error.code === 'MISSING_MANIFEST' || error.code === 'REPO_ROOT')) {
    return { ok: false, errors, summary: null };
  }

  const manifest = readJson(manifestPath);
  const issues = readJson(issuesPath).data ?? [];
  const skills = readJson(skillsPath).data ?? [];
  const search = readJson(searchPath);
  const articles = (search.articles ?? []).map((item) => item.article).filter(Boolean);

  for (const issue of issues) {
    if (issue.status !== 'published') {
      push(errors, 'UNPUBLISHED', `期次 ${issue.id} 状态为 ${issue.status}，不能进入发布目录`);
    }
  }
  for (const article of articles) {
    if (article.status !== 'published') {
      push(errors, 'UNPUBLISHED', `文章 ${article.id} 状态为 ${article.status}，不能进入发布目录`);
    }
  }

  const issueIds = issues.map((issue) => issue.id);
  const articleIds = articles.map((article) => article.id);
  const skillIds = skills.map((skill) => skill.id);
  if (new Set(issueIds).size !== issueIds.length) {
    push(errors, 'COUNT_MISMATCH', '期次 id 重复');
  }
  if (new Set(articleIds).size !== articleIds.length) {
    push(errors, 'COUNT_MISMATCH', '文章 id 重复');
  }
  if (new Set(skillIds).size !== skillIds.length) {
    push(errors, 'COUNT_MISMATCH', '技能 id 重复');
  }
  if (issues.length !== manifest.published_issues) {
    push(errors, 'COUNT_MISMATCH', `期次 ${issues.length} 与清单 ${manifest.published_issues} 不一致`);
  }
  if (articles.length !== manifest.published_articles) {
    push(errors, 'COUNT_MISMATCH', `文章 ${articles.length} 与清单 ${manifest.published_articles} 不一致`);
  }
  if (skills.length !== manifest.skills) {
    push(errors, 'COUNT_MISMATCH', `技能 ${skills.length} 与清单 ${manifest.skills} 不一致`);
  }

  const detailDir = path.join(resolved, 'static-data', 'skills');
  const detailFiles = fs.existsSync(detailDir)
    ? fs.readdirSync(detailDir).filter((name) => name.endsWith('.json'))
    : [];
  if (detailFiles.length !== skills.length) {
    push(errors, 'COUNT_MISMATCH', `技能详情 ${detailFiles.length} 与技能列表 ${skills.length} 不一致`);
  }

  const routes = [...FIXED_ROUTES];
  for (const id of issueIds) {
    routes.push(`weekly/${id}/index.html`, `m/weekly/${id}/index.html`);
  }
  for (const id of articleIds) {
    routes.push(`article/${id}/index.html`, `m/article/${id}/index.html`);
  }
  for (const rel of routes) {
    const filePath = safeChild(resolved, rel);
    if (!filePath || !fs.existsSync(filePath) || fs.statSync(filePath).size < 200) {
      push(errors, 'MISSING_ROUTE', `内页无法直开，缺少 ${rel}`);
    }
  }

  function directoryNames(rel) {
    const dir = path.join(resolved, rel);
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  }
  const weeklyDirs = directoryNames('weekly').filter((name) => name !== 'current').sort();
  const mobileWeeklyDirs = directoryNames('m/weekly').sort();
  const articleDirs = directoryNames('article').sort();
  const mobileArticleDirs = directoryNames('m/article').sort();
  const expectedIssues = [...issueIds].sort();
  const expectedArticles = [...articleIds].sort();
  if (JSON.stringify(weeklyDirs) !== JSON.stringify(expectedIssues)) {
    push(errors, 'MISSING_ROUTE', `weekly 目录与已发布期次不一致: ${weeklyDirs.join(',')}`);
  }
  if (JSON.stringify(mobileWeeklyDirs) !== JSON.stringify(expectedIssues)) {
    push(errors, 'MISSING_ROUTE', `m/weekly 目录与已发布期次不一致: ${mobileWeeklyDirs.join(',')}`);
  }
  if (JSON.stringify(articleDirs) !== JSON.stringify(expectedArticles)) {
    push(errors, 'MISSING_ROUTE', 'article 目录与已发布文章不一致');
  }
  if (JSON.stringify(mobileArticleDirs) !== JSON.stringify(expectedArticles)) {
    push(errors, 'MISSING_ROUTE', 'm/article 目录与已发布文章不一致');
  }

  const pdfs = [];
  for (const article of articles) {
    const url = article.attachment?.url;
    if (!url) continue;
    if (!url.startsWith('/uploads/') || !url.toLowerCase().endsWith('.pdf')) {
      push(errors, 'MISSING_ASSET', `文章 ${article.id} 的附件地址不符合已发布 PDF 路径: ${url}`);
      continue;
    }
    const filePath = safeChild(resolved, url);
    if (!filePath || !fs.existsSync(filePath)) {
      push(errors, 'MISSING_ASSET', `缺少 PDF ${url}`);
      continue;
    }
    const body = fs.readFileSync(filePath);
    if (body.length < 5 || body.subarray(0, 4).toString() !== '%PDF') {
      push(errors, 'MISSING_ASSET', `PDF 无效: ${url}`);
      continue;
    }
    pdfs.push({ url, bytes: body.length });
  }

  for (const skill of skills) {
    if (skill.file_path) {
      const filePath = safeChild(resolved, path.posix.join('skills', skill.file_path));
      if (!filePath || !fs.existsSync(filePath)) {
        push(errors, 'MISSING_ASSET', `技能 ${skill.id} 缺少文件 ${skill.file_path}`);
      }
    }
    const detailPath = path.join(detailDir, `${skill.id}.json`);
    if (!fs.existsSync(detailPath)) {
      push(errors, 'MISSING_ASSET', `技能 ${skill.id} 缺少详情 JSON`);
      continue;
    }
    const detail = readJson(detailPath).data ?? {};
    if (detail.has_package || detail.package_path) {
      const packagePath = safeChild(
        resolved,
        path.posix.join('skills', detail.package_path ?? ''),
      );
      if (!detail.package_path || !packagePath || !fs.existsSync(packagePath)) {
        push(errors, 'MISSING_ASSET', `技能 ${skill.id} 缺少资源包 ${detail.package_path}`);
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    summary: {
      directory: resolved,
      generatedAt: manifest.generated_at,
      publishedIssues: issues.length,
      publishedArticles: articles.length,
      skills: skills.length,
      pdfs,
    },
  };
}

function requestOnce(port, urlPath) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { hostname: '127.0.0.1', port, path: urlPath, method: 'GET' },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            location: res.headers.location,
            body: Buffer.concat(chunks),
            type: res.headers['content-type'] || '',
          });
        });
      },
    );
    req.on('error', reject);
    req.end();
  });
}

async function request(port, urlPath) {
  const first = await requestOnce(port, urlPath);
  if (first.status === 308 && first.location) {
    const next = await requestOnce(port, first.location);
    return { ...next, redirectedFrom: first.status, location: first.location };
  }
  return first;
}

function startFixtureServer(root) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1');
    let pathname = decodeURIComponent(url.pathname);
    if (pathname.includes('\0') || pathname.split('/').includes('..')) {
      res.writeHead(400).end();
      return;
    }
    const relative = pathname.replace(/^\/+/, '');
    const candidate = path.resolve(root, relative);
    const rootResolved = path.resolve(root);
    if (candidate !== rootResolved && !candidate.startsWith(rootResolved + path.sep)) {
      res.writeHead(403).end();
      return;
    }
    const indexFile = path.join(candidate, 'index.html');
    if (pathname.endsWith('/index.html') && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      const clean = pathname.slice(0, -'index.html'.length);
      res.writeHead(308, { location: clean + url.search }).end();
      return;
    }
    if (fs.existsSync(indexFile) && fs.statSync(indexFile).isFile()) {
      if (!pathname.endsWith('/')) {
        res.writeHead(308, { location: `${pathname}/${url.search}` }).end();
        return;
      }
      const body = fs.readFileSync(indexFile);
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'content-length': body.length });
      res.end(body);
      return;
    }
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      const body = fs.readFileSync(candidate);
      const type = candidate.endsWith('.pdf')
        ? 'application/pdf'
        : candidate.endsWith('.json')
          ? 'application/json'
          : 'application/octet-stream';
      res.writeHead(200, { 'content-type': type, 'content-length': body.length });
      res.end(body);
      return;
    }
    res.writeHead(404, { 'content-length': 0 });
    res.end();
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

async function httpCheck(dir, summary) {
  const errors = [];
  const server = await startFixtureServer(dir);
  const port = server.address().port;
  try {
    const home = await request(port, '/');
    if (home.status !== 200 || !home.body.includes(Buffer.from('宁波银行设计周刊'))) {
      push(errors, 'HTTP', `首页直开失败: ${home.status}`);
    }
    const checks = ['/archive/', '/skills/', '/weekly/issue-1/', '/weekly/issue-5/', '/m/', '/m/archive/'];
    const firstArticle = fs.readdirSync(path.join(dir, 'article')).find((name) => name.startsWith('art-'));
    if (firstArticle) checks.push(`/article/${firstArticle}/`, `/m/article/${firstArticle}/`);
    for (const route of checks) {
      const response = await request(port, route);
      if (response.status !== 200 || response.type.includes('text/html') === false) {
        push(errors, 'HTTP', `${route} 直开失败: ${response.status}`);
      }
    }
    const noslash = await request(port, '/weekly/issue-1');
    if (noslash.status !== 200 || noslash.redirectedFrom !== 308) {
      push(errors, 'HTTP', `无斜杠路径应 308 到可打开的内页，实际 ${noslash.redirectedFrom ?? noslash.status}`);
    }
    const manifest = await request(port, '/static-data/manifest.json');
    if (manifest.status !== 200) {
      push(errors, 'HTTP', '清单 JSON 无法直开');
    } else {
      const parsed = JSON.parse(manifest.body.toString('utf8'));
      if (
        parsed.published_issues !== summary.publishedIssues ||
        parsed.published_articles !== summary.publishedArticles ||
        parsed.skills !== summary.skills
      ) {
        push(errors, 'HTTP', '直开的清单与统计不一致');
      }
    }
    for (const pdf of summary.pdfs) {
      const response = await request(port, pdf.url);
      if (response.status !== 200 || response.body.subarray(0, 4).toString() !== '%PDF') {
        push(errors, 'HTTP', `PDF 直开失败 ${pdf.url}: ${response.status}`);
      }
    }
    for (const blocked of ['/admin/', '/api/issues', '/web/data/store.json', '/README.md', '/data/store.json']) {
      const response = await request(port, blocked);
      if (response.status !== 404) {
        push(errors, 'HTTP', `${blocked} 应不可访问，实际 ${response.status}`);
      }
    }
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
  return errors;
}

function printResult(result) {
  if (result.summary) {
    const pdfBytes = result.summary.pdfs.reduce((sum, pdf) => sum + pdf.bytes, 0);
    console.log(
      `[pages-publish] ${result.summary.generatedAt} issues=${result.summary.publishedIssues} articles=${result.summary.publishedArticles} skills=${result.summary.skills} pdfs=${result.summary.pdfs.length} pdf_bytes=${pdfBytes}`,
    );
  }
  for (const error of result.errors) {
    console.error(`[pages-publish] ${error.code} ${error.message}`);
  }
}

async function runDir(dir, { http: doHttp, expectReject }) {
  const result = verifyPublishDir(dir);
  if (result.ok && doHttp) {
    result.errors.push(...(await httpCheck(dir, result.summary)));
    result.ok = result.errors.length === 0;
  }
  printResult(result);
  if (expectReject) {
    if (result.ok || !result.errors.some((error) => error.code === 'REPO_ROOT' || error.code === 'FORBIDDEN_PATH' || error.code === 'UNPUBLISHED')) {
      console.error('[pages-publish] 预期目录被拒绝，但校验通过了');
      return 1;
    }
    console.log('[pages-publish] 已按预期拒绝该目录');
    return 0;
  }
  return result.ok ? 0 : 1;
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value));
}

async function selfTest() {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'pages-publish-'));
  const failures = [];
  try {
    const repoCode = await runDir(REPO_ROOT, { http: false, expectReject: true });
    if (repoCode !== 0) failures.push('仓库根应被拒绝');

    const webCode = await runDir(path.join(REPO_ROOT, 'web'), { http: false, expectReject: true });
    if (webCode !== 0) failures.push('web 源码目录应被拒绝');

    const draftRoot = path.join(temp, 'draft');
    writeJson(path.join(draftRoot, 'static-data', 'manifest.json'), {
      generated_at: '2026-11-11T00:00:00.000Z',
      published_issues: 1,
      published_articles: 1,
      skills: 0,
    });
    writeJson(path.join(draftRoot, 'static-data', 'issues.json'), {
      data: [{ id: 'issue-1', status: 'draft' }],
    });
    writeJson(path.join(draftRoot, 'static-data', 'skills.json'), { data: [] });
    writeJson(path.join(draftRoot, 'static-data', 'search-index.json'), {
      articles: [{ article: { id: 'art-1', status: 'candidate' } }],
      skills: [],
    });
    fs.writeFileSync(path.join(draftRoot, 'index.html'), '<html>x</html>');
    const draftCode = await runDir(draftRoot, { http: false, expectReject: true });
    if (draftCode !== 0) failures.push('草稿和候选稿应被拒绝');

    const secretRoot = path.join(temp, 'secret');
    fs.mkdirSync(secretRoot, { recursive: true });
    fs.writeFileSync(path.join(secretRoot, 'index.html'), '<html>x</html>');
    fs.writeFileSync(path.join(secretRoot, '.env'), 'TOKEN=nope\n');
    const secret = verifyPublishDir(secretRoot);
    if (!secret.errors.some((error) => error.code === 'FORBIDDEN_PATH')) {
      failures.push('凭据文件应被拒绝');
    }

    const storeRoot = path.join(temp, 'store');
    fs.mkdirSync(path.join(storeRoot, 'data'), { recursive: true });
    fs.writeFileSync(path.join(storeRoot, 'index.html'), '<html>x</html>');
    fs.writeFileSync(path.join(storeRoot, 'data', 'store.json'), '{"articles":[]}');
    const store = verifyPublishDir(storeRoot);
    if (!store.errors.some((error) => error.code === 'REPO_ROOT' || error.code === 'FORBIDDEN_PATH')) {
      failures.push('store.json 应被拒绝');
    }
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
  if (failures.length) {
    for (const failure of failures) console.error(`[pages-publish] SELF_TEST ${failure}`);
    return 1;
  }
  console.log('[pages-publish] self-test passed');
  return 0;
}

function usage() {
  console.log(`用法:
  node scripts/verify-pages-publish.mjs
  node scripts/verify-pages-publish.mjs --dir static-site
  node scripts/verify-pages-publish.mjs --dir . --expect-reject
  node scripts/verify-pages-publish.mjs --self-test`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    usage();
    return 0;
  }
  loadConfig();
  if (args.includes('--self-test')) {
    const selfCode = await selfTest();
    const siteCode = await runDir(path.join(REPO_ROOT, 'static-site'), { http: true, expectReject: false });
    return selfCode || siteCode;
  }
  const expectReject = args.includes('--expect-reject');
  const dirFlag = args.indexOf('--dir');
  const dir = dirFlag >= 0 ? args[dirFlag + 1] : path.join(REPO_ROOT, loadConfig().publishDirectory);
  if (!dir) {
    usage();
    return 1;
  }
  const target = path.resolve(process.cwd(), dir);
  return runDir(target, { http: !expectReject && fs.existsSync(path.join(target, 'index.html')), expectReject });
}

main()
  .then((code) => process.exit(code))
  .catch((error) => {
    console.error(`[pages-publish] ${error.message}`);
    process.exit(1);
  });
