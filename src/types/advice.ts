import type { BehaviorFactorId } from "./behavior";

export type AdviceKind = "repair" | "reinforce" | "experiment";

export type AdviceItem = {
  kind: AdviceKind;
  title: string;
  summary: string;
  actionGoal: string;
  successCriteria: string;
  relatedFactors: BehaviorFactorId[];
  evidence: string[];
};

export type AdviceSummary = {
  repair: AdviceItem;
  reinforce: AdviceItem;
  experiment: AdviceItem;
};

export type PlanStatus = "not_started" | "in_progress" | "completed" | "abandoned";

export type ActionPlanItem = {
  id: string;
  sourceKind: AdviceKind;
  title: string;
  actionGoal: string;
  successCriteria: string;
  status: PlanStatus;
  relatedFactors: BehaviorFactorId[];
  evidence: string[];
};

export type PlanEffectiveness = "effective" | "partially_effective" | "no_clear_effect";

export type PlanValidation = {
  planId: string;
  sourceKind: AdviceKind;
  effectiveness: PlanEffectiveness;
  factorImproved: boolean;
  compositeImproved: boolean;
  mostImproved: string;
  notImproved: string;
  recommendation: "continue" | "adjust" | "abandon";
  summary: string;
};

export type PlanKindStats = {
  sourceKind: AdviceKind;
  total: number;
  completed: number;
  inProgress: number;
  effective: number;
  partiallyEffective: number;
  noClearEffect: number;
};

export type PlanValidationSummary = {
  validations: PlanValidation[];
  stats: PlanKindStats[];
  easiestEffectiveKind?: AdviceKind;
};
