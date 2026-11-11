---
name: daci
description: 用 DACI 明确决策角色：Driver 推动、Approver 拍板、Contributor 提供输入、Informed 知情，提升跨团队决策速度与清晰度。
user-invokable: true
args:
  - name: decision
    description: 需要做出的决策事项（可选）
    required: false
---

DACI 解决“开会 2 小时没结论”的结构性问题：先写清楚谁推动、谁拍板，贡献者提供输入但不能否决，知情者在决策后被告知。

## 四个角色（人数建议）

- **D Driver（推动者）**：组织流程、收集输入、确保按截止日期产出决定（通常 1 人）
- **A Approver（批准者）**：最终拍板（通常 1 人；多 Approver 会指数级拖慢）
- **C Contributor（贡献者）**：提供专业输入（少而关键）
- **I Informed（知情者）**：决策后告知（覆盖完整相关方）

## 使用方式（写在文档最顶部）

在会议邀请/决策文档第一行写：

- D：___
- A：___
- C：___
- I：___

## 常见失败模式（自查）

- 多个 Approver（互相否决，决策瘫痪）
- Driver=Approver（角色混淆，其他人不知道听谁的）
- Contributor 过多（输入收集难以管理）
- 忘记通知 Informed（制造信任赤字）

