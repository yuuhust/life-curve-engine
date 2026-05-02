import type { DailyBehaviorInput } from "@/types/behavior";
import { describe, expect, it } from "vitest";
import { createLifeCurveSnapshot } from "../snapshot";
import {
  runContinuousFactorSimulation,
  runSingleFactorSimulation,
  supportedSimulationFactors
} from "../simulation";

const values: DailyBehaviorInput["values"] = {
  ai_hours: 1,
  ai_depth: 3,
  reading_time: 20,
  deep_study: 1,
  project_progress: 40,
  output_count: 1,
  sleep_duration: 7,
  exercise_score: 40,
  focus_score: 60,
  work_completion: 70,
  finance_action: 0,
  emotion_state: 0
};

describe("runSingleFactorSimulation", () => {
  it("supports only the first three V1.3 simulation factors", () => {
    expect(supportedSimulationFactors).toEqual([
      "sleep_duration",
      "ai_depth",
      "project_progress"
    ]);
  });

  it("reuses the snapshot engine and compares composite scores", () => {
    const snapshot = createLifeCurveSnapshot({
      date: "2026-04-30",
      values
    });

    const result = runSingleFactorSimulation(snapshot, {
      factorId: "project_progress",
      value: 90
    });

    expect(result.beforeComposite).toBe(snapshot.compositeScore);
    expect(result.afterComposite).toBe(result.snapshot.compositeScore);
    expect(result.delta).toBeCloseTo(result.afterComposite - result.beforeComposite, 1);
    expect(result.explanation).toContain("项目推进度");
    expect(result.biggestCurveChange.label).toBeTruthy();
    expect(result.biggestEntityChange.label).toBe("项目/创业体");
    expect(result.biggestIntermediateChange.label).toBeTruthy();
    expect(result.explanation).toContain(result.biggestEntityChange.label);
    expect(result.explanation).toContain(result.biggestIntermediateChange.label);
    expect(result.explanation).toContain(result.biggestCurveChange.label);
  });

  it("runs a continuous single-factor simulation with rolling history", () => {
    const snapshot = createLifeCurveSnapshot({
      date: "2026-04-30",
      values
    });

    const result = runContinuousFactorSimulation(snapshot, {
      factorId: "sleep_duration",
      value: 8,
      days: 3
    });

    expect(result.days).toBe(3);
    expect(result.snapshots).toHaveLength(3);
    expect(result.snapshot.date).toBe("2026-05-03");
    expect(result.afterComposite).toBe(result.snapshot.compositeScore);
    expect(result.explanation).toContain("连续 3 天");
  });
});
