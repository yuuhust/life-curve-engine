import type { BehaviorFactorId } from "./behavior";

export type ExplanationItem = {
  title: string;
  summary: string;
  severity: "info" | "positive" | "warning" | "critical";
  relatedFactors: BehaviorFactorId[];
};
