# NBCB 设计资讯 · Figma 设计变量表

将 [`web/src/lib/tokens.ts`](../web/src/lib/tokens.ts) 中的品牌令牌同步到 Figma Variables + Foundations 文档页。

## Figma 文件（MCP 已创建）

**文件链接：** https://www.figma.com/design/xegC1kLGJZMsSPEB55LuI8/NBCB-%E8%AE%BE%E8%AE%A1%E8%B5%84%E8%AE%AF-%C2%B7-Design-Tokens

| 项目 | 数量 |
|------|------|
| Variable Collections | 4（Primitives / Color / Spacing & Shape / Typography） |
| 变量总数 | 93 |
| Text Styles | 4（Body/Medium、Body/Small、Heading/H2、Label/Mobile） |
| 文档页 | Cover、Foundations |

## 交付物

| 文件 | 说明 |
|------|------|
| [`manifest.json`](manifest.json) | 机器可读令牌清单（100 变量 + 4 Text Styles） |
| [`tokens-studio.json`](tokens-studio.json) | Tokens Studio 导入格式 |
| [`figma/install-tokens.js`](figma/install-tokens.js) | Figma MCP `use_figma` 脚本 |
| [`figma-plugin/`](figma-plugin/) | Figma 开发插件（**推荐：MCP 不可用时使用**） |

## 方式 A：Figma 开发插件（推荐）

1. 在 Figma 中新建设计文件，命名为 **NBCB 设计资讯 · Design Tokens**
2. 菜单：**Plugins → Development → Import plugin from manifest…**
3. 选择本目录下的 [`figma-plugin/manifest.json`](figma-plugin/manifest.json)
4. **Plugins → Development → NBCB Design Tokens Installer** 运行一次
5. 完成后检查：
   - 左侧面板 **Variables**：4 个 Collection（Primitives / Color / Spacing & Shape / Typography）
   - 页面 **Cover**、**Foundations**（色板、栏目标签、间距/圆角、排版样例）

插件幂等：重复运行不会重复创建已标记的变量与页面。

## 方式 B：Figma MCP（Cursor 已连接 Figma MCP 时）

1. 确保 Cursor **Settings → MCP** 中 Figma 服务已连接（绿色）
2. 对 Agent 说：「用 MCP 创建 NBCB 设计资讯 Design Tokens 文件并运行 install-tokens.js」
3. Agent 将依次调用 `whoami` → `create_new_file` → `use_figma`（传入 `figma/install-tokens.js` 内容）

## 方式 C：Tokens Studio 插件

1. 在 Figma 安装 [Tokens Studio](https://tokens.studio/)
2. 导入 [`tokens-studio.json`](tokens-studio.json)
3. 使用 **Sync to Figma Variables** 写入变量（别名需 Tokens Studio Pro 或在 Figma 中手动核对）

## 变量架构

```
Primitives (Value)     → 原始 hex，scopes 为空（隐藏）
Color (Light)          → 语义色，别名指向 Primitives
Spacing & Shape (Value)→ 间距、圆角、布局尺寸
Typography (Value)     → 字体族、字号、字重
```

## 验证

```bash
node design-tokens/validate-manifest.mjs
node design-tokens/generate-tokens-studio.mjs   # 从 manifest 重新生成 tokens-studio.json
```

## 代码对齐说明

- **Canonical 来源**：`web/src/lib/tokens.ts`
- **CSS 变量**：`web/src/app/globals.css` 中已有的 `--color-primary` 等已写入 Figma WEB code syntax
- **仅 TS 使用的令牌**（如 `--color-primary-hover`）已在 Figma 预设 code syntax，便于 Dev Mode 对照
- **无 Dark Mode**：与当前前端一致
- **无 Shadow 变量**：Coffer 规范卡片无投影
