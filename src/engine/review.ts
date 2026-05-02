import type { BehaviorFactorId } from "@/types/behavior";
import type { EntityId } from "@/types/entity";
import type { IntermediateFactorId } from "@/types/intermediate";
import type { PeriodReview, ReviewMetric, ReviewSummary, ReviewWindow } from "@/types/review";
import type { LifeCurveSnapshot } from "@/types/snapshot";
import type { StageModeConfig } from "@/types/stageMode";
import { reviewConfig } from "./config";
import { behaviorFactorLabels, curveLabels } from "./labels";

export function generateReviewSummary(
  snapshots: LifeCurveSnapshot[],
  stageMode?: StageModeConfig
): ReviewSummary {
  const sorted = sortSnapshots(snapshots);

  return {
    weekly: generatePeriodReview(sorted, reviewConfig.weeklyWindow, stageMode),
    monthly: generatePeriodReview(sorted, reviewConfig.monthlyWindow, stageMode),
    trend: generateTrendExplanation(sorted, stageMode)
  };
}

function generatePeriodReview(
  snapshots: LifeCurveSnapshot[],
  days: ReviewWindow,
  stageMode?: StageModeConfig
): PeriodReview {
  const period = snapshots.slice(-days);
  const compositeAverage = period.length
    ? round(period.reduce((sum, snapshot) => sum + snapshot.compositeScore, 0) / period.length)
    : 0;
  const dragEntities = getTrendMetrics(
    period.flatMap((snapshot) => snapshot.entities),
    (item) => item.id,
    (item) => item.label,
    (item) => item.trend,
    "asc"
  );
  const dragIntermediates = getTrendMetrics(
    period.flatMap((snapshot) => snapshot.intermediateFactors),
    (item) => item.id,
    (item) => item.label,
    (item) => item.trend,
    "asc"
  );
  const positiveBehaviors = aggregateBehaviorModifier(period, "finalScore", "desc");
  const focusedDragEntity = pickPreferredMetric(dragEntities, getPreferredEntityIds(stageMode));
  const focusedDragIntermediate = pickPreferredMetric(
    dragIntermediates,
    getPreferredIntermediateIds(stageMode)
  );
  const focusedPositiveBehavior = pickPreferredMetric(
    positiveBehaviors,
    getPreferredBehaviorIds(stageMode)
  );

  return {
    days,
    snapshotCount: period.length,
    compositeAverage,
    biggestDragEntity: dragEntities[0],
    biggestDragIntermediate: dragIntermediates[0],
    strongestPositiveBehavior: positiveBehaviors[0],
    focusedDragEntity,
    focusedDragIntermediate,
    focusedPositiveBehavior,
    conclusion: buildPeriodConclusion(
      days,
      period.length,
      compositeAverage,
      focusedDragEntity,
      focusedDragIntermediate,
      focusedPositiveBehavior,
      stageMode
    )
  };
}

function generateTrendExplanation(
  snapshots: LifeCurveSnapshot[],
  stageMode?: StageModeConfig
): ReviewSummary["trend"] {
  const period = snapshots.slice(-reviewConfig.trendWindow);
  const preferredBehaviors = getPreferredBehaviorIds(stageMode);
  const positiveInertia = prioritizeMetrics(
    aggregateBehaviorModifier(period, "streakModifier", "desc"),
    preferredBehaviors
  ).slice(0, 3);
  const continuousDecay = prioritizeMetrics(
    aggregateBehaviorModifier(period, "decayModifier", "asc"),
    preferredBehaviors
  ).slice(0, 3);
  const latest = period.at(-1);
  const strongestFactor = pickPreferredMetric(
    aggregateBehaviorModifier(period, "finalScore", "desc"),
    preferredBehaviors
  );
  const strongestEntity = latest
    ? pickPreferredMetric(
        latest.entities
          .map(toTrendMetric)
          .sort((a, b) => Math.abs(b.value) - Math.abs(a.value)),
        getPreferredEntityIds(stageMode)
      )
    : undefined;
  const strongestIntermediate = latest
    ? pickPreferredMetric(
        latest.intermediateFactors
          .map(toTrendMetric)
          .sort((a, b) => Math.abs(b.value) - Math.abs(a.value)),
        getPreferredIntermediateIds(stageMode)
      )
    : undefined;
  const strongestChainEffect =
    strongestFactor && (strongestEntity || strongestIntermediate)
      ? {
          factor: strongestFactor,
          entity: strongestEntity,
          intermediate: strongestIntermediate,
          summary: `${strongestFactor.label}正在形成主要行为动能，当前更值得看它对${strongestEntity?.label ?? "实体状态"}和${strongestIntermediate?.label ?? "中间因子"}的连锁影响。`
        }
      : undefined;

  return {
    positiveInertia,
    continuousDecay,
    strongestChainEffect,
    conclusion: buildTrendConclusion(positiveInertia, continuousDecay, strongestChainEffect?.summary)
  };
}

