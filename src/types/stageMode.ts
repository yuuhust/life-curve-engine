import type { BehaviorFactorId } from "./behavior";
import type { CurveSeriesKey } from "./curve";
import type { EntityId } from "./entity";
import type { IntermediateFactorId } from "./intermediate";

export type StageModeId =
  | "balanced"
  | "academic"
  | "career"
  | "venture"
  | "health_recovery"
  | "ai_leverage";

export type StageModeConfig = {
  id: StageModeId;
  label: string;
  description: string;
  entityWeights: Partial<Record<EntityId, number>>;
  intermediateWeights: Partial<Record<IntermediateFactorId, number>>;
  behaviorPriorities: BehaviorFactorId[];
  curveFocus: CurveSeriesKey[];
  adviceBias: {
    repair: BehaviorFactorId[];
    reinforce: BehaviorFactorId[];
    experiment: BehaviorFactorId[];
  };
};

export type UserStageModeSetting = {
  currentMode: StageModeId;
  updatedAt: string;
};
