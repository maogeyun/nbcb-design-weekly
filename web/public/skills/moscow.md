---
name: moscow
description: 用 MoSCoW 将需求分为 Must/Should/Could/Won't（this time），用“如果不做会怎样”约束范围蔓延，保障按时交付。
user-invokable: true
args:
  - name: backlog
    description: 需求/故事清单（可选）
    required: false
---

MoSCoW 的核心不是贴标签，而是逼团队回答：**不做这个会怎样？** 没有清晰的“Won’t（这次不做）”，范围蔓延就不会停止。

## 四类

- **Must Have**：没有它产品无法运作/无法交付核心价值（底线）
- **Should Have**：重要但可延期，会明显影响价值
- **Could Have**：锦上添花，有余力才做
- **Won’t Have (this time)**：这次明确不做（不等于永远不做）

## 健康分布参考

- Must ~60%，Should ~20%，Could ~10%，Won’t ~10%
- Must > 60% 通常意味着范围过大，需要重谈

## 落地建议

1) 先定义“this time”的时间窗口（Sprint/季度/版本）
2) 让工程参与分类（可行性影响优先级）
3) 输出要有关键干系人认可/签字，否则没有约束力
4) 定期回顾 Won’t 列表，但不要随时推翻

