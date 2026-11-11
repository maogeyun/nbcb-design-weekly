---
name: rice
description: 用 RICE（Reach×Impact×Confidence÷Effort）量化功能/项目优先级，把“我觉得”变为可挑战的数字假设，支撑季度规划与资源分配。
user-invokable: true
args:
  - name: items
    description: 要排序的功能/项目清单（可选）
    required: false
---

RICE 适合“清单已存在但排序有争议”的场景。重点不是分数精确，而是对齐单位与假设，让分歧落在可讨论的维度上。

## 公式

\( \text{RICE} = \dfrac{Reach \times Impact \times Confidence}{Effort} \)

- **Reach**：周期内受影响用户数（用绝对数，先对齐时间窗：周/月/季度）
- **Impact**：对核心指标影响（建议固定量表：0.25/0.5/1/2/3）
- **Confidence**：对 Reach/Impact 估算把握（100%/80%/50%）
- **Effort**：总人力成本（设计+研发+测试的人周/人月）

## 使用要点（避免失真）

- Reach 单位先统一，否则不可比
- Impact 必须绑定指标（例如激活率+15%），避免“感觉很大”
- Confidence < 50%：先做小实验/访谈提升信心
- Effort 用相对人月，避免漏算沟通与返工
- 分数是对话起点：异常高/低都值得复核假设