function getTrendMetrics<TItem, TId extends string>(
  items: TItem[],
  getId: (item: TItem) => TId,
  getLabel: (item: TItem) => string,
  getTrend: (item: TItem) => number,
  order: "asc" | "desc"
): ReviewMetric<TId>[] {
  if (!items.length) return [];

  const totals = new Map<TId, ReviewMetric<TId>>();
  items.forEach((item) => {
    const id = getId(item);
    const current = totals.get(id) ?? { id, label: getLabel(item), value: 0 };
    totals.set(id, {
      ...current,
      value: round(current.value + getTrend(item))
    });
  });

  return [...totals.values()].sort((a, b) =>
    order === "asc" ? a.value - b.value : b.value - a.value
  );
}

function aggregateBehaviorModifier(
  snapshots: LifeCurveSnapshot[],
  key: "finalScore" | "streakModifier" | "decayModifier",
  order: "asc" | "desc"
): ReviewMetric<BehaviorFactorId>[] {
  const totals = new Map<BehaviorFactorId, ReviewMetric<BehaviorFactorId>>();

  snapshots.flatMap((snapshot) => snapshot.behaviorScores).forEach((score) => {
    const current = totals.get(score.factorId) ?? {
      id: score.factorId,
      label: behaviorFactorLabels[score.factorId],
      value: 0
    };
    totals.set(score.factorId, {
      ...current,
      value: round(current.value + score[key])
    });
  });

  return [...totals.values()]
    .filter((item) => (order === "asc" ? item.value < 0 : item.value > 0))
    .sort((a, b) => (order === "asc" ? a.value - b.value : b.value - a.value));
}

function toTrendMetric<TId extends EntityId | IntermediateFactorId>(item: {
  id: TId;
  label: string;
  trend: number;
}): ReviewMetric<TId> {
  return {
    id: item.id,
    label: item.label,
    value: item.trend
  };
}

function buildPeriodConclusion(
  days: ReviewWindow,
  count: number,
  average: number,
  entity?: ReviewMetric<EntityId>,
  intermediate?: ReviewMetric<IntermediateFactorId>,
  behavior?: ReviewMetric<BehaviorFactorId>,
  stageMode?: StageModeConfig
): string {
  if (!count) return `最近 ${days} 天还没有足够记录，先完成一次 Daily Check-in。`;

  const modeText = stageMode ? `按「${stageMode.label}」阶段优先看，` : "";
  const curveText = stageMode?.curveFocus[0]
    ? `默认参考${curveLabels[stageMode.curveFocus[0]]}，`
    : "";

  return `${modeText}${curveText}最近 ${days} 天复合均值为 ${average.toFixed(1)}。优先关注${entity?.label ?? "暂无明显实体拖累"}和${intermediate?.label ?? "暂无明显中间因子拖累"}，当前最值得保留的正向行为是${behavior?.label ?? "暂无明显正向行为"}。`;
}

function buildTrendConclusion(
  positive: ReviewMetric<BehaviorFactorId>[],
  decay: ReviewMetric<BehaviorFactorId>[],
  chainSummary?: string
): string {
  const positiveText = positive.length
    ? positive.map((item) => item.label).join("、")
    : "暂无明显正向惯性";
  const decayText = decay.length ? decay.map((item) => item.label).join("、") : "暂无连续衰减";

  return `${positiveText}正在形成正向惯性；${decayText}。${chainSummary ?? "当前连锁影响还不明显。"}`;
}

function pickPreferredMetric<TId extends string>(
  metrics: ReviewMetric<TId>[],
  preferredIds: TId[]
): ReviewMetric<TId> | undefined {
  return prioritizeMetrics(metrics, preferredIds)[0];
}

function prioritizeMetrics<TId extends string>(
  metrics: ReviewMetric<TId>[],
  preferredIds: TId[]
): ReviewMetric<TId>[] {
  if (!preferredIds.length) return metrics;

  return [...metrics].sort((a, b) => {
    const aIndex = preferredIds.indexOf(a.id);
    const bIndex = preferredIds.indexOf(b.id);
    const aRank = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
    const bRank = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;

    if (aRank !== bRank) return aRank - bRank;
    return Math.abs(b.value) - Math.abs(a.value);
  });
}

function getPreferredEntityIds(stageMode?: StageModeConfig): EntityId[] {
  if (!stageMode) return [];

  return Object.entries(stageMode.entityWeights)
    .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))
    .map(([id]) => id as EntityId);
}

function getPreferredIntermediateIds(stageMode?: StageModeConfig): IntermediateFactorId[] {
  if (!stageMode) return [];

  return Object.entries(stageMode.intermediateWeights)
    .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))
    .map(([id]) => id as IntermediateFactorId);
}

function getPreferredBehaviorIds(stageMode?: StageModeConfig): BehaviorFactorId[] {
  if (!stageMode) return [];

  return [
    ...stageMode.behaviorPriorities,
    ...stageMode.adviceBias.repair,
    ...stageMode.adviceBias.reinforce,
    ...stageMode.adviceBias.experiment
  ];
}

function sortSnapshots(snapshots: LifeCurveSnapshot[]): LifeCurveSnapshot[] {
  return [...snapshots].sort((a, b) => a.date.localeCompare(b.date));
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
