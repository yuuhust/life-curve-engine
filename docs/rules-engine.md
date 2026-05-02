# Life Curve Engine 规则引擎设计

## 1. 文档目的

本文档提炼 Life Curve Engine V1 的规则引擎设计，方便后续实现和修改。

它关注：

- 12 个首发行为因子。
- 行为因子到实体、中间因子、曲线的映射。
- 每个因子的正负向规则。
- 连续奖励机制。
- 中断衰减机制。
- 乘数因子与慢变量分类。

产品定义以 `docs/life-curve-engine-v1-spec.md` 为准，系统分层以 `docs/architecture.md` 为准。

## 2. 规则引擎核心链路

```text
Daily Behavior Input
→ Behavior Score
→ Entity Update
→ Intermediate Factor Update
→ Curve Parameter Update
→ Curve Re-render
→ Explanation Output
```

V1 使用规则型引擎，不追求精确人生预测。

规则引擎需要支持：

- 基础分。
- 连续奖励。
- 中断衰减。
- 因子联动。
- 上限控制。
- 边际递减。

## 3. 标准化行为评分

每个行为因子每天输出一个标准化状态值：

| 状态值 | 含义 | 解释 |
| --- | --- | --- |
| `-2` | 危险 | 明显损害当前状态或长期趋势 |
| `-1` | 偏低 | 低于期望，产生轻微拖累 |
| `0` | 普通 | 不明显加分，也不明显扣分 |
| `+1` | 良好 | 对相关实体和中间因子产生正向影响 |
| `+2` | 优秀 | 高质量完成，产生强正向影响 |

建议行为总分结构：

```ts
export type BehaviorScore = {
  factorId: BehaviorFactorId;
  rawValue: number | string;
  normalizedScore: -2 | -1 | 0 | 1 | 2;
  streakModifier: number;
  decayModifier: number;
  diminishingModifier: number;
  finalScore: number;
};
```

## 4. 12 个首发行为因子

| 因子 ID | 名称 | 建议输入 | 类型 |
| --- | --- | --- | --- |
| `ai_hours` | AI 协作时长 | 小时数 | 行动量 |
| `ai_depth` | AI 协作深度 | 1-5 分 | 质量 |
| `reading_time` | 阅读时长 | 分钟数 | 慢变量 |
| `deep_study` | 深度学习时长 | 小时数 | 慢变量 |
| `project_progress` | 项目推进度 | 0-100 或 1-5 分 | 行动结果 |
| `output_count` | 输出次数 | 次数 | 行动结果 |
| `sleep_duration` | 睡眠时长 | 小时数 | 乘数/底盘 |
| `exercise_score` | 运动得分 | 0-100 或 1-5 分 | 慢变量/底盘 |
| `focus_score` | 专注度 | 0-100 或 1-5 分 | 乘数 |
| `work_completion` | 学业/工作完成度 | 0-100 | 底盘 |
| `finance_action` | 储蓄/投资动作 | 0/1 或金额/等级 | 慢变量 |
| `emotion_state` | 情绪状态 | -2 到 +2 或 1-5 分 | 波动调节 |

## 5. 行为因子影响映射

