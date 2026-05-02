# Life Curve Engine V1 开发规格文档

## 1. 项目定位

### 1.1 项目名称

Life Curve Engine（人生曲线引擎）

### 1.2 一句话定义

Life Curve Engine 是一个面向大学生和年轻职场人的、可长期使用的人生资源配置模拟器。

它通过记录日常行为与关键决策，把这些输入映射为若干主体/实体的状态变化，再生成一条可解释的人生复合曲线，帮助用户更好地掌控人生、正确投资人生。

### 1.3 核心理念

本产品不是算命，也不是固定预测人生。

它的核心链路是：

```text
定义人生中值得长期投入的主体/实体
→ 定义每天的行为因子
→ 行为因子影响中间变量
→ 中间变量改变曲线参数
→ 曲线参数生成人生走势
→ 用户持续观察“我的行为如何改变人生曲线”
```

产品要帮助用户理解：人生曲线不是一次性被决定的，而是由长期行为、资源配置和关键决策共同塑造的。

## 2. 目标用户

### 2.1 第一版用户

V1 面向 18-30 岁大学生和刚进入社会的年轻人。

典型特征：

- 有主线任务，例如学业、求职、实习、工作。
- 想借助 AI、学习、项目、健康管理来改变人生走势。
- 愿意长期记录和观察自己的行为。
- 希望获得人生资源配置建议，而不是鸡汤。

### 2.2 使用场景

- 每天更新行为记录。
- 每周查看趋势变化。
- 每月复盘人生曲线变化。
- 做决策模拟：如果我多做 X、少做 Y，未来走势会怎样。

## 3. 产品目标与非目标

### 3.1 V1 产品目标

V1 需要做到：

- 建立一套稳定的主体/实体模型。
- 建立一套可扩展的行为因子系统。
- 支持每天录入关键行为。
- 把行为映射成中间因子变化。
- 生成几条基础曲线和一条复合总曲线。
- 给出可解释的变化原因。
- 支持简单的决策模拟。

### 3.2 V1 非目标

V1 暂不做：

- 真正意义上的精确人生预测。
- 复杂金融建模。
- 医疗级健康评估。
- 全自动抓取所有外部数据。
- 多用户社交系统。
- 移动端完整 App。

## 4. 核心产品原则

### 4.1 主曲线少而稳

主曲线体系不应频繁变化。V1 应优先验证少量稳定曲线，而不是不断新增主线。

### 4.2 因子多而可插拔

新功能优先做成因子模块，不要一开始做成新的主曲线。行为因子和规则表应支持扩展。

### 4.3 行为不直接改总曲线

行为必须通过完整链路影响曲线：

```text
行为 → 实体 → 中间因子 → 曲线参数 → 曲线变化
```

### 4.4 解释优先

系统必须告诉用户：

- 为什么涨了。
- 为什么跌了。
- 哪个因子拖后腿。
- 哪个因子最值得提升。

### 4.5 长期使用优先

所有数据结构都要为持续记录、持续调优、长期复盘设计。

## 5. 核心输出定义

### 5.1 纵轴定义

主纵轴定义为：

```text
人生势能指数 = 生存安全 + 上升空间 的综合指数
```

它不是收入，也不是情绪，而是一个综合值，用来表示：

- 当前和未来一段时间的安全底盘。
- 长期成长潜力。
- 跃迁机会。
- 回撤风险。

### 5.2 关键输出

系统至少输出：

- 基础曲线。
- 复合总曲线。
- 关键低点。
- 关键高点。
- 是否满足“每个低点高于前一个低点”。
- 当前最重要的拖累因子。
- 当前最值得提升的因子。
- 未来 7 天建议。
- 未来 30 天建议。

## 6. 主体/实体模型

V1 固定 7 个主体/实体。

