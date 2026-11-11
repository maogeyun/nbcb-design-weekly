---
name: semantic-token-naming
description: Names design tokens by semantic intent (not appearance) in a three-layer cascade—semantic, component, and Oklch-derived state tokens. Use when creating or auditing design tokens, Figma variables, CSS custom properties, DLS foundations, or before AI builds components from a design system.
user-invokable: true
---

# 用语义意图给基础令牌（Token）命名

令牌基础必须最先建立，且要**级联感知 + 按含义命名（而非按外观）**。

## 何时启用

- 新建或重构设计令牌 / Figma Variables / CSS 变量
- 从设计稿提取令牌、写 `design.md` 或设计系统 foundations
- **在让 AI 搭组件之前**——先确认语义层已就绪
- 审查令牌命名是否泄露原始值（如 `--blue-500`）或语义冲突（如 `--card-bg`）

## 执行顺序（强制）

```
Task Progress:
- [ ] 1. 语义令牌（意图层）— 颜色 / 间距 / 排版 / 圆角 / 阴影等
- [ ] 2. 组件令牌 — 每个组件只引用语义令牌
- [ ] 3. 状态令牌 — hover / pressed / disabled 由 Oklch 数学推导
- [ ] 4. 再搭组件 — 禁止在基础层缺失时硬编码或乱编令牌
```

**实践顺序很关键：** 先在 Figma 建好令牌系统，再让 AI 逐个搭组件、顺带生成第三层组件令牌。若在基础令牌化之前就让 AI 造组件，它会硬编码或乱编，事后要花一个月返工。

---

## 三层令牌架构

### 1. 语义令牌

指代基本意图，AI 读名字即懂何时使用。

- `--dls-color-action-bg-primary`
- `--dls-color-surface-default`
- `--dls-space-component-md`

### 2. 组件令牌

每个组件引用语义令牌，隔离组件，防止语义层改动不可预测地扩散。

- `--dls-color-component-button-bg-primary-default`

### 3. 状态令牌

通过 Oklch 由颜色数学推导（hover / pressed / disabled），而非设计师手选。

---

## 命名规则

**按 `[前缀]-[类别]-[角色/范围]-[属性]-[变体/尺度]` 组织。** 前缀示例 `--dls-`；项目可替换，但层级逻辑不变。

| 层 | 模式 | 示例 |
|----|------|------|
| 语义·颜色 | `--dls-color-{role}-{property}-{variant}` | `--dls-color-feedback-error-bg-subtle` |
| 语义·间距 | `--dls-space-{scope}-{property}-{size}` | `--dls-space-component-card-padding-md` |
| 组件 | `--dls-{cat}-component-{component}-{property}-{variant}-{state?}` | `--dls-color-component-button-bg-primary-default` |
| 状态 | 引用组件/语义基色 + Oklch 推导 | 见 [reference.md](reference.md) |

**拆解示例**

- `--dls-color-feedback-error-bg-subtle` → 角色 `feedback-error` · 属性 `bg` · 变体 `subtle`
- `--dls-space-component-card-padding-md` → 范围 `component-card` · 属性 `padding` · 大小 `md`

---

## ✅ 好的命名（传达意图与引用地位）

- `--dls-color-feedback-error-bg-subtle`
    
    角色 `feedback-error` · 属性 `bg` · 变体 `subtle`
    
- `--dls-space-component-card-padding-md`
    
    范围 `component-card` · 属性 `padding` · 大小 `md`

## ❌ 反例

- `--blue-500`：原始类型泄露到语义层，没告诉模型*何时*该用
- `--color-1`：不透明，模型只能猜，半数会猜错
- `--card-bg`：多张卡片、多种含义、同一个名称，冲突

---

## Agent 工作流

### 创建令牌时

1. **只建语义层** — 颜色用角色（action / surface / feedback / border…），间距用范围 + 尺度，不用 hex 名或序号
2. **组件层只 `var()` 语义层** — 不在组件令牌里写裸 hex / px
3. **状态层用 Oklch** — 从 default 基色推导 hover（L±）、pressed（L−+C−）、disabled（L↑+C↓），禁止手选近似色
4. **输出时附映射表** — 语义令牌 → 用途一句话；组件令牌 → 引用了哪些语义令牌

### 搭组件时

- 所有 visual 属性必须绑定组件令牌或语义令牌
- 发现缺失令牌 → **先补语义/组件令牌**，再改组件，不回退硬编码
- 新组件令牌命名遵循 `--dls-*-component-{name}-*` 模式

### 审计现有令牌时

按反例清单标记问题，并给出重命名建议（旧名 → 新名 → 引用链）。

---

## 附加资源

- 完整命名模式、Oklch 状态推导与审计清单：[reference.md](reference.md)
