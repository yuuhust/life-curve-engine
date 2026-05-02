import type { BehaviorScore } from "@/types/behavior";
import type { EntityState } from "@/types/entity";
import type { ExplanationItem } from "@/types/explanation";
import type { IntermediateFactorState } from "@/types/intermediate";

const factorLabels: Record<BehaviorScore["factorId"], string> = {
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

export function generateExplanations(
  scores: BehaviorScore[],
  entities: EntityState[],
  intermediateFactors: IntermediateFactorState[]
): ExplanationItem[] {
  const sorted = [...scores].sort((a, b) => b.finalScore - a.finalScore);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];
  const strongestEntity = [...entities].sort((a, b) => b.trend - a.trend)[0];
  const weakestEntity = [...entities].sort((a, b) => a.trend - b.trend)[0];
  const strongestFactor = [...intermediateFactors].sort((a, b) => b.trend - a.trend)[0];
  const weakestFactor = [...intermediateFactors].sort((a, b) => a.trend - b.trend)[0];
  const strongestStreak = scores
    .filter((score) => score.streakModifier > 0)
    .sort((a, b) => b.streakModifier - a.streakModifier)[0];
  const strongestDecay = scores
    .filter((score) => score.decayModifier < 0)
    .sort((a, b) => a.decayModifier - b.decayModifier)[0];
  const explanations: ExplanationItem[] = [];

  if (strongest.finalScore > 0) {
    explanations.push({
      title: `${factorLabels[strongest.factorId]}正在提供正向动能`,
      summary: `该因子今天处于 ${strongest.normalizedScore >= 2 ? "优秀" : "良好"} 区间，最终贡献为 ${formatSigned(strongest.finalScore)}。当前变化最明显的实体是 ${strongestEntity.label}（${formatSigned(strongestEntity.trend)}），中间因子是 ${strongestFactor.label}（${formatSigned(strongestFactor.trend)}）。`,
      severity: "positive",
      relatedFactors: [strongest.factorId]
    });
  }

  if (weakest.finalScore < 0) {
    explanations.push({
      title: `${factorLabels[weakest.factorId]}是当前主要拖累`,
      summary: `该因子今天低于期望，最终贡献为 ${formatSigned(weakest.finalScore)}。当前回落最明显的实体是 ${weakestEntity.label}（${formatSigned(weakestEntity.trend)}），中间因子是 ${weakestFactor.label}（${formatSigned(weakestFactor.trend)}）。`,
      severity: weakest.normalizedScore <= -2 ? "critical" : "warning",
      relatedFactors: [weakest.factorId]
    });
  }

  if (strongestStreak) {
    explanations.push({
      title: `${factorLabels[strongestStreak.factorId]}触发了连续积累`,
      summary: `历史记录显示该因子保持了连续正向状态，本次额外获得 ${formatSigned(strongestStreak.streakModifier)} 的连续奖励。`,
      severity: "positive",
      relatedFactors: [strongestStreak.factorId]
    });
  }

  if (strongestDecay) {
    explanations.push({
      title: `${factorLabels[strongestDecay.factorId]}触发了中断衰减`,
      summary: `历史记录显示该因子持续处于非正向状态，本次产生 ${formatSigned(strongestDecay.decayModifier)} 的衰减修正。`,
      severity: strongestDecay.decayModifier <= -0.25 ? "warning" : "info",
      relatedFactors: [strongestDecay.factorId]
    });
  }

  const sleep = scores.find((score) => score.factorId === "sleep_duration");
  const focus = scores.find((score) => score.factorId === "focus_score");

  if (sleep && sleep.finalScore < 0) {
    explanations.push({
      title: "睡眠正在影响全部收益",
      summary: "睡眠是基础乘数因子。睡眠落入低区间时，即使其他行为完成不错，实际收益也会被打折。",
      severity: "warning",
      relatedFactors: ["sleep_duration"]
    });
  }

  if (focus && focus.finalScore > 0) {
    explanations.push({
      title: "专注度提高了行动质量",
      summary: "专注度会放大学习、AI 协作和项目推进的收益，是今天值得继续保持的放大器。",
      severity: "positive",
      relatedFactors: ["focus_score"]
    });
  }

  if (!explanations.length) {
    explanations.push({
      title: "今天整体保持平稳",
      summary: "多数行为因子处于普通区间。下一步可以优先提升睡眠、专注度或项目推进度。",
      severity: "info",
      relatedFactors: []
    });
  }

  return explanations.slice(0, 4);
}

function formatSigned(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}`;
}
