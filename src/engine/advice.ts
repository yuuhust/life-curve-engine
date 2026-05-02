import type { ActionPlanItem, AdviceItem, AdviceSummary, PlanStatus } from "@/types/advice";
import type { BehaviorFactorId } from "@/types/behavior";
import type { ReviewMetric, ReviewSummary } from "@/types/review";
import type { ContinuousSimulationResult } from "@/types/simulation";
import type { LifeCurveSnapshot } from "@/types/snapshot";
import type { StageModeConfig } from "@/types/stageMode";
import { behaviorFactorLabels } from "./labels";

const fallbackExperimentFactor: BehaviorFactorId = "project_progress";

export function generateAdviceSummary({
  continuousSimulation,
  currentSnapshot,
  review,
  stageMode
}: {
  continuousSimulation?: ContinuousSimulationResult;
  currentSnapshot?: LifeCurveSnapshot;
  review: ReviewSummary;
  stageMode?: StageModeConfig;
}): AdviceSummary {
  return {
    repair: buildRepairAdvice(review, currentSnapshot, stageMode),
    reinforce: buildReinforceAdvice(review, stageMode),
    experiment: buildExperimentAdvice(review, continuousSimulation, stageMode)
  };
}

function buildRepairAdvice(
  review: ReviewSummary,
  currentSnapshot?: LifeCurveSnapshot,
  stageMode?: StageModeConfig
): AdviceItem {
  const decay = review.trend.continuousDecay[0];
  const entity = review.weekly.biggestDragEntity ?? review.monthly.biggestDragEntity;
  const intermediate =
    review.weekly.biggestDragIntermediate ?? review.monthly.biggestDragIntermediate;
  const factor = chooseFactorByStageMode(
    [decay?.id, inferRepairFactor(intermediate?.id)],
    stageMode?.adviceBias.repair,
    stageMode?.behaviorPriorities
  );
  const composite = currentSnapshot?.compositeScore;

  return {
    kind: "repair",
    title: `优先修复：${entity?.label ?? intermediate?.label ?? behaviorFactorLabels[factor]}`,
    summary: `${entity?.label ?? "当前实体"}和${intermediate?.label ?? "中间因子"}是近期主要拖累，先用 ${behaviorFactorLabels[factor]} 做低成本修复。${composite ? `当前复合分数为 ${composite.toFixed(1)}，修复项优先保护下限。` : ""}`,
    actionGoal: buildActionGoal(factor, "repair"),
    successCriteria: buildSuccessCriteria(factor, "repair"),
    relatedFactors: [factor],
    evidence: compactEvidence([
      entity ? `最大拖累实体：${entity.label} ${formatMetric(entity)}` : undefined,
      intermediate ? `最大拖累中间因子：${intermediate.label} ${formatMetric(intermediate)}` : undefined,
      decay ? `连续衰减：${decay.label} ${formatMetric(decay)}` : undefined
    ])
  };
}

function buildReinforceAdvice(review: ReviewSummary, stageMode?: StageModeConfig): AdviceItem {
  const inertia = review.trend.positiveInertia[0];
  const strongest = review.weekly.strongestPositiveBehavior ?? review.monthly.strongestPositiveBehavior;
  const factor = chooseFactorByStageMode(
    [inertia?.id, strongest?.id, "ai_depth"],
    stageMode?.adviceBias.reinforce,
    stageMode?.behaviorPriorities
  );

  return {
    kind: "reinforce",
    title: `优先强化：${behaviorFactorLabels[factor]}`,
    summary: `${behaviorFactorLabels[factor]}已经显示出正向贡献，继续强化它比临时增加新方向更稳。`,
    actionGoal: buildActionGoal(factor, "reinforce"),
    successCriteria: buildSuccessCriteria(factor, "reinforce"),
    relatedFactors: [factor],
    evidence: compactEvidence([
      inertia ? `正向惯性：${inertia.label} ${formatMetric(inertia)}` : undefined,
      strongest ? `最强正向行为：${strongest.label} ${formatMetric(strongest)}` : undefined,
      review.trend.strongestChainEffect?.summary
    ])
  };
}

