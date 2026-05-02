import type { AdviceKind } from "@/types/advice";
import type {
  NaturalSummaryInput,
  NaturalSummaryOutput,
  NaturalSummaryProvider
} from "@/types/naturalSummary";

const adviceKindLabels: Record<AdviceKind, string> = {
  repair: "修复项",
  reinforce: "强化项",
  experiment: "7 天测试"
};

const recommendationLabels = {
  continue: "继续",
  adjust: "调整",
  abandon: "放弃"
};

export const templateNaturalSummaryProvider: NaturalSummaryProvider = {
  id: "template",
  generate: generateTemplateNaturalSummary
};

export function generateNaturalSummary(
  input: NaturalSummaryInput,
  provider: NaturalSummaryProvider = templateNaturalSummaryProvider
): NaturalSummaryOutput {
  return provider.generate(input);
}

function generateTemplateNaturalSummary(input: NaturalSummaryInput): NaturalSummaryOutput {
  return {
    reviewSummary: buildReviewSummary(input),
    adviceSummary: buildAdviceSummary(input),
    executionReminder: buildExecutionReminder(input)
  };
}

function buildReviewSummary({ review, stageMode }: NaturalSummaryInput): string {
  const weekly = review.weekly;
  const entity = weekly.focusedDragEntity ?? weekly.biggestDragEntity;
  const intermediate = weekly.focusedDragIntermediate ?? weekly.biggestDragIntermediate;
  const behavior = weekly.focusedPositiveBehavior ?? weekly.strongestPositiveBehavior;
  const inertia = review.trend.positiveInertia.map((item) => item.label).slice(0, 2).join("、");
  const decay = review.trend.continuousDecay.map((item) => item.label).slice(0, 2).join("、");

  return `当前按「${stageMode.label}」看，最近 7 天复合均值是 ${weekly.compositeAverage.toFixed(1)}。重点先看${entity?.label ?? "实体底盘"}和${intermediate?.label ?? "中间因子"}，保留${behavior?.label ?? "已形成的正向行为"}。${inertia ? `${inertia}正在形成惯性。` : ""}${decay ? `${decay}需要防止继续衰减。` : ""}`;
}

function buildAdviceSummary({ advice }: NaturalSummaryInput): string {
  return [
    formatAdvice(advice.repair),
    formatAdvice(advice.reinforce),
    formatAdvice(advice.experiment)
  ].join(" ");
}

function buildExecutionReminder({ validation }: NaturalSummaryInput): string {
  const activeValidation =
    validation.validations.find((item) => item.recommendation === "continue") ??
    validation.validations.find((item) => item.recommendation === "adjust") ??
    validation.validations[0];
  const effectiveKind = validation.easiestEffectiveKind
    ? `目前更容易见效的是${adviceKindLabels[validation.easiestEffectiveKind]}。`
    : "";

  if (!activeValidation) {
    return `今天先完成一条行动计划的记录，后续用最近几天的数据验证它是否真的有效。${effectiveKind}`;
  }

  return `执行上建议${recommendationLabels[activeValidation.recommendation]}「${adviceKindLabels[activeValidation.sourceKind]}」方向：${activeValidation.mostImproved}；${activeValidation.notImproved}。${effectiveKind}`;
}

function formatAdvice(item: NaturalSummaryInput["advice"]["repair"]): string {
  return `${adviceKindLabels[item.kind]}：${item.actionGoal} 成功标准是${item.successCriteria}`;
}
