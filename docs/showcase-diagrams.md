# Showcase Diagrams

本文件用于公开展示准备阶段，先用 Markdown / Mermaid 描述 README 或展示页可用的配图素材。后续如果需要正式图片，可以基于这些结构导出 SVG 或 PNG。

## 系统架构图建议

用途：说明 Life Curve Engine 的核心不是“预测人生”，而是把行为记录转成可解释的状态、曲线、建议和验证。

```mermaid
flowchart LR
  Input["行为输入<br/>12 个行为因子"]
  Rules["规则引擎<br/>分档 / streak / decay"]
  Entities["主体/实体层<br/>7 个实体状态"]
  Intermediate["中间因子层<br/>8 个内部变量"]
  Curves["曲线层<br/>基础曲线 + composite"]
  Explain["解释层<br/>原因分析"]
  Review["复盘 / 模拟<br/>7 天 / 30 天 / if-then"]
  Advice["建议层<br/>修复 / 强化 / 7 天测试"]
  Plan["行动计划<br/>状态跟踪"]
  Validate["闭环验证<br/>有效性判断"]
  Summary["自然语言摘要<br/>只读结构化事实"]

  Input --> Rules --> Entities --> Intermediate --> Curves
  Curves --> Explain
  Curves --> Review
  Explain --> Review
  Review --> Advice --> Plan --> Validate --> Summary
  Advice --> Summary
  Review --> Summary
```

## 用户工作流图建议

用途：放在 README 或展示页中，让第一次打开项目的人知道如何操作工作台。

```mermaid
flowchart TD
  Start["打开工作台<br/>自动载入 Academic Demo"]
  Stage["选择阶段模式<br/>academic / venture / career / health / ai"]
  CheckIn["记录今天<br/>填写 12 个行为因子"]
  Curve["看曲线与复盘<br/>曲线 / 7 天 / 30 天"]
  Advice["看建议与计划<br/>修复 / 强化 / 实验"]
  Simulation["做模拟<br/>单因子 / 连续 N 天"]
  Summary["读摘要<br/>复盘摘要 / 建议摘要 / 执行提醒"]
  Export["导出或切换 Demo<br/>JSON / Academic / Venture"]

  Start --> Stage --> CheckIn --> Curve --> Advice --> Simulation --> Summary
  Summary --> Export
  Export --> Stage
```

## README 配图落点

- 第一张：系统架构图，放在“核心链路”之后。
- 第二张：用户工作流图，放在“当前工作台主流程”之后。
- 可选第三张：一张桌面端工作台截图，展示曲线、复盘、建议和模拟同时可见。
- 可选第四张：一张移动端截图，证明主流程在窄屏下仍可阅读。
