import type { BehaviorFactorId } from "@/types/behavior";
import type { CurveSeriesKey } from "@/types/curve";

export const behaviorFactorLabels: Record<BehaviorFactorId, string> = {
  ai_hours: "AI 协作时长",
  ai_depth: "AI 协作深度",
  reading_time: "阅读时长",
  deep_study: "深度学习",
  project_progress: "项目推进",
  output_count: "输出次数",
  sleep_duration: "睡眠时长",
  exercise_score: "运动",
  focus_score: "专注度",
  work_completion: "学业/工作完成度",
  finance_action: "储蓄/投资动作",
  emotion_state: "情绪状态"
};

export const curveLabels: Record<CurveSeriesKey, string> = {
  composite: "复合曲线",
  employment: "就业曲线",
  ai: "AI 曲线",
  venture: "项目曲线",
  capital: "资本曲线",
  health: "健康曲线"
};
