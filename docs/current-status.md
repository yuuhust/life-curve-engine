# Life Curve Engine 当前状态

## 1. 当前版本定位

当前工程处于 V1.9：稳定化与产品化整理阶段。

核心链路已经跑通：

```text
行为输入
→ 规则引擎
→ 曲线/解释
→ 建议
→ 计划
→ 闭环验证
```

当前仍是单页 MVP 工作台，不急于拆复杂页面。

## 2. 当前已完成能力

### 2.1 行为输入

- Daily Check-in 表单。
- 12 个首发行为因子。
- 本地保存每日行为输入。

### 2.2 规则引擎

- 行为分档阈值配置表。
- 行为因子到实体/中间因子的权重映射。
- 连续奖励。
- 中断衰减。
- 实体状态更新。
- 中间因子状态更新。

### 2.3 曲线与解释

- 复合分数计算。
- 基础曲线字段生成：`employment`、`ai`、`venture`、`capital`、`health`、`composite`。
- 曲线轻量切换展示。
- 解释生成引用行为分数、实体变化、中间因子变化、streak/decay。

### 2.4 复盘、模拟、建议

- 最近 7 天 / 30 天复盘。
- 连续趋势解释。
- 单因子模拟。
- 单因子连续 N 天模拟。
- 三类行动建议：修复、强化、实验。

### 2.5 计划与闭环

- 建议转行动计划。
- 计划状态：`not_started`、`in_progress`、`completed`、`abandoned`。
- 计划保留 `relatedFactors`、`evidence`、来源建议类型。
- 基于最近 3 天 vs 前 3 天做轻量闭环验证。
- 输出 `effective`、`partially_effective`、`no_clear_effect`。

## 3. 当前页面

| 路由 | 状态 | 说明 |
| --- | --- | --- |
| `/` | 已完成 MVP | 主工作台，包含输入、曲线、模拟、建议、计划、复盘、实体、中间因子、本地数据管理 |
| `/check-in` | 复用 `/` | 当前不单独拆页面 |

## 4. 当前核心模块

| 模块 | 文件 | 说明 |
| --- | --- | --- |
| 参数配置 | `src/engine/config.ts` | 集中维护关键窗口、阈值和轻量参数 |
| 规则表 | `src/engine/rules.ts` | 行为分档、实体/中间因子权重、streak/decay profile |
| 行为评分 | `src/engine/behaviorScoring.ts` | 输出 `BehaviorScore[]` |
| 快照编排 | `src/engine/snapshot.ts` | 串联规则引擎、曲线、解释 |
| 曲线生成 | `src/engine/curveGenerator.ts` | 复合分数、曲线参数、基础曲线字段 |
| 解释生成 | `src/engine/explanationGenerator.ts` | 多源解释 |
| 模拟器 | `src/engine/simulation.ts` | 单因子与连续模拟 |
| 复盘 | `src/engine/review.ts` | 周/月复盘与连续趋势解释 |
| 建议 | `src/engine/advice.ts` | 生成修复/强化/实验建议，并转行动计划 |
| 闭环验证 | `src/engine/planValidation.ts` | 验证计划是否有效 |
| 本地存储 | `src/storage/localStorage.ts` | 输入、快照、计划状态、导出、清空 |

## 5. 参数与阈值集中位置

当前关键调参位置：

- `src/engine/config.ts`
- `src/engine/rules.ts`
- `src/engine/curveGenerator.ts`

详细参数总表见 `docs/engine-overview.md`。

## 6. 当前未完成

- 乘数因子还没有完整参与跨因子收益放大。
- 慢变量还没有长期平滑机制。
- `curveWeight` 仍是预留字段。
- 计划验证还没有计划开始时间，只使用最近 3 天 vs 前 3 天。
- 还没有 AI 自动分析。
- 还没有多方案模拟系统。
- 还没有 E2E UI 测试。

## 7. 本地验证

```bash
npm install
npm run typecheck
npm run test
npm run build
npm run dev
```

访问：

```text
http://localhost:3000
```