function buildExperimentAdvice(
  review: ReviewSummary,
  continuousSimulation?: ContinuousSimulationResult,
  stageMode?: StageModeConfig
): AdviceItem {
  const simulatedFactor = continuousSimulation?.input.factorId;
  const factor = chooseFactorByStageMode(
    [simulatedFactor, review.trend.positiveInertia[0]?.id, fallbackExperimentFactor],
    stageMode?.adviceBias.experiment,
    stageMode?.behaviorPriorities
  );
  const simulationEvidence = continuousSimulation
    ? `连续 ${continuousSimulation.days} 天模拟（${behaviorFactorLabels[continuousSimulation.input.factorId]}）：${continuousSimulation.beforeComposite.toFixed(1)} → ${continuousSimulation.afterComposite.toFixed(1)}（${formatDelta(continuousSimulation.delta)}）`
    : undefined;

  return {
    kind: "experiment",
    title: `连续 7 天测试：${behaviorFactorLabels[factor]}`,
    summary: continuousSimulation
      ? `连续模拟显示 ${behaviorFactorLabels[factor]} 对复合分数的影响为 ${formatDelta(continuousSimulation.delta)}，值得用 7 天真实记录验证。`
      : `建议先用 ${behaviorFactorLabels[factor]} 做 7 天连续测试，观察它是否带动实体、中间因子和复合曲线同步改善。`,
    actionGoal: buildActionGoal(factor, "experiment"),
    successCriteria: buildSuccessCriteria(factor, "experiment"),
    relatedFactors: [factor],
    evidence: compactEvidence([
      simulationEvidence,
      continuousSimulation?.biggestEntityChange
        ? `模拟影响实体：${continuousSimulation.biggestEntityChange.label} ${formatDelta(continuousSimulation.biggestEntityChange.delta)}`
        : undefined,
      continuousSimulation?.biggestIntermediateChange
        ? `模拟影响中间因子：${continuousSimulation.biggestIntermediateChange.label} ${formatDelta(continuousSimulation.biggestIntermediateChange.delta)}`
        : undefined
    ])
  };
}

function chooseFactorByStageMode(
  candidates: Array<BehaviorFactorId | undefined>,
  bias: BehaviorFactorId[] = [],
  priorities: BehaviorFactorId[] = []
): BehaviorFactorId {
  const validCandidates = candidates.filter((item): item is BehaviorFactorId => Boolean(item));
  const orderedPreferences = [...bias, ...priorities];
  const preferred = orderedPreferences.find((factor) => validCandidates.includes(factor));

  return preferred ?? bias[0] ?? validCandidates[0] ?? fallbackExperimentFactor;
}

export function createActionPlansFromAdvice(
  advice: AdviceSummary,
  statuses: Partial<Record<AdviceItem["kind"], PlanStatus>> = {}
): ActionPlanItem[] {
  return [advice.repair, advice.reinforce, advice.experiment].map((item) => ({
    id: item.kind,
    sourceKind: item.kind,
    title: item.title,
    actionGoal: item.actionGoal,
    successCriteria: item.successCriteria,
    status: statuses[item.kind] ?? "not_started",
    relatedFactors: item.relatedFactors,
    evidence: item.evidence
  }));
}

function inferRepairFactor(intermediateId?: string): BehaviorFactorId {
  switch (intermediateId) {
    case "recovery_rate":
    case "risk_exposure":
    case "safety_floor":
      return "sleep_duration";
    case "leverage_level":
    case "cognitive_growth":
    case "compounding_power":
      return "ai_depth";
    case "opportunity_density":
    case "execution_power":
      return "project_progress";
    default:
      return "sleep_duration";
  }
}

function buildActionGoal(factor: BehaviorFactorId, kind: AdviceItem["kind"]): string {
  if (kind === "experiment") {
    return `连续 7 天记录并稳定改善 ${behaviorFactorLabels[factor]}。`;
  }
  if (kind === "repair") {
    return `未来 3 天优先把 ${behaviorFactorLabels[factor]} 拉回普通区以上。`;
  }
  return `未来 7 天保持 ${behaviorFactorLabels[factor]} 的正向输入。`;
}

function buildSuccessCriteria(factor: BehaviorFactorId, kind: AdviceItem["kind"]): string {
  if (kind === "experiment") {
    return `7 天后复盘 ${behaviorFactorLabels[factor]} 是否带动 composite、实体或中间因子至少一项改善。`;
  }
  if (kind === "repair") {
    return `${behaviorFactorLabels[factor]} 不再触发连续衰减，相关拖累项停止继续下滑。`;
  }
  return `${behaviorFactorLabels[factor]} 继续贡献正向分数，并保持或增强 streak。`;
}

function compactEvidence(items: Array<string | undefined>): string[] {
  return items.filter((item): item is string => Boolean(item));
}

function formatMetric(metric: ReviewMetric<string>): string {
  return formatDelta(metric.value);
}

function formatDelta(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}`;
}
