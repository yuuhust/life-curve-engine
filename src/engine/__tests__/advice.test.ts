import type { DailyBehaviorInput } from "@/types/behavior";
import { describe, expect, it } from "vitest";
import { createActionPlansFromAdvice, generateAdviceSummary } from "../advice";
import { generateReviewSummary } from "../review";
import { runContinuousFactorSimulation } from "../simulation";
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

describe("generateAdviceSummary", () => {
  it("generates repair, reinforce, and experiment advice from review data", () => {
    const snapshot = createLifeCurveSnapshot({
      date: "2026-04-30",
      values
    });
    const review = generateReviewSummary([snapshot]);

    const advice = generateAdviceSummary({
      currentSnapshot: snapshot,
      review
    });

    expect(advice.repair.kind).toBe("repair");
    expect(advice.reinforce.kind).toBe("reinforce");
    expect(advice.experiment.kind).toBe("experiment");
    expect(advice.repair.evidence.length).toBeGreaterThan(0);
  });

  it("uses continuous simulation evidence when available", () => {
    const snapshot = createLifeCurveSnapshot({
      date: "2026-04-30",
      values
    });
    const review = generateReviewSummary([snapshot]);
    const continuousSimulation = runContinuousFactorSimulation(snapshot, {
      factorId: "sleep_duration",
      value: 8,
      days: 7
    });

    const advice = generateAdviceSummary({
      continuousSimulation,
      currentSnapshot: snapshot,
      review
    });

    expect(advice.experiment.summary).toContain("连续模拟");
    expect(advice.experiment.evidence.join("\n")).toContain("连续 7 天模拟");
    expect(advice.experiment.relatedFactors).toEqual(["sleep_duration"]);
  });

  it("turns advice into action plans with status and preserved evidence", () => {
    const snapshot = createLifeCurveSnapshot({
      date: "2026-04-30",
      values
    });
    const advice = generateAdviceSummary({
      currentSnapshot: snapshot,
      review: generateReviewSummary([snapshot])
    });

    const plans = createActionPlansFromAdvice(advice, {
      repair: "in_progress"
    });

    expect(plans).toHaveLength(3);
    expect(plans[0].sourceKind).toBe("repair");
    expect(plans[0].status).toBe("in_progress");
    expect(plans[0].relatedFactors).toEqual(advice.repair.relatedFactors);
    expect(plans[0].evidence).toEqual(advice.repair.evidence);
    expect(plans[0].actionGoal).toBeTruthy();
    expect(plans[0].successCriteria).toBeTruthy();
  });

  it("uses stage mode bias to choose repair and reinforce factors from factual candidates", () => {
    const snapshot = createLifeCurveSnapshot({
      date: "2026-04-30",
      values
    });
    const review = generateReviewSummary([snapshot]);

    const academicAdvice = generateAdviceSummary({
      currentSnapshot: snapshot,
      review,
      stageMode: getStageModeConfig("academic")
    });
    const careerAdvice = generateAdviceSummary({
      currentSnapshot: snapshot,
      review,
      stageMode: getStageModeConfig("career")
    });

    expect(academicAdvice.reinforce.relatedFactors[0]).toBe("deep_study");
    expect(careerAdvice.reinforce.relatedFactors[0]).toBe("ai_depth");
  });

  it("keeps continuous simulation evidence while stage mode biases experiment choice", () => {
    const snapshot = createLifeCurveSnapshot({
      date: "2026-04-30",
      values
    });
    const review = generateReviewSummary([snapshot]);
    const continuousSimulation = runContinuousFactorSimulation(snapshot, {
      factorId: "sleep_duration",
      value: 8,
      days: 7
    });

    const advice = generateAdviceSummary({
      continuousSimulation,
      currentSnapshot: snapshot,
      review,
      stageMode: getStageModeConfig("venture")
    });

    expect(advice.experiment.relatedFactors[0]).toBe("project_progress");
    expect(advice.experiment.evidence.join("\n")).toContain("连续 7 天模拟");
    expect(advice.experiment.evidence.join("\n")).toContain("睡眠");
  });
});
