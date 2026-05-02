import type { BehaviorFactorId } from "./behavior";
import type { CurveSeriesKey } from "./curve";
import type { EntityId } from "./entity";
import type { IntermediateFactorId } from "./intermediate";
import type { LifeCurveSnapshot } from "./snapshot";

export type SimulationFactorId = Extract<
  BehaviorFactorId,
  "sleep_duration" | "ai_depth" | "project_progress"
>;

export type SimulationInput = {
  factorId: SimulationFactorId;
  value: number;
};

export type ContinuousSimulationInput = SimulationInput & {
  days: number;
};

export type SimulationDifference<TId extends string> = {
  id: TId;
  label: string;
  before: number;
  after: number;
  delta: number;
};

export type SimulationResult = {
  input: SimulationInput;
  beforeComposite: number;
  afterComposite: number;
  delta: number;
  biggestCurveChange: SimulationDifference<CurveSeriesKey>;
  biggestEntityChange: SimulationDifference<EntityId>;
  biggestIntermediateChange: SimulationDifference<IntermediateFactorId>;
  explanation: string;
  snapshot: LifeCurveSnapshot;
};

export type ContinuousSimulationResult = SimulationResult & {
  days: number;
  snapshots: LifeCurveSnapshot[];
};
