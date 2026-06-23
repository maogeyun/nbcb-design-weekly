# 宁波银行设计周刊 — PRD 细化（v1.0）

> 完整 PRD 见项目计划文档 §14。本文件为实施摘要。

## 权限

- 前台：匿名开放，无登录/收藏
- 后台：`/admin` 需 Session 鉴权

## 前台页面

| 路径 | 说明 |
|------|------|
| `/` | 最新一期入口 |
| `/weekly/[id]` | 周刊详情 + 栏目 Tab |
| `/article/[id]` | 引言 + 阅读原文 |
| `/archive` | 历史期次 |
| `/about` | 版权与说明 |

## 后台

| 路径 | 说明 |
|------|------|
| `/admin/login` | 编辑登录 |
| `/admin` | 概览 |
| `/admin/candidates` | 候选池 + 引言审核 |
| `/admin/issues` | 周刊列表与发布 |

## 发布门禁

- 6–15 篇 / 期
- 三类各 ≥1 篇
- 全部 `intro_reviewed = true`

## 默认编辑账号

- 邮箱：`editor@nbcb.com`
- 密码：`nbcb2026`
