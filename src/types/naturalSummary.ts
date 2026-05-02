import type { AdviceSummary, PlanValidationSummary } from "./advice";
import type { ReviewSummary } from "./review";
import type { StageModeConfig } from "./stageMode";

export type NaturalSummaryInput = {
  review: ReviewSummary;
  advice: AdviceSummary;
  validation: PlanValidationSummary;
  stageMode: StageModeConfig;
};

export type NaturalSummaryOutput = {
  reviewSummary: string;
  adviceSummary: string;
  executionReminder: string;
};

export type NaturalSummaryProvider = {
  id: "template" | "llm";
  generate: (input: NaturalSummaryInput) => NaturalSummaryOutput;
};
