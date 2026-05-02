import type { BehaviorFactorId } from "./behavior";
import type { EntityId } from "./entity";
import type { IntermediateFactorId } from "./intermediate";

export type ReviewWindow = 7 | 30;

export type ReviewMetric<TId extends string> = {
  id: TId;
  label: string;
  value: number;
};

export type PeriodReview = {
  days: ReviewWindow;
  snapshotCount: number;
  compositeAverage: number;
  biggestDragEntity?: ReviewMetric<EntityId>;
  biggestDragIntermediate?: ReviewMetric<IntermediateFactorId>;
  strongestPositiveBehavior?: ReviewMetric<BehaviorFactorId>;
  focusedDragEntity?: ReviewMetric<EntityId>;
  focusedDragIntermediate?: ReviewMetric<IntermediateFactorId>;
  focusedPositiveBehavior?: ReviewMetric<BehaviorFactorId>;
  conclusion: string;
};

export type TrendExplanation = {
  positiveInertia: ReviewMetric<BehaviorFactorId>[];
  continuousDecay: ReviewMetric<BehaviorFactorId>[];
  strongestChainEffect?: {
    factor: ReviewMetric<BehaviorFactorId>;
    entity?: ReviewMetric<EntityId>;
    intermediate?: ReviewMetric<IntermediateFactorId>;
    summary: string;
  };
  conclusion: string;
};

export type ReviewSummary = {
  weekly: PeriodReview;
  monthly: PeriodReview;
  trend: TrendExplanation;
};
