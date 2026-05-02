# Life Curve Engine 系统架构

## 1. 文档目的

本文档提炼 Life Curve Engine V1 的系统架构，不重复产品定义。

它用于回答：

- 系统分几层。
- 数据如何从行为输入流向曲线与解释。
- 页面和代码模块如何拆分。
- 后续新增能力应接入哪里。

产品定位、目标用户、核心输出定义以 `docs/life-curve-engine-v1-spec.md` 为准。

## 2. 总体架构

Life Curve Engine 的核心架构是一个规则驱动的数据流系统。

```text
行为输入
→ 规则引擎
→ 实体更新
→ 中间因子更新
→ 曲线参数更新
→ 曲线重绘
→ 解释输出
```

系统不允许行为直接修改复合总曲线。所有行为都必须通过实体、中间因子和曲线参数间接影响最终曲线。

## 3. 系统分层

### 3.1 行为层

行为层负责接收用户每日输入。

V1 首发 12 个行为因子：

- `ai_hours`
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
- `emotion_state`

行为层职责：

- 定义输入项和输入格式。
- 校验输入值。
- 将原始输入标准化为规则引擎可处理的行为分数。
- 保存每日原始输入，便于后续复盘和重新计算。

建议模块：

- `src/types/behavior.ts`
- `src/engine/behaviorScoring.ts`
- `src/data/mockDailyInputs.ts`

### 3.2 主体/实体层

主体/实体层表示人生中值得长期投入和观察的对象。

V1 固定 7 个实体：

| 实体 ID | 名称 | 主要含义 |
| --- | --- | --- |
| `self_core` | 自我能力体 | 认知、技能、执行力、表达力 |
| `employment` | 传统就业体 | 学业、实习、工作、安全底盘 |
| `ai_system` | AI 协作体 | AI 协作、自动化、知识沉淀、杠杆 |
| `venture` | 项目/创业体 | 项目推进、输出、副业、跃迁机会 |
| `capital` | 资本复利体 | 储蓄、投资、安全垫、抗风险能力 |
| `health` | 健康体 | 睡眠、运动、恢复、精力、稳定性 |
| `knowledge` | 知识积累体 | 阅读、学习、笔记、知识复利 |

实体层职责：

- 接收行为分数的影响。
- 维护实体当前分数和趋势。
- 为中间因子提供更稳定的状态输入。
- 避免单日行为直接造成过度曲线波动。

建议模块：

- `src/types/entity.ts`
- `src/engine/entityUpdater.ts`
- `src/components/entities/`

### 3.3 中间因子层

中间因子层是行为与曲线之间的解释性桥梁。

V1 维护 8 个中间因子：

| 中间因子 ID | 名称 | 作用 |
| --- | --- | --- |
| `cognitive_growth` | 认知增量 | 影响长期学习、判断质量和能力增长 |
| `execution_power` | 执行力 | 影响任务完成、项目推进和输出能力 |
| `leverage_level` | 杠杆强度 | 影响 AI、工具、系统化带来的放大效果 |
| `opportunity_density` | 机会密度 | 影响项目机会、外部反馈和跃迁概率 |
| `safety_floor` | 安全底盘 | 影响低点、回撤承受力和稳定性 |
| `recovery_rate` | 恢复速度 | 影响下跌后的修复能力和持续行动力 |
| `compounding_power` | 复利能力 | 影响知识、资本、系统积累的长期斜率 |
| `risk_exposure` | 风险暴露度 | 影响波动、回撤概率和短期失控风险 |

中间因子层职责：

- 汇总多个行为和实体的影响。
- 将行为影响翻译成可解释的内部变量。
- 为曲线参数提供输入。
- 为解释层提供“为什么变化”的依据。

建议模块：

- `src/types/intermediate.ts`
- `src/engine/intermediateUpdater.ts`

### 3.4 曲线层

曲线层负责生成基础曲线和复合总曲线。

V1 曲线包括：

- 传统就业曲线。
- AI 协作曲线。
- 项目/创业脉冲曲线。
- 资本复利曲线。
- 健康/稳定性支撑曲线。
- 复合总曲线。

曲线层关注 4 类参数：

| 参数 | 含义 |
| --- | --- |
| `slope` | 长期增长速度 |
| `volatility` | 短期波动程度 |
| `recovery` | 回撤后的恢复能力 |
| `jumpProbability` | 非线性跃迁机会概率 |

曲线层职责：

- 根据实体和中间因子更新曲线参数。
- 生成可绘制的 `CurvePoint[]`。
- 识别关键高点和关键低点。
- 判断是否满足“每个低点高于前一个低点”。
- 支持模拟器生成临时曲线，不污染真实历史数据。

建议模块：

- `src/types/curve.ts`
- `src/engine/curveGenerator.ts`
- `src/engine/simulation.ts`
- `src/components/curves/`

### 3.5 解释层

解释层负责把规则引擎和曲线变化翻译成用户能理解的反馈。

解释层输出：

- 为什么涨了。
- 为什么跌了。
- 哪个行为最影响曲线。
- 哪个中间因子最弱。
- 当前最重要的拖累因子。
- 当前最值得提升的因子。
- 未来 7 天建议。
- 未来 30 天建议。

解释层职责：

- 从行为分数、实体变化、中间因子变化和曲线参数变化中提取原因。
- 将原因转换为 `ExplanationItem[]`。
- 按严重程度和影响权重排序。
- 生成短、清晰、可行动的建议。

建议模块：

