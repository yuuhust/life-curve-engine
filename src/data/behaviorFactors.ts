import type { BehaviorFactorDefinition } from "@/types/behavior";

export const behaviorFactorDefinitions: BehaviorFactorDefinition[] = [
  {
    id: "ai_hours",
    label: "AI 协作时长",
    description: "今天实际使用 AI 协作解决问题、学习或产出的时间。",
    inputType: "number",
    min: 0,
    max: 8,
    step: 0.5,
    unit: "小时",
    defaultValue: 1
  },
  {
    id: "ai_depth",
    label: "AI 协作深度",
    description: "是否把 AI 用在推理、拆解、生成资产，而不只是浅层问答。",
    inputType: "scale",
    min: 1,
    max: 5,
    step: 1,
    defaultValue: 3
  },
  {
    id: "reading_time",
    label: "阅读时长",
    description: "今天用于严肃阅读或高质量信息输入的时间。",
    inputType: "number",
    min: 0,
    max: 180,
    step: 5,
    unit: "分钟",
    defaultValue: 20
  },
  {
    id: "deep_study",
    label: "深度学习时长",
    description: "不被打断地学习课程、技能或专业知识的时间。",
    inputType: "number",
    min: 0,
    max: 8,
    step: 0.5,
    unit: "小时",
    defaultValue: 1
  },
  {
    id: "project_progress",
    label: "项目推进度",
    description: "今天对真实项目、副业或作品集产生的推进。",
    inputType: "scale",
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 40
  },
  {
    id: "output_count",
    label: "输出次数",
    description: "今天完成的文章、代码、作品、复盘或公开表达次数。",
    inputType: "number",
    min: 0,
    max: 10,
    step: 1,
    unit: "次",
    defaultValue: 1
  },
  {
    id: "sleep_duration",
    label: "睡眠时长",
    description: "昨晚到今天的主要睡眠时长。",
    inputType: "number",
    min: 0,
    max: 12,
    step: 0.5,
    unit: "小时",
    defaultValue: 7.5
  },
  {
    id: "exercise_score",
    label: "运动得分",
    description: "今天运动或身体活动的质量。",
    inputType: "scale",
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 40
  },
  {
    id: "focus_score",
    label: "专注度",
    description: "今天完成重要任务时的专注质量。",
    inputType: "scale",
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 60
  },
  {
    id: "work_completion",
    label: "学业/工作完成度",
    description: "今天主线任务的完成情况。",
    inputType: "scale",
    min: 0,
    max: 100,
    step: 5,
    defaultValue: 70
  },
  {
    id: "finance_action",
    label: "储蓄/投资动作",
    description: "今天是否做了记账、储蓄、投资或降低风险的财务动作。",
    inputType: "scale",
    min: -2,
    max: 2,
    step: 1,
    defaultValue: 0
  },
  {
    id: "emotion_state",
    label: "情绪状态",
    description: "今天整体情绪状态，负数表示低落或失控。",
    inputType: "emotion",
    min: -2,
    max: 2,
    step: 1,
    defaultValue: 0
  }
];