| 行为因子 | 影响实体 | 影响中间因子 | 影响曲线 | 特征 |
| --- | --- | --- | --- | --- |
| `ai_hours` | `ai_system` | `leverage_level`, `execution_power`, `opportunity_density` | AI 曲线、项目曲线、总曲线 | 短期强、长期中强 |
| `ai_depth` | `ai_system`, `knowledge` | `leverage_level`, `cognitive_growth`, `compounding_power` | AI 曲线、自我能力曲线、项目曲线 | 长期极强 |
| `reading_time` | `knowledge` | `cognitive_growth`, `compounding_power` | 自我能力曲线、AI 曲线、项目曲线 | 短期弱、长期强 |
| `deep_study` | `self_core`, `knowledge` | `cognitive_growth`, `execution_power` | 自我能力曲线、就业曲线、AI 曲线 | 长期强 |
| `project_progress` | `venture` | `execution_power`, `opportunity_density`, `leverage_level` | 项目曲线、总曲线 | 短期强、长期强 |
| `output_count` | `self_core`, `venture` | `execution_power`, `opportunity_density` | 自我能力曲线、项目曲线、总曲线 | 短期中强、长期强 |
| `sleep_duration` | `health` | `recovery_rate`, `execution_power`, `safety_floor` | 全部曲线 | 基础乘数因子 |
| `exercise_score` | `health` | `recovery_rate`, `execution_power`, `risk_exposure` | 全部曲线 | 长期底盘因子 |
| `focus_score` | `self_core`, `health` | `execution_power`, `leverage_level` | 自我能力曲线、AI 曲线、项目曲线 | 收益放大器 |
| `work_completion` | `employment`, `self_core` | `safety_floor`, `execution_power` | 就业曲线、总曲线底盘 | 稳定底盘因子 |
| `finance_action` | `capital` | `safety_floor`, `compounding_power` | 资本复利曲线、总曲线低点 | 短期弱、长期强 |
| `emotion_state` | `health`, `self_core` | `execution_power`, `recovery_rate`, `risk_exposure` | 全部曲线 | 短期波动放大器/缓冲器 |

## 6. 因子分档建议

分档阈值用于 V1 初版规则。后续可以根据真实使用数据调整。

| 因子 ID | 危险 `-2` | 偏低 `-1` | 普通 `0` | 良好 `+1` | 优秀 `+2` |
| --- | --- | --- | --- | --- | --- |
| `ai_hours` | 0 小时 | 0-0.5 小时 | 0.5-1 小时 | 1-2.5 小时 | 2.5-5 小时 |
| `ai_depth` | 1 分 | 2 分 | 3 分 | 4 分 | 5 分 |
| `reading_time` | 0 分钟 | 1-14 分钟 | 15-29 分钟 | 30-59 分钟 | 60 分钟以上 |
| `deep_study` | 0 小时 | 0-0.5 小时 | 0.5-1 小时 | 1-2 小时 | 2 小时以上 |
| `project_progress` | 0 | 1-19 | 20-49 | 50-79 | 80-100 |
| `output_count` | 0 次 | 0 次但有草稿 | 1 次轻量输出 | 1 次完整输出 | 2 次以上或高质量输出 |
| `sleep_duration` | 少于 5 小时或超过 10 小时 | 5-6 小时 | 6-7 小时 | 7-8.5 小时 | 7.5-8.5 小时且醒后状态好 |
| `exercise_score` | 0 | 1-20 | 21-50 | 51-80 | 81-100 |
| `focus_score` | 0-20 | 21-40 | 41-60 | 61-80 | 81-100 |
| `work_completion` | 0-30 | 31-50 | 51-70 | 71-90 | 91-100 |
| `finance_action` | 冲动消费/负向动作 | 无记录且有明显消费 | 无动作 | 小额储蓄/记账 | 明确储蓄/投资/降低风险 |
| `emotion_state` | 很差 | 偏差 | 平稳 | 较好 | 很好且稳定 |

说明：

- `sleep_duration` 不是越多越好，应有上限控制。
- `ai_hours` 需要边际递减，防止单纯堆时长。
- `finance_action` 的 V1 规则应保守，不做复杂金融评估。
- `emotion_state` 用于调节波动，不应单独决定长期曲线。

## 7. 每个因子的正负向规则

### 7.1 `ai_hours` AI 协作时长

| 方向 | 规则 |
| --- | --- |
| 正向 | 达到良好区后，提升 `ai_system`、`leverage_level`、`execution_power`。 |
| 正向 | 与高 `focus_score` 同时出现时，提高 AI 曲线和项目曲线的短期斜率。 |
| 负向 | 长期为 0 时，降低 AI 曲线增长速度和机会密度。 |
| 约束 | 超过优秀区后边际递减，不能无限增加杠杆强度。 |

