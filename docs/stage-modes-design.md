# Life Curve Engine 阶段模式设计文档

## 1. 文档目的

阶段模式是 V2 最适合优先推进的方向。

它的目标不是新增一堆页面，而是在现有闭环上增加“人生阶段视角”，让同一套行为数据在不同阶段下有不同的权重、解释和建议重点。

当前 V1.9 核心链路保持不变：

```text
行为输入 → 规则引擎 → 曲线/解释 → 建议 → 计划 → 闭环验证
```

阶段模式只影响：

- 权重。
- 解释重点。
- 建议排序。
- 计划优先级。
- 复盘视角。

不直接改行为输入，不直接替代规则引擎。

## 2. 核心原则

### 2.1 不重写主曲线

阶段模式不新增主曲线。

仍然使用现有基础曲线：

- `employment`
- `ai`
- `venture`
- `capital`
- `health`
- `composite`

阶段模式只改变这些曲线和实体/中间因子的解释权重。

### 2.2 不让 AI 决定权重

阶段模式的权重应由配置表控制。

AI 后续可以解释阶段模式，但不直接修改评分、阈值和权重。

### 2.3 阶段是用户当前策略，不是用户身份

用户可以切换阶段。

例如同一个人可以在 3 个月内从“学业优先”切到“求职优先”。

阶段模式应该被视为当前策略，不是长期标签。

## 3. V2 首批阶段模式

### 3.1 学业优先 `academic`

适合：

- 本科/研究生阶段。
- 考研、绩点、课程学习、竞赛。

重点实体：

- `self_core`
- `employment`
- `knowledge`
- `health`

重点中间因子：

- `cognitive_growth`
- `execution_power`
- `safety_floor`
- `recovery_rate`

建议优先级：

1. 学业/工作完成度。
2. 深度学习。
3. 睡眠。
4. 阅读。
5. 专注度。

### 3.2 求职优先 `career`

适合：

- 找实习。
- 校招。
- 刚进入职场。

重点实体：

- `employment`
- `self_core`
- `ai_system`
- `health`

重点中间因子：

- `execution_power`
- `safety_floor`
- `leverage_level`
- `opportunity_density`

建议优先级：

1. 学业/工作完成度。
2. 输出次数。
3. AI 协作深度。
4. 项目推进度。
5. 睡眠。

### 3.3 项目优先 `venture`

适合：

- 作品集。
- 副业。
- 创业尝试。
- 独立产品。

重点实体：

- `venture`
- `ai_system`
- `self_core`
- `knowledge`

重点中间因子：

- `opportunity_density`
- `leverage_level`
- `execution_power`
- `compounding_power`

建议优先级：

1. 项目推进度。
2. 输出次数。
3. AI 协作深度。
4. 专注度。
5. 睡眠。

### 3.4 健康修复 `health_recovery`

适合：

- 睡眠紊乱。
- 精力不足。
- 情绪波动。
- 长期压力后恢复。

重点实体：

- `health`
- `self_core`
- `employment`
- `capital`

重点中间因子：

- `recovery_rate`
- `risk_exposure`
- `safety_floor`
- `execution_power`

建议优先级：

1. 睡眠时长。
2. 情绪状态。
3. 运动得分。
4. 专注度。
5. 学业/工作完成度。

### 3.5 AI 杠杆成长 `ai_leverage`

适合：

- 想用 AI 提高学习、工作和项目效率。
- 想建设个人自动化系统。
- 想强化 AI 协作能力。

重点实体：

- `ai_system`
- `knowledge`
- `venture`
- `self_core`

重点中间因子：

- `leverage_level`
- `cognitive_growth`
- `compounding_power`
- `opportunity_density`

建议优先级：

1. AI 协作深度。
2. AI 协作时长。
3. 项目推进度。
4. 阅读时长。
5. 输出次数。

## 4. 推荐数据结构

### 4.1 阶段模式 ID

```ts
export type StageModeId =
  | "academic"
  | "career"
  | "venture"
  | "health_recovery"
  | "ai_leverage";
```

### 4.2 阶段模式配置

```ts
export type StageModeConfig = {
  id: StageModeId;
  label: string;
  description: string;
  entityWeights: Partial<Record<EntityId, number>>;
  intermediateWeights: Partial<Record<IntermediateFactorId, number>>;
  behaviorPriorities: BehaviorFactorId[];
  curveFocus: CurveSeriesKey[];
  adviceBias: {
    repair: BehaviorFactorId[];
    reinforce: BehaviorFactorId[];
    experiment: BehaviorFactorId[];
  };
};
```

