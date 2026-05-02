import type { BehaviorScore, DailyBehaviorInput } from "./behavior";
import type { CurveParameters, CurvePoint } from "./curve";
import type { EntityState } from "./entity";
import type { ExplanationItem } from "./explanation";
import type { IntermediateFactorState } from "./intermediate";
import type { StageModeId } from "./stageMode";

export type LifeCurveSnapshot = {
  date: string;
  input: DailyBehaviorInput;
  behaviorScores: BehaviorScore[];
  entities: EntityState[];
  intermediateFactors: IntermediateFactorState[];
  curveParameters: CurveParameters;
  curvePoints: CurvePoint[];
  explanations: ExplanationItem[];
  compositeScore: number;
  stageMode: StageModeId;
};
