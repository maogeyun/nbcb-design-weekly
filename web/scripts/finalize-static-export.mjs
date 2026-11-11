import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(WEB_ROOT, '..');
const APP_DIR = path.join(WEB_ROOT, 'src', 'app');
const STASH_DIR = path.join(WEB_ROOT, '.static-export-stash');
const OUT_DIR = path.join(WEB_ROOT, 'out');
const STATIC_SITE_DIR = path.join(REPO_ROOT, 'static-site');
const MANIFEST_PATH = path.join(WEB_ROOT, 'public', 'static-data', 'manifest.json');

function restoreRoutes() {
  if (!fs.existsSync(STASH_DIR)) {
    console.warn('[static-export] no stash directory found, skipping restore');
    return;
  }

  for (const name of ['api', 'admin']) {
    const source = path.join(STASH_DIR, name);
    const target = path.join(APP_DIR, name);
    if (fs.existsSync(source)) {
      if (fs.existsSync(target)) {
        fs.rmSync(target, { recursive: true, force: true });
      }
      fs.renameSync(source, target);
      console.log(`[static-export] restored src/app/${name}`);
    }
  }

  fs.rmSync(STASH_DIR, { recursive: true, force: true });
}

function countHtmlFiles(dir) {
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      count += countHtmlFiles(fullPath);
    } else if (entry.name.endsWith('.html')) {
      count += 1;
    }
  }
  return count;
}

function copyStaticSite() {
  if (!fs.existsSync(OUT_DIR)) {
    throw new Error(`[static-export] build output not found: ${OUT_DIR}`);
  }

  if (fs.existsSync(STATIC_SITE_DIR)) {
    fs.rmSync(STATIC_SITE_DIR, { recursive: true, force: true });
  }

  fs.cpSync(OUT_DIR, STATIC_SITE_DIR, { recursive: true });
  const htmlCount = countHtmlFiles(STATIC_SITE_DIR);
  const manifest = fs.existsSync(MANIFEST_PATH)
    ? JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'))
    : null;

  console.log(`[static-export] copied to ${STATIC_SITE_DIR}`);
  console.log(`[static-export] html files: ${htmlCount}`);
  if (manifest) {
    console.log(
      `[static-export] snapshot: ${manifest.published_issues} issues, ${manifest.published_articles} articles, ${manifest.skills} skills @ ${manifest.generated_at}`,
    );
  }
}

restoreRoutes();
copyStaticSite();
