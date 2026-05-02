export type IntermediateFactorId =
  | "cognitive_growth"
  | "execution_power"
  | "leverage_level"
  | "opportunity_density"
  | "safety_floor"
  | "recovery_rate"
  | "compounding_power"
  | "risk_exposure";

export type IntermediateFactorState = {
  id: IntermediateFactorId;
  label: string;
  score: number;
  trend: number;
};
