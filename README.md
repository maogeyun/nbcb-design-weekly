# 宁波银行设计周刊

面向宁波银行 UED 团队的每周设计资讯站。浏览端无需登录，当前版本不含收藏功能。

## 快速开始

```bash
cd web
npm install
npm run dev
```

访问 http://localhost:3000

## M1 新增能力（2026-06-16）

- **数据持久化**：编辑操作写入 `web/data/store.json`（首次从 seed 初始化）
- **站内搜索**：`/search` 支持按标题、引言、来源检索已发布文章，以及按名称、简介、分类检索设计方法论 Skill
- **周刊组刊**：`/admin/issues/[id]/edit` 选稿、排序、编辑引言、发布门禁校验
- **创建周刊**：后台可一键创建新期草稿（种子含第 2 期空草稿）
- **候选导入**：粘贴 URL 手动加入候选池
- **RSS 抓取**：一键从白名单源拉取近 14 天 RSS 入库（`rss-parser` + 规则过滤）

## 编辑工作流

```
候选池（导入/抓取）→ 审核引言 → 组刊编辑 → 发布门禁 → 前台可见
```

可通过环境变量覆盖：

```env
ADMIN_EMAIL=editor@nbcb.com
ADMIN_PASSWORD=nbcb2026
```

## M0 种子数据

首期周刊（第 1 期）含 10 篇文章，覆盖 UI设计 / 设计经验 / AI前沿 三类，含 1 条外链失效演示（`art-c02`）。

数据文件：`web/src/mocks/seed.json`

## 项目结构

```
docs/           需求与设计文档
web/            Next.js 16 应用与本地后台
static-site/    已发布静态快照，Cloudflare 只发布这个目录
```

## 静态发布

公开站以 `static-site/` 为准。更新内容时，在持有最新已发布数据的电脑上运行 `cd web && npm run build:static`，再在仓库根运行 `node scripts/verify-pages-publish.mjs`。不要用 Git 里含未发布稿的 `web/data/store.json` 在 CI 中重新生成站点。正式站仍是现有的 Direct Upload 项目；GitHub Actions 只上传 `static-site`。首次合并不会自动发生产，预览验收后的切换见 [静态发布](docs/静态发布.md)。

## 文档

- [来源白名单](../docs/来源白名单.md)
- [信息架构与线框](../docs/信息架构与线框.md)
- [技术方案](../docs/技术方案.md)
