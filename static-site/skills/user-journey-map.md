---
name: user-journey-map
description: 绘制用户旅程地图，把触点、行为、情绪曲线、痛点与机会点放入同一时间轴以定位优化优先级。
user-invokable: true
args:
  - name: persona
    description: 目标用户角色（建议填写 Persona 名称或特征，可选）
    required: false
  - name: scenario
    description: 旅程场景边界（起点-终点），可选
    required: false
---

用户旅程地图把分散的体验问题整合成“全局可视化”：横轴是阶段，纵轴是触点/行为/情绪/痛点/机会。情绪曲线是灵魂——低谷常对应设计机会。

## 适用场景（何时用）

- **改版前看全貌**：避免局部优化破坏整体流程
- **流失归因**：定位具体触点/阶段的断点
- **多渠道整合**：线上线下、App/Web 多入口衔接问题
- **新服务/新功能规划**：先画理想旅程，倒推能力与功能
- **售后体验优化**：找到最损害信任的流程节点
- **研究总结呈现**：把访谈洞察结构化成团队可共识的地图

## 框架结构（建议最小字段）

横轴（阶段）：例如 发现 → 考虑 → 决策 → 上手 → 推荐（按你的业务改）

纵轴（六行）：

- **触点**：用户接触到的页面/渠道/人员/环境
- **用户行为**：用户在该阶段做了什么
- **情绪曲线**：正/中/负或 1–5 分
- **痛点**：情绪低谷处的原因
- **机会点**：可介入的设计/产品机会
- （可选）**证据**：引用/数据/观察片段

## 六步绘制流程（可直接照做）

### 1) 确定用户角色

- 选定 {persona}（每张地图只描述一类用户）
- 多角色要分开画，避免信息失真

### 2) 定义场景边界

- 明确 {scenario} 的起点与终点
- 聚焦一个完整场景，避免范围过大

### 3) 梳理触点序列

- 列出所有触点并按时间排序
- 特别标注跨渠道跳转与线下触点

### 4) 标注情绪变化（画曲线）

- 为每个触点/阶段打分（正/中/负或 1–5）
- 连成曲线：低谷优先深挖

### 5) 识别痛点与机会

- 在低谷处追问“为什么”：信息缺口/摩擦/不确定/等待/信任损耗
- 在高峰处识别“该强化什么”

### 6) 对齐团队行动

- 把 Top 痛点转成行动项：做什么、谁负责、何时验证
- 避免“画完就归档”，要有复盘更新机制

## 质量要点（做与不做）

### ✅ 这样做

- 基于真实用户研究填写，不用内部假设替代用户声音
- 重视情绪曲线（比触点清单更有洞察）
- 一次只聚焦一个用户角色
- 输出明确的行动结论并落地

### ❌ 避免这些

- 用会议讨论替代用户研究
- 把所有用户类型混在一张图里
- 只做视觉呈现，不做行动收敛
- 画完不更新，地图迅速失效

## 搭配建议

- 上游：同理心地图、Persona
- 下游：服务蓝图（补后台）、亲和图（归类主题）、JTBD（挖任务动机）

---
name: user-journey-map
description: Use when mapping the full end-to-end experience a user has with a product or service
user-invokable: true
args:
  - name: persona
    description: The target user persona (optional)
    required: false
  - name: scenario
    description: The journey scenario and scope (start/end points) (optional)
    required: false
---

Create a user journey map that visualizes the end-to-end experience a user has with a product or service. Capture phases, actions, touchpoints, emotions, pain points, and improvement opportunities.

## Steps

1. **Define persona and scenario**
   - Choose a specific persona (role, goals, constraints).
   - Set the journey scope (start and end points).

2. **List phases**
   - Break the journey into sequential stages (example: Awareness → Consideration → Purchase → Onboarding → Use → Renewal).
   - Keep phases distinct and user-centered.

3. **Map touchpoints and actions**
   - For each phase, document what the user does.
   - Note touchpoints/channels (web, app, email, sales, support, in-product UI, etc.).

4. **Capture emotions and pain points**
   - Record emotional highs/lows per phase; include a simple high/low curve.
   - Identify pain points, friction, and moments of delight.

5. **Identify opportunities**
   - Highlight drop-off risks, gaps, and improvements.
   - Prioritize opportunities by impact and effort when possible.

## Output Format

Return a horizontal timeline table with rows for:
- **Phase**
- **User Actions**
- **Touchpoints/Channels**
- **Emotions (high/low curve)**
- **Pain Points**
- **Opportunities**