### 7.2 `ai_depth` AI 协作深度

| 方向 | 规则 |
| --- | --- |
| 正向 | 高深度协作显著提升 `leverage_level`、`cognitive_growth`、`compounding_power`。 |
| 正向 | 连续高分时，提高 AI 曲线长期斜率和项目曲线跃迁概率。 |
| 负向 | 低深度但高时长时，只给有限加成，并提示“使用 AI 停留在浅层”。 |
| 约束 | 该因子权重高于 `ai_hours`，质量优先于时长。 |

### 7.3 `reading_time` 阅读时长

| 方向 | 规则 |
| --- | --- |
| 正向 | 稳定阅读提升 `knowledge`、`cognitive_growth`、`compounding_power`。 |
| 正向 | 与 `deep_study` 连续出现时，提高自我能力曲线长期斜率。 |
| 负向 | 长期中断时，降低知识积累体趋势。 |
| 约束 | 短期加成较弱，主要作为慢变量影响长期。 |

### 7.4 `deep_study` 深度学习时长

| 方向 | 规则 |
| --- | --- |
| 正向 | 良好及以上提升 `self_core`、`knowledge`、`cognitive_growth`、`execution_power`。 |
| 正向 | 与高 `work_completion` 同时出现时，提高就业曲线稳定斜率。 |
| 负向 | 长期缺失时，自我能力体增长放缓。 |
| 约束 | 需要受 `sleep_duration` 和 `focus_score` 调节，疲劳状态下收益下降。 |

### 7.5 `project_progress` 项目推进度

| 方向 | 规则 |
| --- | --- |
| 正向 | 良好及以上提升 `venture`、`execution_power`、`opportunity_density`。 |
| 正向 | 连续推进时，提高项目曲线斜率和 `jumpProbability`。 |
| 负向 | 多日无推进时，降低项目曲线动能和机会密度。 |
| 约束 | V1 高权重实现，项目推进对总曲线短期影响较强。 |

### 7.6 `output_count` 输出次数

| 方向 | 规则 |
| --- | --- |
| 正向 | 输出增加 `self_core`、`venture`、`execution_power`、`opportunity_density`。 |
| 正向 | 与项目推进同时出现时，提高项目曲线和总曲线的可见动能。 |
| 负向 | 长期无输出时，机会密度下降。 |
| 约束 | 输出质量暂不复杂建模，V1 可先按次数和完整度粗略评分。 |

### 7.7 `sleep_duration` 睡眠时长

| 方向 | 规则 |
| --- | --- |
| 正向 | 良好睡眠提升 `health`、`recovery_rate`、`execution_power`、`safety_floor`。 |
| 正向 | 作为基础乘数，提高其他正向行为的有效收益。 |
| 负向 | 危险睡眠降低全部曲线当日有效收益，提高波动和风险暴露。 |
| 约束 | 不是越多越好，过短和过长都进入惩罚区。 |

### 7.8 `exercise_score` 运动得分

| 方向 | 规则 |
| --- | --- |
| 正向 | 稳定运动提升 `health`、`recovery_rate`，降低 `risk_exposure`。 |
| 正向 | 连续运动提高长期安全底盘和恢复参数。 |
| 负向 | 长期缺失时，健康体趋势下降，恢复速度下降。 |
| 约束 | 短期收益中等，长期底盘价值更高。 |

### 7.9 `focus_score` 专注度

| 方向 | 规则 |
| --- | --- |
| 正向 | 高专注提升 `self_core`、`execution_power`、`leverage_level`。 |
| 正向 | 作为收益放大器，提高学习、AI、项目相关行为的收益。 |
| 负向 | 低专注削弱当天学习、AI、项目行为的实际效果。 |
| 约束 | V1 高权重实现，应影响多个行为的收益倍率。 |

