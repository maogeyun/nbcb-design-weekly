import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const checkPath = path.join(root, '.github/workflows/pages-publish-check.yml');
const deployPath = path.join(root, '.github/workflows/pages-deploy.yml');
const configPath = path.join(root, 'publish.config.json');

const PUSH_MAIN_ONLY = '  push:\n    branches:\n      - main\n';

export function checkPagesWorkflows({ config, checkYaml, deployYaml }) {
  const errors = [];
  function fail(message) {
    errors.push(message);
  }

  if (/secrets\./.test(checkYaml)) {
    fail('pages-publish-check.yml 不得引用 secrets');
  }
  if (/pull_request\s*:/.test(deployYaml)) {
    fail('pages-deploy.yml 不得包含 pull_request 触发器');
  }
  if (!deployYaml.includes('workflow_dispatch:')) {
    fail('pages-deploy.yml 必须支持 workflow_dispatch');
  }
  if (!deployYaml.includes(PUSH_MAIN_ONLY)) {
    fail('自动生产只能由 push 到 main 触发');
  }
  if (!deployYaml.includes('productionOnMainPush')) {
    fail('生产 push 闸必须读取 productionOnMainPush');
  }
  if (!deployYaml.includes('cfg.productionOnMainPush===true?"true":"false"')) {
    fail('只有布尔 true 可以打开 main push 上传');
  }
  if (!deployYaml.includes("needs.production-gate.outputs.deploy == 'yes'")) {
    fail('生产上传必须经过 production-gate');
  }
  if (!deployYaml.includes('CONFIRM" != "publish-production"')) {
    fail('手动生产必须核对 confirm=publish-production');
  }
  if (typeof config.productionOnMainPush !== 'boolean') {
    fail('productionOnMainPush 必须是布尔值 true 或 false');
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

  const leakedToken = /(apiToken\s*:\s*['"]?[A-Za-z0-9_-]{20,})|(CLOUDFLARE_API_TOKEN\s*[:=]\s*['"][^'"]+['"])/;
  for (const text of [checkYaml, deployYaml, JSON.stringify(config)]) {
    if (leakedToken.test(text)) {
      fail('workflow 或配置中出现了硬编码 token');
    }
  }

  return errors;
}

function readActual() {
  return {
    checkYaml: fs.readFileSync(checkPath, 'utf8'),
    deployYaml: fs.readFileSync(deployPath, 'utf8'),
    config: JSON.parse(fs.readFileSync(configPath, 'utf8')),
  };
}

function expect(name, errors, shouldPass) {
  const passed = errors.length === 0;
  if (passed !== shouldPass) {
    const detail = errors.join('; ') || '意外通过';
    throw new Error(`${name}: ${detail}`);
  }
  console.log(`[pages-workflow] ${shouldPass ? 'pass' : 'fail'} ${name}`);
}

function selfTest(actual) {
  const base = structuredClone(actual.config);
  expect('flag false', checkPagesWorkflows({ ...actual, config: { ...base, productionOnMainPush: false } }), true);
  expect('flag true', checkPagesWorkflows({ ...actual, config: { ...base, productionOnMainPush: true } }), true);

  for (const value of ['true', 'false', 1, 0, null]) {
    expect(
      `flag ${JSON.stringify(value)}`,
      checkPagesWorkflows({ ...actual, config: { ...base, productionOnMainPush: value } }),
      false,
    );
  }
  const missing = { ...base };
  delete missing.productionOnMainPush;
  expect('flag missing', checkPagesWorkflows({ ...actual, config: missing }), false);

  expect(
    'publish directory web',
    checkPagesWorkflows({ ...actual, config: { ...base, publishDirectory: 'web' } }),
    false,
  );
  expect(
    'build directory root',
    checkPagesWorkflows({
      ...actual,
      config: {
        ...base,
        productionOnMainPush: true,
        cloudflarePages: { ...base.cloudflarePages, buildDirectory: '.' },
      },
    }),
    false,
  );

  const tamperedDeploy = actual.deployYaml.replaceAll(
    'pages deploy static-site --project-name=nbcb-design-weekly',
    'pages deploy . --project-name=nbcb-design-weekly',
  );
  expect(
    'deploy directory tamper',
    checkPagesWorkflows({ ...actual, deployYaml: tamperedDeploy, config: { ...base, productionOnMainPush: true } }),
    false,
  );
  const ungated = actual.deployYaml.replace(
    'cfg.productionOnMainPush===true?"true":"false"',
    'cfg.productionOnMainPush?"true":"false"',
  );
  expect(
    'loose push gate',
    checkPagesWorkflows({ ...actual, deployYaml: ungated, config: { ...base, productionOnMainPush: true } }),
    false,
  );
}

const actual = readActual();
const isSelfTest = process.argv.includes('--self-test') || !process.argv.includes('--no-self-test');
if (isSelfTest) {
  selfTest(actual);
}
const errors = checkPagesWorkflows(actual);
if (errors.length) {
  for (const error of errors) console.error(`[pages-workflow] ${error}`);
  process.exit(1);
}
console.log(
  `[pages-workflow] productionOnMainPush=${actual.config.productionOnMainPush}; upload remains static-site via the main push gate`,
);