| 实体 ID | 名称 | 含义 |
| --- | --- | --- |
| `self_core` | 自我能力体 | 认知、技能、执行力、表达力 |
| `employment` | 传统就业体 | 学业成绩、实习、工作表现、组织平台、稳定收入、安全底盘 |
| `ai_system` | AI 协作体 | AI 协作时长、深度、质量、自动化能力、知识沉淀能力、AI 杠杆程度 |
| `venture` | 项目/创业体 | 项目推进、真实输出、副业尝试、创业脉冲、非线性跃迁机会 |
| `capital` | 资本复利体 | 储蓄、投资、安全垫、被动收入趋势、抗风险能力 |
| `health` | 健康体 | 睡眠、运动、恢复、精力、稳定性 |
| `knowledge` | 知识积累体 | 阅读、学习、笔记、长期知识复利、判断质量 |

## 7. 曲线体系

V1 使用 5 条基础曲线和 1 条复合曲线。

### 7.1 基础曲线

- 传统就业曲线。
- AI 协作曲线。
- 项目/创业脉冲曲线。
- 资本复利曲线。
- 健康/稳定性支撑曲线。

健康/稳定性曲线可以在 UI 中默认不单独展示，但必须作为总曲线支撑项参与计算。

### 7.2 复合总曲线

复合总曲线综合所有主体与因子的结果，输出最终人生势能走势。

## 8. 行为因子

V1 首发 12 个行为因子，先保证系统能跑通。

| 因子 ID | 名称 | 建议输入 |
| --- | --- | --- |
| `ai_hours` | AI 协作时长 | 小时数 |
| `ai_depth` | AI 协作深度 | 1-5 分 |
| `reading_time` | 阅读时长 | 分钟数 |
| `deep_study` | 深度学习时长 | 小时数 |
| `project_progress` | 项目推进度 | 0-100 或 1-5 分 |
| `output_count` | 输出次数 | 次数 |
| `sleep_duration` | 睡眠时长 | 小时数 |
| `exercise_score` | 运动得分 | 0-100 或 1-5 分 |
| `focus_score` | 专注度 | 0-100 或 1-5 分 |
| `work_completion` | 学业/工作完成度 | 0-100 |
| `finance_action` | 储蓄/投资动作 | 0/1 或金额/等级 |
| `emotion_state` | 情绪状态 | -2 到 +2 或 1-5 分 |

## 9. 中间因子

中间因子是系统内部变量，不一定全部对用户可见，但规则引擎必须维护。

| 中间因子 ID | 名称 | 含义 |
| --- | --- | --- |
| `cognitive_growth` | 认知增量 | 学习、阅读、复盘带来的认知增长 |
| `execution_power` | 执行力 | 行为落地和任务完成能力 |
| `leverage_level` | 杠杆强度 | AI、工具、系统化输出带来的放大能力 |
| `opportunity_density` | 机会密度 | 项目、输出、协作带来的机会暴露 |
| `safety_floor` | 安全底盘 | 学业/就业、资本、健康形成的下限 |
| `recovery_rate` | 恢复速度 | 睡眠、运动、情绪带来的恢复能力 |
| `compounding_power` | 复利能力 | 知识、资本、系统积累的复利强度 |
| `risk_exposure` | 风险暴露度 | 健康、财务、情绪、任务失控导致的风险 |

## 10. 行为因子影响映射

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

## 11. 正负向规则系统

### 11.1 因子分档

每个因子统一分为 4 档：

- 危险区。
- 普通区。
- 良好区。
- 优秀区。

### 11.2 因子作用类型

每个因子统一具有 4 类作用：

- 即时加成。
- 即时惩罚。
- 连续积累加成。
- 中断衰减惩罚。

### 11.3 统一状态值

建议每个因子每天输出一个标准化状态值：

| 状态值 | 含义 |
| --- | --- |
| `-2` | 危险 |
| `-1` | 偏低 |
| `0` | 普通 |
| `+1` | 良好 |
| `+2` | 优秀 |

最终得分需要叠加：

- 连续天数修正。
- 中断衰减修正。
- 边际递减修正。

### 11.4 开发优先级最高的 5 个规则

V1 优先高权重实现：

- `ai_depth`：AI 协作深度。
- `project_progress`：项目推进度。
- `sleep_duration`：睡眠时长。
- `focus_score`：专注度。
- `work_completion`：学业/工作完成度。

## 12. 规则引擎逻辑

### 12.1 核心链路