### 7.10 `work_completion` 学业/工作完成度

| 方向 | 规则 |
| --- | --- |
| 正向 | 高完成度提升 `employment`、`self_core`、`safety_floor`、`execution_power`。 |
| 正向 | 连续高完成度提高就业曲线稳定性和总曲线低点。 |
| 负向 | 低完成度降低安全底盘，提高总曲线回撤风险。 |
| 约束 | V1 高权重实现，是稳定底盘核心因子。 |

### 7.11 `finance_action` 储蓄/投资动作

| 方向 | 规则 |
| --- | --- |
| 正向 | 正向财务动作提升 `capital`、`safety_floor`、`compounding_power`。 |
| 正向 | 连续正向动作提高资本复利曲线长期斜率和总曲线低点。 |
| 负向 | 明显负向财务动作提高风险暴露，削弱安全底盘。 |
| 约束 | V1 只做简单行为建模，不做复杂金融收益预测。 |

### 7.12 `emotion_state` 情绪状态

| 方向 | 规则 |
| --- | --- |
| 正向 | 稳定正向情绪提升 `health`、`recovery_rate` 和执行力。 |
| 正向 | 情绪良好时，可以缓冲短期波动。 |
| 负向 | 情绪危险区提高 `risk_exposure`，削弱执行力和恢复速度。 |
| 约束 | 主要作为短期波动放大器/缓冲器，不单独决定长期走势。 |

## 8. 连续奖励机制

连续奖励用于鼓励稳定行为，但不能让分数无限膨胀。

### 8.1 适用因子

优先适用于：

- `ai_depth`
- `reading_time`
- `deep_study`
- `project_progress`
- `output_count`
- `sleep_duration`
- `exercise_score`
- `focus_score`
- `work_completion`
- `finance_action`

### 8.2 建议规则

| 连续天数 | 修正 |
| --- | --- |
| 2-3 天 | `+0.1` |
| 4-6 天 | `+0.2` |
| 7-13 天 | `+0.35` |
| 14 天以上 | `+0.5` 上限 |

### 8.3 设计约束

- 连续奖励只加到 `finalScore`，不改变原始输入。
- 连续奖励有上限，建议最高 `+0.5`。
- 危险区行为不触发连续奖励。
- 对乘数因子，连续奖励更多影响稳定性和恢复，不直接暴力拉高曲线。

## 9. 中断衰减机制

中断衰减用于表达长期行为断裂的影响。

### 9.1 适用因子

重点适用于慢变量和底盘变量：

- `ai_depth`
- `reading_time`
- `deep_study`
- `project_progress`
- `exercise_score`
- `work_completion`
- `finance_action`

### 9.2 建议规则

| 中断天数 | 修正 |
| --- | --- |
| 1 天 | `0` 或轻微提醒 |
| 2-3 天 | `-0.1` |
| 4-6 天 | `-0.25` |
| 7 天以上 | `-0.4` |

### 9.3 设计约束

- 中断衰减不应过度惩罚偶发休息。
- 睡眠、情绪这类每日状态不按普通中断计算，而按当天状态即时影响。
- 财务动作可以按周频率计算，不要求每天发生。
- 阅读、运动等慢变量应更重视长期趋势，而不是单日表现。

## 10. 乘数因子与慢变量

### 10.1 乘数因子

乘数因子会放大或削弱其他行为收益。

| 因子 ID | 类型 | 影响方式 |
| --- | --- | --- |
| `sleep_duration` | 基础乘数 | 影响全部曲线的有效收益、恢复和风险 |
| `focus_score` | 收益放大器 | 放大学习、AI、项目行为收益 |
| `emotion_state` | 波动调节器 | 放大或缓冲短期波动 |

建议乘数计算：

