import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const checkPath = path.join(root, '.github/workflows/pages-publish-check.yml');
const deployPath = path.join(root, '.github/workflows/pages-deploy.yml');
const configPath = path.join(root, 'publish.config.json');
const errors = [];

function fail(message) {
  errors.push(message);
}

const checkYaml = fs.readFileSync(checkPath, 'utf8');
const deployYaml = fs.readFileSync(deployPath, 'utf8');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

if (/secrets\./.test(checkYaml)) {
  fail('pages-publish-check.yml 不得引用 secrets');
}
if (/pull_request\s*:/.test(deployYaml)) {
  fail('pages-deploy.yml 不得包含 pull_request 触发器');
}
if (!deployYaml.includes('workflow_dispatch:')) {
  fail('pages-deploy.yml 必须支持 workflow_dispatch');
}
if (!deployYaml.includes('productionOnMainPush')) {
  fail('生产 push 闸必须读取 productionOnMainPush');
}
if (config.productionOnMainPush !== false) {
  fail('productionOnMainPush 当前必须为 false，避免首次合并发布生产');
}
if (config.publishDirectory !== 'static-site' || config.cloudflarePages?.buildDirectory !== 'static-site') {
  fail('发布目录必须是 static-site');
}

const deployCommands = [...deployYaml.matchAll(/command:\s*(.+)/g)].map((match) => match[1]);
if (deployCommands.length !== 2) {
  fail(`部署命令应恰好两条，实际 ${deployCommands.length}`);
}
for (const command of deployCommands) {
  if (!command.includes('pages deploy static-site --project-name=nbcb-design-weekly')) {
    fail(`部署命令必须只上传 static-site: ${command}`);
  }
  if (/pages deploy\s+(\.|\/|web\b|static-site\/)/.test(command)) {
    fail(`部署命令指向了错误目录: ${command}`);
  }
}
if (!deployCommands.some((command) => command.includes('--branch=main'))) {
  fail('生产命令必须显式使用 --branch=main');
}
if (!deployCommands.some((command) => command.includes('--branch=${{ steps.branch.outputs.alias }}'))) {
  fail('预览命令必须使用校验过的非 main 别名');
}

const secretUses = deployYaml.match(/secrets\.[A-Z0-9_]+/g) ?? [];
const allowedSecrets = new Set(['secrets.CLOUDFLARE_API_TOKEN', 'secrets.CLOUDFLARE_ACCOUNT_ID']);
for (const secret of secretUses) {
  if (!allowedSecrets.has(secret)) {
    fail(`出现未允许的 secret: ${secret}`);
  }
}
if (!secretUses.includes('secrets.CLOUDFLARE_API_TOKEN')) {
  fail('部署 workflow 应通过 secrets.CLOUDFLARE_API_TOKEN 引用 token');
}

const scanned = [checkYaml, deployYaml, JSON.stringify(config)];
const leakedToken = /(apiToken\s*:\s*['"]?[A-Za-z0-9_-]{20,})|(CLOUDFLARE_API_TOKEN\s*[:=]\s*['"][^'"]+['"])/;
for (const text of scanned) {
  if (leakedToken.test(text)) {
    fail('workflow 或配置中出现了硬编码 token');
  }
}

if (errors.length) {
  for (const error of errors) console.error(`[pages-workflow] ${error}`);
  process.exit(1);
}
console.log('[pages-workflow] deploy workflow is dispatch/push only, uploads static-site, and push production is disabled');
