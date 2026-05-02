import type {
  ActionPlanItem,
  AdviceKind,
  PlanEffectiveness,
  PlanKindStats,
  PlanValidation,
  PlanValidationSummary
} from "@/types/advice";
import type { BehaviorFactorId } from "@/types/behavior";
import type { LifeCurveSnapshot } from "@/types/snapshot";
import { planValidationConfig } from "./config";
import { behaviorFactorLabels } from "./labels";

export function validateActionPlans(
  plans: ActionPlanItem[],
  snapshots: LifeCurveSnapshot[]
): PlanValidationSummary {
  const sorted = [...snapshots].sort((a, b) => a.date.localeCompare(b.date));
  const validations = plans.map((plan) => validateActionPlan(plan, sorted));
  const stats = buildPlanKindStats(plans, validations);
  const easiestEffectiveKind = stats
    .filter((item) => item.effective + item.partiallyEffective > 0)
    .sort((a, b) => b.effective + b.partiallyEffective - (a.effective + a.partiallyEffective))[0]
    ?.sourceKind;

  return {
    validations,
    stats,
    easiestEffectiveKind
  };
}

function validateActionPlan(
  plan: ActionPlanItem,
  snapshots: LifeCurveSnapshot[]
): PlanValidation {
  const recent = snapshots.slice(-planValidationConfig.recentWindow);
  const baseline = snapshots.slice(
    -(planValidationConfig.recentWindow * 2),
    -planValidationConfig.recentWindow
  );
  const factorDelta = calculateRelatedFactorDelta(plan.relatedFactors, baseline, recent);
  const compositeDelta = calculateCompositeDelta(baseline, recent);
  const factorImproved = factorDelta >= planValidationConfig.factorImprovementThreshold;
  const compositeImproved = compositeDelta >= planValidationConfig.compositeImprovementThreshold;
  const effectiveness = getEffectiveness(factorImproved, compositeImproved);
  const mostImproved = getMostImprovedText(plan.relatedFactors, factorDelta, compositeDelta);
  const notImproved = getNotImprovedText(factorImproved, compositeImproved);
  const recommendation = getRecommendation(effectiveness, plan.status);

  return {
    planId: plan.id,
    sourceKind: plan.sourceKind,
    effectiveness,
    factorImproved,
    compositeImproved,
    mostImproved,
    notImproved,
    recommendation,
    summary: buildValidationSummary(effectiveness, mostImproved, notImproved, recommendation)
  };
}

function calculateRelatedFactorDelta(
  factors: BehaviorFactorId[],
  baseline: LifeCurveSnapshot[],
  recent: LifeCurveSnapshot[]
): number {
  if (!baseline.length || !recent.length || !factors.length) return 0;

  const baselineAverage = averageBehaviorScore(factors, baseline);
  const recentAverage = averageBehaviorScore(factors, recent);
  return round(recentAverage - baselineAverage);
}

function calculateCompositeDelta(
  baseline: LifeCurveSnapshot[],
  recent: LifeCurveSnapshot[]
): number {
  if (!baseline.length || !recent.length) return 0;
  return round(averageComposite(recent) - averageComposite(baseline));
}

function averageBehaviorScore(factors: BehaviorFactorId[], snapshots: LifeCurveSnapshot[]): number {
  const scores = snapshots.flatMap((snapshot) =>
    snapshot.behaviorScores
      .filter((score) => factors.includes(score.factorId))
      .map((score) => score.finalScore)
  );
  if (!scores.length) return 0;
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

function averageComposite(snapshots: LifeCurveSnapshot[]): number {
  return snapshots.reduce((sum, snapshot) => sum + snapshot.compositeScore, 0) / snapshots.length;
}

function getEffectiveness(
  factorImproved: boolean,
  compositeImproved: boolean
): PlanEffectiveness {
  if (factorImproved && compositeImproved) return "effective";
  if (factorImproved || compositeImproved) return "partially_effective";
  return "no_clear_effect";
}

function getMostImprovedText(
  factors: BehaviorFactorId[],
  factorDelta: number,
  compositeDelta: number
): string {
  const factorText = factors.map((factor) => behaviorFactorLabels[factor]).join("、");
  if (factorDelta >= compositeDelta) {
    return `${factorText || "相关行为"} 改善 ${formatDelta(factorDelta)}`;
  }
  return `复合分数改善 ${formatDelta(compositeDelta)}`;
}

function getNotImprovedText(factorImproved: boolean, compositeImproved: boolean): string {
  if (!factorImproved && !compositeImproved) return "相关行为和复合分数都还没有明显改善";
  if (!factorImproved) return "相关行为还没有明显改善";
  if (!compositeImproved) return "复合分数还没有明显改善";
  return "暂无明显短板";
}

function getRecommendation(
  effectiveness: PlanEffectiveness,
  status: ActionPlanItem["status"]
): PlanValidation["recommendation"] {
  if (status === "abandoned") return "abandon";
  if (effectiveness === "effective") return "continue";
  if (effectiveness === "partially_effective") return "adjust";
  return status === "completed" ? "adjust" : "abandon";
}

function buildValidationSummary(
  effectiveness: PlanEffectiveness,
  mostImproved: string,
  notImproved: string,
  recommendation: PlanValidation["recommendation"]
): string {
  const label = {
    effective: "有效",
    partially_effective: "部分有效",
    no_clear_effect: "暂无明显效果"
  }[effectiveness];
  const action = {
    continue: "建议继续",
    adjust: "建议调整",
    abandon: "建议放弃"
  }[recommendation];

  return `${label}：${mostImproved}；${notImproved}。${action}。`;
}

function buildPlanKindStats(
  plans: ActionPlanItem[],
  validations: PlanValidation[]
): PlanKindStats[] {
  const kinds: AdviceKind[] = ["repair", "reinforce", "experiment"];

  return kinds.map((sourceKind) => {
    const kindPlans = plans.filter((plan) => plan.sourceKind === sourceKind);
    const kindValidations = validations.filter((validation) => validation.sourceKind === sourceKind);

    return {
      sourceKind,
      total: kindPlans.length,
      completed: kindPlans.filter((plan) => plan.status === "completed").length,
      inProgress: kindPlans.filter((plan) => plan.status === "in_progress").length,
      effective: kindValidations.filter((validation) => validation.effectiveness === "effective").length,
      partiallyEffective: kindValidations.filter(
        (validation) => validation.effectiveness === "partially_effective"
      ).length,
      noClearEffect: kindValidations.filter(
        (validation) => validation.effectiveness === "no_clear_effect"
      ).length
    };
  });
}

function formatDelta(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}`;
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
