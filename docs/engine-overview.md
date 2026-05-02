# Life Curve Engine 内核总览

## 1. 核心链路

```text
DailyBehaviorInput
→ scoreDailyBehavior
→ updateEntities
→ updateIntermediateFactors
→ calculateCompositeScore / generateCompositeCurve
→ generateExplanations
→ generateReviewSummary
→ generateAdviceSummary
→ createActionPlansFromAdvice
→ validateActionPlans
```

对应产品链路：

```text
行为输入 → 规则引擎 → 曲线/解释 → 建议 → 计划 → 闭环验证
```

## 2. 数据结构流转

| 阶段 | 输入 | 输出 |
| --- | --- | --- |
| 行为输入 | 用户录入 | `DailyBehaviorInput` |
| 行为评分 | `DailyBehaviorInput` + 历史输入 | `BehaviorScore[]` |
| 实体更新 | `BehaviorScore[]` + 上期实体 | `EntityState[]` |
| 中间因子更新 | `BehaviorScore[]` + 上期中间因子 | `IntermediateFactorState[]` |
| 曲线生成 | 实体 + 中间因子 | `CurvePoint[]`、`CurveParameters` |
| 解释生成 | 行为 + 实体 + 中间因子 | `ExplanationItem[]` |
| 快照 | 全部计算结果 | `LifeCurveSnapshot` |
| 复盘 | `LifeCurveSnapshot[]` | `ReviewSummary` |
| 建议 | 复盘 + 当前快照 + 连续模拟 | `AdviceSummary` |
| 计划 | `AdviceSummary` + 状态 | `ActionPlanItem[]` |
| 闭环验证 | 计划 + 快照历史 | `PlanValidationSummary` |

## 3. 参数与阈值总表

### 3.1 行为分档

位置：`src/engine/rules.ts`

每个行为因子都有：

```ts
thresholds: Array<{ max: number; score: -2 | -1 | 0 | 1 | 2 }>
```

### 3.2 连续奖励

位置：`src/engine/rules.ts`

默认 profile：

| 连续天数 | 修正 |
| --- | --- |
| 2-3 | `+0.1` |
| 4-6 | `+0.2` |
| 7-13 | `+0.35` |
| 14+ | `+0.5` |

### 3.3 中断衰减

位置：`src/engine/rules.ts`

默认 profile：

| 中断天数 | 修正 |
| --- | --- |
| 2-3 | `-0.1` |
| 4-6 | `-0.25` |
| 7+ | `-0.4` |

### 3.4 边际递减

位置：`src/engine/config.ts`

```ts
behaviorScoringConfig.diminishingModifier = -0.1
```

### 3.5 复盘窗口

位置：`src/engine/config.ts`

| 参数 | 当前值 |
| --- | --- |
| `weeklyWindow` | 7 |
| `monthlyWindow` | 30 |
| `trendWindow` | 7 |

### 3.6 闭环验证

位置：`src/engine/config.ts`

| 参数 | 当前值 |
| --- | --- |
| `recentWindow` | 3 |
| `factorImprovementThreshold` | 0.25 |
| `compositeImprovementThreshold` | 0.5 |

判断：

```text
factorImproved && compositeImproved → effective
factorImproved || compositeImproved → partially_effective
否则 → no_clear_effect
```

### 3.7 连续模拟

位置：`src/engine/config.ts`

| 参数 | 当前值 |
| --- | --- |
| `defaultContinuousDays` | 7 |
| `minContinuousDays` | 2 |
| `maxContinuousDays` | 30 |

### 3.8 复合分数权重

位置：`src/engine/curveGenerator.ts`

默认：

```text
entityGroupWeight = 0.55
intermediateGroupWeight = 0.35
riskGroupWeight = 0.1
```

`entityWeights` 和 `intermediateWeights` 当前默认等权。

## 4. 当前 AI 入口建议

最适合先接 AI 的点：自然语言复盘摘要 / 建议润色。

原因：

- 不改规则引擎。
- 不让 AI 参与打分、判定或曲线生成。
- 可以把 `ReviewSummary`、`AdviceSummary`、`PlanValidationSummary` 作为事实输入。
- AI 只负责把结构化结果转成更自然、更有行动感的文字。

建议边界：

```text
规则引擎产出事实
→ AI 润色说明
→ 用户看到更自然的复盘/建议
```

不要让 AI 直接修改权重、阈值或验证判定。