- `src/types/explanation.ts`
- `src/engine/explanationGenerator.ts`
- `src/components/explanations/`

## 4. 数据流

### 4.1 主流程

```text
DailyBehaviorInput
→ BehaviorScore[]
→ EntityState[]
→ IntermediateFactorState[]
→ CurveParameters
→ CurvePoint[]
→ ExplanationItem[]
→ LifeCurveSnapshot
```

### 4.2 详细步骤

| 步骤 | 输入 | 输出 | 负责模块 |
| --- | --- | --- | --- |
| 行为输入 | 用户录入的 12 个因子 | `DailyBehaviorInput` | Daily Check-in 页面 |
| 规则引擎 | `DailyBehaviorInput`、历史记录 | `BehaviorScore[]` | `behaviorScoring.ts`, `rules.ts` |
| 实体更新 | `BehaviorScore[]`、上一期实体状态 | `EntityState[]` | `entityUpdater.ts` |
| 中间因子更新 | `BehaviorScore[]`、实体状态 | `IntermediateFactorState[]` | `intermediateUpdater.ts` |
| 曲线参数更新 | 实体状态、中间因子状态 | `CurveParameters` | `curveGenerator.ts` |
| 曲线重绘 | 曲线参数、历史快照 | `CurvePoint[]` | `curveGenerator.ts` |
| 解释输出 | 全链路变化数据 | `ExplanationItem[]` | `explanationGenerator.ts` |
| 快照保存 | 全部计算结果 | `LifeCurveSnapshot` | `storage/localStorage.ts` |

### 4.3 快照边界

每次每日输入提交后，系统应生成一个完整快照。

快照至少包含：

- 日期。
- 原始行为输入。
- 行为评分。
- 实体状态。
- 中间因子状态。
- 曲线参数。
- 曲线点。
- 解释输出。

快照是复盘、趋势、模拟对比和后续数据迁移的基础。

## 5. 页面与模块拆分

### 5.1 页面拆分

| 页面 | 路由建议 | 核心职责 | 主要依赖模块 |
| --- | --- | --- | --- |
| Dashboard 总览 | `/` | 今日人生势能、本周趋势、复合曲线、建议 | curve, explanation, storage |
| Daily Check-in | `/check-in` | 录入 12 个行为因子并触发计算 | behavior, rules, storage |
| 主体状态页 | `/entities` | 展示 7 个实体当前分数和趋势 | entity, explanation |
| 曲线页 | `/curves` | 展示基础曲线、复合曲线、高低点、安全/风险区 | curve |
| 解释页 | `/explanations` | 展示涨跌原因、拖累因子、提升因子 | explanation, intermediate |
| 模拟器页 | `/simulation` | 调整关键因子并即时查看曲线变化 | simulation, curve, rules |

### 5.2 代码模块拆分

```text
src/
  app/
    page.tsx
    check-in/page.tsx
    entities/page.tsx
    curves/page.tsx
    explanations/page.tsx
    simulation/page.tsx
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

### 5.3 模块依赖方向

建议依赖方向：

```text
app/pages
→ components
→ engine/storage
→ types/data
```

规则：

- 页面可以组合组件，但不要直接写规则计算。
- 组件可以展示数据和触发事件，但不要直接操作 `localStorage`。
- 规则计算集中在 `engine/`。
- 存储读写集中在 `storage/`。
- 类型集中在 `types/`。

## 6. 本地存储边界

V1 使用 `localStorage`，不接数据库。

存储 key：

| Key | 内容 |
| --- | --- |
| `lifeCurve.dailyInputs` | 每日行为输入记录 |
| `lifeCurve.snapshots` | 每日计算后的快照 |
| `lifeCurve.settings` | 用户偏好和规则参数 |

设计要求：

- 所有本地存储读写集中在 `src/storage/localStorage.ts`。
- 页面和组件不直接操作浏览器存储。
- 存储数据必须带版本字段。
- 后续如果接数据库，只替换 storage 层，不重写规则引擎。

## 7. 模拟器架构

模拟器应复用规则引擎，但与真实历史数据隔离。

模拟流程：

```text
当前快照
→ 用户调整部分行为因子
→ 构造临时 DailyBehaviorInput
→ 运行同一套规则引擎
→ 生成模拟曲线
→ 展示与当前曲线的差异
```

要求：

- 模拟结果不写入真实历史。
- 模拟器不要维护单独规则。
- 模拟器可以复用 `rules.ts`、`behaviorScoring.ts`、`curveGenerator.ts`。

## 8. 后续扩展原则

### 8.1 主曲线稳定

主曲线体系应保持稳定。新增能力不应优先变成新的主曲线。

可新增主曲线的条件：

- 已有主曲线无法表达该领域。
- 该领域对复合总曲线有长期稳定影响。
- 用户能直观看懂该曲线的含义。
- 不会破坏既有历史数据的可比性。

### 8.2 新增功能通过因子模块接入

新增能力优先作为行为因子或中间因子接入。

推荐扩展路径：

```text
新增输入
→ 新增/扩展行为因子
→ 补充规则映射
→ 影响既有实体和中间因子
→ 间接影响曲线参数
```

### 8.3 规则表优先于硬编码

行为因子的阈值、权重、影响对象、解释模板应尽量放在规则表中。

这样后续可以：

- 调整权重。
- 增加因子。
- 做用户个性化配置。
- 做 A/B 规则实验。

### 8.4 解释必须跟随规则变化

新增或修改规则时，必须同步检查解释输出。

系统不能只改变曲线，却无法解释变化原因。