| 状态值 | 倍率建议 |
| --- | --- |
| `-2` | `0.7` |
| `-1` | `0.85` |
| `0` | `1.0` |
| `+1` | `1.1` |
| `+2` | `1.2` |

说明：

- `sleep_duration` 的危险区应同时提高 `risk_exposure`。
- `focus_score` 主要放大学习、AI、项目，不必等比例放大财务动作。
- `emotion_state` 主要影响 `volatility` 和 `recovery`。

### 10.2 慢变量

慢变量短期变化不强，但长期影响斜率和低点。

| 因子 ID | 慢变量作用 |
| --- | --- |
| `reading_time` | 提升认知增量和知识复利 |
| `deep_study` | 提升自我能力和长期就业/AI 曲线斜率 |
| `exercise_score` | 提升健康底盘和恢复速度 |
| `finance_action` | 提升资本复利和安全底盘 |
| `ai_depth` | 提升 AI 杠杆、认知增量和复利能力 |
| `work_completion` | 提升就业底盘和总曲线低点 |

慢变量更新建议：

- 使用较小单日权重。
- 使用更明显的连续奖励。
- 使用更平滑的趋势计算。
- 主要影响 `slope`、`recovery`、`safety_floor` 和 `compounding_power`。

## 11. 曲线参数映射

| 中间因子 | 主要影响参数 | 说明 |
| --- | --- | --- |
| `cognitive_growth` | `slope` | 提高长期成长速度 |
| `execution_power` | `slope`, `recovery` | 提高落地能力和修复能力 |
| `leverage_level` | `slope`, `jumpProbability` | 提高放大效应和跃迁概率 |
| `opportunity_density` | `jumpProbability`, `volatility` | 机会更多，但波动也可能更高 |
| `safety_floor` | `recovery`, `volatility` | 提高低点，降低回撤 |
| `recovery_rate` | `recovery` | 提高下跌后的修复能力 |
| `compounding_power` | `slope` | 提高长期斜率 |
| `risk_exposure` | `volatility`, `recovery` | 提高波动，削弱恢复 |

## 12. V1 高优先级规则

V1 优先实现以下 5 个高权重因子：

| 因子 ID | 原因 | 核心影响 |
| --- | --- | --- |
| `ai_depth` | 质量高于时长，是 AI 曲线和长期复利关键 | `leverage_level`, `cognitive_growth`, `compounding_power` |
| `project_progress` | 对总曲线短期和长期都强 | `execution_power`, `opportunity_density`, `jumpProbability` |
| `sleep_duration` | 全部收益的基础乘数 | `recovery_rate`, `safety_floor`, `risk_exposure` |
| `focus_score` | 学习、AI、项目收益放大器 | `execution_power`, `leverage_level` |
| `work_completion` | 稳定底盘核心 | `safety_floor`, `employment` |

## 13. 解释输出规则

规则引擎每次计算后应输出解释项。

解释项来源：

- 当日最高正向贡献因子。
- 当日最高负向拖累因子。
- 变化最大的实体。
- 最弱的中间因子。
- 曲线参数中变化最大的项。

建议解释优先级：

| 优先级 | 触发条件 | 示例方向 |
| --- | --- | --- |
| 高 | 危险区因子、明显拖累总曲线 | 睡眠不足正在削弱全部收益 |
| 中 | 中间因子持续偏低 | 机会密度偏低，需要更多输出或项目推进 |
| 中 | 连续奖励触发 | 连续项目推进正在提高跃迁概率 |
| 低 | 普通正向变化 | 阅读和深度学习正在增加认知增量 |

## 14. 规则扩展原则

新增规则时遵循：

- 优先新增行为因子，而不是新增主曲线。
- 行为因子必须声明影响实体、中间因子和曲线。
- 每个因子必须有正向规则和负向规则。
- 每个因子必须定义分档阈值。
- 修改规则时必须同步检查解释输出。
- 规则表优先，避免把权重和阈值散落在页面组件中。