### 4.3 用户当前阶段设置

```ts
export type UserStageModeSetting = {
  currentMode: StageModeId;
  updatedAt: string;
};
```

本地存储建议：

```text
lifeCurve.stageMode
```

## 5. 阶段模式如何影响系统

### 5.1 影响复合分数权重

阶段模式可以传入 `calculateCompositeScore` 的权重参数。

当前已有：

```ts
entityWeights
intermediateWeights
entityGroupWeight
intermediateGroupWeight
riskGroupWeight
```

阶段模式不需要改函数结构，只需要提供不同配置。

### 5.2 影响复盘解释

同样的历史数据，在不同阶段下解释重点不同。

例如：

- 学业优先：`deep_study` 下降更重要。
- 项目优先：`project_progress` 停滞更重要。
- 健康修复：`sleep_duration` 和 `risk_exposure` 更重要。

### 5.3 影响建议排序

当前建议分为：

- 修复。
- 强化。
- 实验。

阶段模式可以影响建议排序，但不直接制造事实。

建议逻辑：

```text
先看真实拖累/正向因素
再用阶段模式调整优先级
最后生成行动计划
```

### 5.4 影响计划成功标准

不同阶段的计划成功标准可以不同。

例：

学业优先：

```text
深度学习连续 7 天改善，并带动 cognitive_growth 或 employment 上升
```

项目优先：

```text
项目推进连续 7 天改善，并带动 venture 或 opportunity_density 上升
```

健康修复：

```text
睡眠连续 7 天稳定，并带动 recovery_rate 上升或 risk_exposure 下降
```

## 6. 阶段模式配置示例

```ts
export const stageModeConfigs: Record<StageModeId, StageModeConfig> = {
  academic: {
    id: "academic",
    label: "学业优先",
    description: "优先提高学习质量、主线完成度和稳定底盘。",
    entityWeights: {
      self_core: 1.2,
      employment: 1.3,
      knowledge: 1.2,
      health: 1.1
    },
    intermediateWeights: {
      cognitive_growth: 1.3,
      execution_power: 1.2,
      safety_floor: 1.2,
      recovery_rate: 1.1
    },
    behaviorPriorities: [
      "work_completion",
      "deep_study",
      "sleep_duration",
      "reading_time",
      "focus_score"
    ],
    curveFocus: ["employment", "health", "composite"],
    adviceBias: {
      repair: ["sleep_duration", "work_completion"],
      reinforce: ["deep_study", "reading_time"],
      experiment: ["focus_score", "deep_study"]
    }
  }
};
```

## 7. V2 实现顺序建议

### Phase 1：配置层

- 新增 `src/engine/stageModes.ts`。
- 新增阶段模式类型。
- 新增默认阶段模式。
- 本地存储当前阶段。

### Phase 2：权重接入

- 将阶段模式权重传入 `calculateCompositeScore`。
- 保持默认模式结果与当前 V1.9 一致。
- 给权重计算补测试。

### Phase 3：建议接入

- 在 `generateAdviceSummary` 中读取阶段模式。
- 先只影响建议排序和实验建议，不改变事实判断。

### Phase 4：复盘接入

- 在复盘结论中突出阶段关注项。
- 不改变原始统计，只改变重点排序和文案。

### Phase 5：轻量 UI

- 在当前工作台增加一个阶段模式选择器。
- 不拆复杂页面。
- 显示当前阶段对建议和权重的影响说明。

## 8. 风险与边界

### 8.1 不要让阶段模式变成标签焦虑

阶段模式应是工具，不是评价。

文案避免：

```text
你不适合创业
你应该放弃项目
```

建议使用：

```text
当前阶段更适合优先修复健康底盘
当前阶段建议先提高主线任务完成度
```

### 8.2 不要频繁切换导致历史不可比

如果允许切换阶段，后续需要记录权重版本。

建议：

- 当前阶段只影响未来计算。
- 历史快照保留生成时的阶段模式。
- 未来如需重算历史，必须显式触发。

### 8.3 不要让 AI 改阶段权重

AI 可以推荐阶段，但阶段权重必须来自配置表。

## 9. 最小 AI 入口关系

阶段模式和 AI 的关系应是：

```text
阶段模式配置 → 规则引擎产出结构化事实 → AI 润色复盘/建议
```

AI 可以做：

- 解释“为什么当前阶段建议你优先做 X”。
- 把复盘结论写得更自然。
- 帮用户理解阶段切换的影响。

AI 不应该做：

- 直接改权重。
- 直接判定计划是否有效。
- 直接改曲线分数。

