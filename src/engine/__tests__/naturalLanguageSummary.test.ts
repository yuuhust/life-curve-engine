import type { DailyBehaviorInput } from "@/types/behavior";
import { describe, expect, it } from "vitest";
import { createActionPlansFromAdvice, generateAdviceSummary } from "../advice";
import { generateNaturalSummary, templateNaturalSummaryProvider } from "../naturalLanguageSummary";
import { validateActionPlans } from "../planValidation";
import { generateReviewSummary } from "../review";
import { createLifeCurveSnapshot } from "../snapshot";
import { getStageModeConfig } from "../stageModes";

const values: DailyBehaviorInput["values"] = {
  ai_hours: 1,
  ai_depth: 3,
  reading_time: 20,
  deep_study: 1,
  project_progress: 40,
  output_count: 1,
  sleep_duration: 6,
  exercise_score: 40,
  focus_score: 60,
  work_completion: 70,
  finance_action: 0,
  emotion_state: 0
};

describe("generateNaturalSummary", () => {
  it("creates template summaries from structured review, advice, validation, and stage mode data", () => {
    const stageMode = getStageModeConfig("ai_leverage");
    const snapshot = createLifeCurveSnapshot({
      date: "2026-04-30",
      values
    });
    const review = generateReviewSummary([snapshot], stageMode);
    const advice = generateAdviceSummary({
      currentSnapshot: snapshot,
      review,
      stageMode
    });
    const plans = createActionPlansFromAdvice(advice, {});
    const validation = validateActionPlans(plans, [snapshot]);

    const summary = generateNaturalSummary({
      advice,
      review,
      stageMode,
      validation
    });

    expect(templateNaturalSummaryProvider.id).toBe("template");
    expect(summary.reviewSummary).toContain("AI 杠杆成长");
    expect(summary.reviewSummary).toContain(review.weekly.compositeAverage.toFixed(1));
    expect(summary.adviceSummary).toContain(advice.repair.actionGoal);
    expect(summary.adviceSummary).toContain(advice.experiment.successCriteria);
    expect(summary.executionReminder).toMatch(/继续|调整|放弃|行动计划/);
  });
});
