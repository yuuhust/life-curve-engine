# Life Curve Engine V1.2 阶段整理

## 1. 当前已完成能力

### 1.1 MVP 页面

- `/`：当前主工作台。
- `/check-in`：复用主工作台。

当前页面包含：

- Daily Check-in 表单。
- 复合总曲线展示。
- 解释面板。
- 主体/实体状态面板。
- 中间因子状态面板。
- 本地数据导出与清空入口。

### 1.2 规则引擎

- 12 个首发行为因子。
- 行为分档阈值配置表。
- 行为因子到实体、中间因子的权重映射。
- 基于历史 `DailyBehaviorInput[]` 的连续奖励。
- 基于历史 `DailyBehaviorInput[]` 的中断衰减。
- 因子级 `streakProfile` / `decayProfile` 扩展结构。
- 实体状态更新。
- 中间因子状态更新。
- 复合分数计算。
- 基础曲线数据点生成。

### 1.3 解释层

解释生成现在引用：

- 行为分数。
- 实体变化。
- 中间因子变化。
- `streakModifier` 是否触发。
- `decayModifier` 是否触发。

解释输出已经从“只描述行为分数”升级为“原因分析”的雏形。

### 1.4 权重层

复合分数已经支持：

- `entityWeights`
- `intermediateWeights`
- `entityGroupWeight`
- `intermediateGroupWeight`
- `riskGroupWeight`

默认权重保持当前结果不变。

### 1.5 本地存储管理

本地存储已支持：

- `version` 字段。
- migration 占位。
- 导出 JSON。
- 清空数据。

## 2. 已真正参与计算的字段

| 字段 | 位置 | 当前作用 |
| --- | --- | --- |
| `thresholds` | `src/engine/rules.ts` | 行为分档 |
| `entities` | `src/engine/rules.ts` | 实体更新权重 |
| `intermediates` | `src/engine/rules.ts` | 中间因子更新权重 |
| `streakEligible` | `src/engine/rules.ts` | 是否启用连续奖励 |
| `decayEligible` | `src/engine/rules.ts` | 是否启用中断衰减 |
| `streakProfile` | `src/engine/rules.ts` | 因子级连续奖励配置，未配置时使用默认 profile |
| `decayProfile` | `src/engine/rules.ts` | 因子级中断衰减配置，未配置时使用默认 profile |
| `entityWeights` | `src/engine/curveGenerator.ts` | 复合分数实体加权平均 |
| `intermediateWeights` | `src/engine/curveGenerator.ts` | 复合分数中间因子加权平均 |
| `entityGroupWeight` | `src/engine/curveGenerator.ts` | 复合分数实体组权重 |
| `intermediateGroupWeight` | `src/engine/curveGenerator.ts` | 复合分数中间因子组权重 |
| `riskGroupWeight` | `src/engine/curveGenerator.ts` | 复合分数风险组权重 |
| `version` | `src/storage/localStorage.ts` | 本地存储版本识别 |

## 3. 仍是预留的字段

| 字段 | 位置 | 预留用途 |
| --- | --- | --- |
| `curveWeight` | `src/engine/rules.ts` | 未来让行为因子直接影响曲线参数的权重 |
| `isMultiplier` | `src/engine/rules.ts` | 未来实现跨因子收益倍率 |
| `isSlowVariable` | `src/engine/rules.ts` | 未来实现慢变量长期平滑 |
| 自定义 `streakProfile` | `src/engine/rules.ts` | 未来让不同因子使用不同连续奖励曲线 |
| 自定义 `decayProfile` | `src/engine/rules.ts` | 未来让不同因子使用不同中断衰减曲线 |
| migration 具体转换逻辑 | `src/storage/localStorage.ts` | 未来存储结构升级时迁移旧数据 |

说明：`streakProfile` / `decayProfile` 的机制已经参与计算，但当前所有因子仍使用默认 profile，没有单独覆盖。

## 4. 当前规则引擎、解释层、权重层做到哪里

### 4.1 规则引擎

当前规则引擎已经能完成：

```text
DailyBehaviorInput
→ BehaviorScore[]
→ EntityState[]
→ IntermediateFactorState[]
→ CurveParameters
→ CurvePoint[]
→ ExplanationItem[]
```

规则引擎仍未完成：

- 慢变量长期平滑。
- 乘数因子跨因子放大。
- `curveWeight` 对曲线参数的真实影响。

### 4.2 解释层

当前解释层已经能引用多源数据。

仍未完成：

- 解释模板规则表化。
- 解释与具体实体/中间因子的因果链完全追踪。
- 周/月复盘解释。

### 4.3 权重层

当前权重层已经支持复合分数加权结构，默认结果保持稳定。

仍未完成：

- 用户可配置权重。
- 不同阶段的权重方案。
- 权重变更后的历史重算策略。

## 5. 基础曲线数据结构

`CurvePoint` 当前包含：

```ts
type CurvePoint = {
  dayIndex: number;
  employment: number;
  ai: number;
  venture: number;
  capital: number;
  health: number;
  composite: number;
};
```

当前只在 engine 层生成基础曲线字段，UI 仍只展示 `composite`。

## 6. 最小模拟器数据流设计

模拟器 V1 不应先做复杂页面，应复用现有规则引擎。

建议数据流：

```text
当前 LifeCurveSnapshot
→ 复制当前 DailyBehaviorInput
→ 用户修改少量行为因子
→ 构造 SimulationInput
→ 调用 createLifeCurveSnapshot(simulatedInput, currentSnapshot, history)
→ 得到 simulatedSnapshot
→ 对比 compositeScore、CurvePoint、ExplanationItem
```

模拟结果不写入 `localStorage`。

### 6.1 适合优先模拟的行为因子

优先选择影响强、用户容易理解、输入成本低的因子：

- `ai_depth`
- `project_progress`
- `sleep_duration`
- `focus_score`
- `work_completion`

第二批可加入：

- `reading_time`
- `deep_study`
- `finance_action`
- `exercise_score`

暂不建议优先模拟：

- `emotion_state`，波动较大，容易让用户误解为系统在“预测情绪”。
- `output_count`，需要更好的输出质量建模后再模拟。

## 7. 下一步建议

1. 给本地存储管理补最小测试，尤其是 migration 占位和导出结构。
2. 在 engine 层增加 `SimulationInput` / `SimulationResult` 类型和纯函数。
3. 让解释层输出更明确的“影响路径”：行为 → 实体 → 中间因子 → 曲线。
4. 让基础曲线字段参与简单对比，但先不急着做复杂曲线页。
5. 后续再拆页面，不要在内核稳定前扩大 UI 面。

