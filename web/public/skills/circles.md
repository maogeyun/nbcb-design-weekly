---
name: circles
description: 用 CIRCLES（Comprehend→Identify→Report→Cut→List→Evaluate→Summarize）结构化从问题到方案的推演，避免未理解问题就跳入解法。
user-invokable: true
args:
  - name: prompt
    description: 要分析的产品设计题/需求（可选）
    required: false
---

CIRCLES 的价值不是给“标准答案”，而是提供强制路径：先澄清情境与用户，再挖需求与优先级，最后生成多个方向并做权衡。

## 七步流程

1) **Comprehend 理解情境**：产品是什么/商业模式/目标/约束？先问清楚再开口
2) **Identify 识别用户**：列细分并选定 1 类目标用户（不能说“所有人”）
3) **Report 需求**：用 JTBD 写 5–8 条目标/痛点/任务（先广后筛，别写方案）
4) **Cut 切割优先级**：用显式标准选 1 个核心需求（影响×战略契合等）
5) **List 列方案**：提出 3–5 个本质不同方向（不是微调）
6) **Evaluate 评估权衡**：对每个方案评：用户价值/工程复杂度/业务价值
7) **Summarize 总结建议**：一句话建议 + top2 风险与应对 + 成功指标与时间框架

## 适用场景

- PM 面试产品设计题
- 新功能立项前（写 PRD 前）
- 设计评审（检验方案是否源于用户需求）
- 模糊需求结构化处理（“做一个竞品有的功能”）