```text
Daily Behavior Input
→ Behavior Score
→ Entity Update
→ Intermediate Factor Update
→ Curve Parameter Update
→ Curve Re-render
→ Explanation Output
```

### 12.2 核心曲线参数

所有行为最终尽量影响以下四类曲线参数：

| 参数 | 含义 |
| --- | --- |
| `slope` | 曲线斜率，表示长期增长速度 |
| `volatility` | 波动，表示短期不稳定性 |
| `recovery` | 恢复，表示下跌后的修复能力 |
| `jumpProbability` | 跃迁概率，表示非线性机会出现概率 |

### 12.3 V1 计算策略

V1 不追求精确公式，先做规则型引擎。

需要支持：

- 基础分。
- 连续奖励。
- 中断衰减。
- 因子联动。
- 上限控制。
- 边际递减。

## 13. TypeScript 数据模型

### 13.1 主体/实体

```ts
export type EntityId =
  | "self_core"
  | "employment"
  | "ai_system"
  | "venture"
  | "capital"
  | "health"
  | "knowledge";

export type EntityState = {
  id: EntityId;
  score: number; // 0-100
  trend: number; // -1 ~ 1
  updatedAt: string;
};
```

### 13.2 行为因子

```ts
export type BehaviorFactorId =
  | "ai_hours"
  | "ai_depth"
  | "reading_time"
  | "deep_study"
  | "project_progress"
  | "output_count"
  | "sleep_duration"
  | "exercise_score"
  | "focus_score"
  | "work_completion"
  | "finance_action"
  | "emotion_state";

export type DailyBehaviorInput = {
  date: string;
  values: Record<BehaviorFactorId, number | string>;
};
```

### 13.3 中间因子

```ts
export type IntermediateFactorId =
  | "cognitive_growth"
  | "execution_power"
  | "leverage_level"
  | "opportunity_density"
  | "safety_floor"
  | "recovery_rate"
  | "compounding_power"
  | "risk_exposure";

export type IntermediateFactorState = {
  id: IntermediateFactorId;
  score: number; // 0-100
  trend: number;
};
```

### 13.4 曲线点

```ts
export type CurvePoint = {
  dayIndex: number;
  employment: number;
  ai: number;
  venture: number;
  capital: number;
  health: number;
  composite: number;
};
```

### 13.5 解释输出

```ts
export type ExplanationItem = {
  title: string;
  summary: string;
  severity: "info" | "positive" | "warning" | "critical";
  relatedFactors: string[];
};
```

### 13.6 建议补充类型

```ts
export type CurveParameters = {
  slope: number;
  volatility: number;
  recovery: number;
  jumpProbability: number;
};

export type BehaviorScore = {
  factorId: BehaviorFactorId;
  rawValue: number | string;
  normalizedScore: -2 | -1 | 0 | 1 | 2;
  streakModifier: number;
  decayModifier: number;
  diminishingModifier: number;
  finalScore: number;
};

export type LifeCurveSnapshot = {
  date: string;
  entities: EntityState[];
  intermediateFactors: IntermediateFactorState[];
  curveParameters: CurveParameters;
  curvePoints: CurvePoint[];
  explanations: ExplanationItem[];
};
```

## 14. 页面设计

### 14.1 Dashboard 总览页

展示：

- 今日人生势能。
- 本周趋势。
- 当前复合曲线。
- 关键拖累因子。
- 关键提升因子。
- 今日建议。

### 14.2 Daily Check-in 每日输入页

用户录入 12 个行为因子。

要求：

- 输入项要轻量，适合每天使用。
- 每个输入项要能显示简短解释。
- 提交后立即更新本地状态和曲线。

### 14.3 主体状态页

展示 7 个主体/实体当前状态。

每个实体至少展示：

- 当前分数。
- 趋势。
- 最近主要影响因子。
- 简短建议。

### 14.4 曲线页

展示：

- 基础曲线。
- 复合曲线。
- 关键低点。
- 关键高点。
- 安全区。
- 风险区。

### 14.5 解释页

展示：

- 为什么涨了。
- 为什么跌了。
- 哪个行为最影响曲线。
- 哪个中间因子最弱。

### 14.6 模拟器页

用户可以调整：

