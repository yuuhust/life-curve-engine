Life Curve Engine

Life Curve Engine 不是一个普通的打卡工具、待办工具或 AI 聊天外壳，而是一个面向大学生与年轻职场人的人生资源配置系统原型。
它尝试解决的核心问题是：一个人每天的行为输入、阶段策略与资源分配方式，如何转化为可计算、可解释、可模拟、可建议、可验证的长期走势系统。

What it is

这个项目将每日行为输入，例如：

AI 协作时长与深度
深度学习
项目推进
睡眠
运动
专注度
情绪状态
学业 / 工作完成度
输出次数
储蓄 / 投资动作

映射为：

实体状态
中间因子
多条基础曲线
复合总曲线
周 / 月复盘
单次 / 连续模拟
建议
行动计划
闭环验证
自然语言摘要

它不是在回答“今天做了什么”，而是在回答：

最近到底在变好还是变差
当前阶段最该优先投什么
哪个行为最值得连续 7 天测试
建议执行后到底有没有效果
Core system chain

Life Curve Engine 当前已经跑通的核心链路：

行为输入
→ 规则引擎
→ 实体 / 中间因子更新
→ 曲线 / 解释
→ 复盘 / 模拟
→ 建议
→ 行动计划
→ 闭环验证
→ 自然语言摘要

这意味着它不是一个一次性输出结果的 demo，而是一个已经具备
建议 → 执行 → 验证 → 校正 闭环能力的系统原型。

What makes it different from a normal demo

和普通 demo 最大的区别，不在页面多少，而在于它已经形成了明确分层：

规则层：负责事实判断与计算
阶段模式层：负责不同人生阶段下的权重与偏置
模拟层：负责单次与连续 N 天试算
建议层：负责修复项、强化项与实验项生成
计划层：负责把建议落地为轻量执行项
验证层：负责判断建议执行后是否 truly effective
自然语言层：只负责表达、润色和陪跑感

这里的 AI 不是黑箱判断器，而是被严格限制在表达层：
只读取结构化事实，不参与评分、阈值、建议排序或闭环验证。

Current capabilities

当前已经完成的核心能力包括：

配置化规则引擎
行为分档
连续奖励与中断衰减
实体状态与中间因子更新
多条基础曲线与复合曲线
单次模拟与连续 N 天模拟
周 / 月复盘
建议生成
行动计划
闭环验证
阶段模式系统
自然语言摘要层
Demo 展示工作台
README、架构图与工作流图
Stage modes

当前已支持的阶段模式包括：

balanced
academic
career
venture
health_recovery
ai_leverage

这些模式不是文案标签，而是会真实影响：

复合分数权重
建议排序偏置
复盘重点
默认曲线展示焦点

也就是说，同一组行为数据，在不同阶段下会得到不同的策略解释和行动优先级。

Demo scenarios

项目已内置演示数据，便于公开展示：

academic demo：学业优先场景
venture demo：项目优先场景

首次无数据进入时可直接看到完整链路，也可以通过本地数据面板切换不同阶段故事。

Natural language layer

当前自然语言摘要层是一个独立 provider 架构：

输入：ReviewSummary、AdviceSummary、PlanValidationSummary、StageModeConfig
输出：
复盘摘要
建议摘要
执行提醒

当前默认使用模板型 provider，未来可以替换为真实 LLM provider，
而无需修改规则、分数、阈值和建议排序逻辑。

Tech stack
Next.js
TypeScript
Local state + localStorage
Vitest
Mermaid（文档图示）
Project structure
src/app/          页面入口
src/components/   工作台 UI 组件
src/data/         行为因子与 demo 数据
src/engine/       规则、曲线、复盘、建议、模拟、验证、摘要
src/hooks/        工作台状态编排
src/storage/      localStorage 读写与导出
src/types/        类型定义
docs/             产品、架构、规则、阶段模式、showcase 文档
Run locally
npm install
npm run dev

默认地址：

http://localhost:3000

常用校验命令：

npm run typecheck
npm run test
npm run build
Current boundaries

当前版本刻意保持这些边界：

使用本地 state 与 localStorage
不接数据库
不接真实 LLM 参与规则判断
AI 不参与评分、阈值、建议排序、闭环验证
暂不支持阶段自动切换
暂不支持复杂多方案系统
暂不做社交、多用户、完整移动端 App
Why this project matters

Life Curve Engine 想证明的一件事是：

“人生资源配置”不是内容问题，而是可以被产品化、系统化、可验证化的问题。

这个项目的价值，不在于“生成了多少文字”，而在于它已经初步证明：
个体长期成长、阶段切换、建议执行与效果验证，可以被统一纳入一套规则驱动、阶段感知、表达层可扩展的系统中。

Roadmap
增强展示版与说明文档
扩展多方案对比模拟
引入真实 LLM provider 作为自然语言表达层
增强历史分析与长期数据能力
在不破坏规则内核的前提下，逐步走向更完整的个人系统原型