- AI 时长。
- 阅读时长。
- 睡眠。
- 项目推进。
- 财务动作。

调整后即时查看模拟曲线变化。

## 15. 技术栈

V1 推荐技术栈：

- Next.js。
- TypeScript。
- Tailwind CSS。
- Recharts。
- 本地 state/localStorage。

V1 暂不接：

- 数据库。
- LLM API。
- 复杂后端服务。

## 16. 开发阶段

### Phase 1：静态前端 + Mock 规则

目标：

- 页面跑起来。
- 输入表单跑起来。
- 曲线能画出来。
- 简单规则能更新状态。

### Phase 2：规则引擎化

目标：

- 把行为因子映射表代码化。
- 把正负向规则表代码化。
- 支持连续天数和衰减。
- 支持解释输出。

### Phase 3：本地持久化

目标：

- 保存每日记录。
- 查看历史趋势。
- 支持周/月回顾。

### Phase 4：模拟器增强

目标：

- 支持多方案对比。
- 支持如果/那么模拟。
- 支持关键变量敏感性分析。

### Phase 5：AI 增强

目标：

- 让用户用自然语言补全每日记录。
- 用 AI 生成解释和建议。
- 后续再考虑自动读取更多数据。

## 17. Codex 交付顺序

Codex 开发时请按以下顺序交付：

1. 项目目录结构。
2. 类型定义。
3. Mock 数据。
4. 行为因子规则表。
5. 实体/中间因子更新函数。
6. 曲线生成逻辑。
7. Dashboard 页面。
8. Daily Check-in 页面。
9. Curve 页面。
10. Explanation 页面。
11. Simulation 页面。
12. 本地存储方案。
13. 后续扩展点说明。

## 18. 建议项目目录结构

```text
life/
  docs/
    life-curve-engine-v1-spec.md
  src/
    app/
      page.tsx
      check-in/
        page.tsx
      entities/
        page.tsx
      curves/
        page.tsx
      explanations/
        page.tsx
      simulation/
        page.tsx
    components/
      dashboard/
      check-in/
      curves/
      entities/
      explanations/
      simulation/
      ui/
    data/
      mockDailyInputs.ts
      mockSnapshots.ts
    engine/
      behaviorScoring.ts
      curveGenerator.ts
      entityUpdater.ts
      explanationGenerator.ts
      intermediateUpdater.ts
      rules.ts
      simulation.ts
    storage/
      localStorage.ts
    types/
      behavior.ts
      curve.ts
      entity.ts
      explanation.ts
      intermediate.ts
      snapshot.ts
```

## 19. 本地存储方案

V1 使用 `localStorage`，按以下 key 管理：

| Key | 内容 |
| --- | --- |
| `lifeCurve.dailyInputs` | 每日行为输入记录 |
| `lifeCurve.snapshots` | 每日计算后的快照 |
| `lifeCurve.settings` | 用户偏好和规则参数 |

本地存储要求：

- 读写函数集中放在 `src/storage/localStorage.ts`。
- 所有存储数据必须有版本字段，方便后续迁移。
- 页面不要直接操作 `localStorage`，必须通过 storage 层。

建议数据结构：

```ts
export type VersionedStorage<T> = {
  version: 1;
  updatedAt: string;
  data: T;
};
```

## 20. 后续扩展点

V1 之后可以扩展：

- 增加行为因子，但不轻易增加主曲线。
- 增加规则配置面板。
- 增加周/月复盘报告。
- 增加自然语言输入。
- 增加 AI 解释生成。
- 增加数据导入/导出。
- 增加多方案长期模拟。
- 增加 Obsidian、日历、任务系统等外部数据源。

## 21. 验收标准

V1 初版完成时应满足：

- 用户可以完成一次每日输入。
- 输入后实体状态会变化。
- 输入后中间因子会变化。
- 输入后基础曲线和复合曲线会刷新。
- 系统能解释至少 3 条变化原因。
- 系统能指出当前最重要的拖累因子。
- 系统能指出当前最值得提升的因子。
- 用户可以在模拟器中调整关键因子并看到曲线变化。
- 刷新页面后历史输入仍然存在。

