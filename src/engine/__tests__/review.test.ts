import type { DailyBehaviorInput } from "@/types/behavior";
import { describe, expect, it } from "vitest";
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
  sleep_duration: 7.5,
  exercise_score: 40,
  focus_score: 60,
  work_completion: 70,
  finance_action: 0,
  emotion_state: 0
};

function input(date: string, overrides: Partial<DailyBehaviorInput["values"]> = {}): DailyBehaviorInput {
  return {
    date,
    values: {
      ...values,
      ...overrides
    }
  };
}

describe("generateReviewSummary", () => {
  it("summarizes weekly and monthly windows from snapshots", () => {
    const inputs = [
      input("2026-04-27", { project_progress: 60 }),
      input("2026-04-28", { project_progress: 60 }),
      input("2026-04-29", { reading_time: 0 }),
      input("2026-04-30", { reading_time: 0 })
    ];
    const snapshots = inputs.reduce<ReturnType<typeof createLifeCurveSnapshot>[]>((items, item) => {
      const previous = items.at(-1);
      return [...items, createLifeCurveSnapshot(item, previous, inputs.filter((entry) => entry.date < item.date))];
    }, []);

    const summary = generateReviewSummary(snapshots);

    expect(summary.weekly.snapshotCount).toBe(4);
    expect(summary.monthly.snapshotCount).toBe(4);
    expect(summary.weekly.compositeAverage).toBeGreaterThan(0);
    expect(summary.weekly.strongestPositiveBehavior?.label).toBeTruthy();
    expect(summary.trend.conclusion).toContain("惯性");
  });

  it("keeps raw review facts while stage mode changes review emphasis", () => {
    const snapshot = createLifeCurveSnapshot(input("2026-04-30"));
    const adjustedSnapshot = {
      ...snapshot,
      entities: snapshot.entities.map((entity) => {
        if (entity.id === "health") return { ...entity, trend: -5 };
        if (entity.id === "venture") return { ...entity, trend: -1 };
        return { ...entity, trend: 0 };
      }),
      intermediateFactors: snapshot.intermediateFactors.map((factor) => {
        if (factor.id === "recovery_rate") return { ...factor, trend: -5 };
        if (factor.id === "opportunity_density") return { ...factor, trend: -1 };
        return { ...factor, trend: 0 };
      }),
      behaviorScores: snapshot.behaviorScores.map((score) => {
        if (score.factorId === "sleep_duration") return { ...score, finalScore: 5 };
        if (score.factorId === "project_progress") return { ...score, finalScore: 1 };
        return { ...score, finalScore: 0 };
      })
    };

    const summary = generateReviewSummary([adjustedSnapshot], getStageModeConfig("venture"));

    expect(summary.weekly.biggestDragEntity?.id).toBe("health");
    expect(summary.weekly.focusedDragEntity?.id).toBe("venture");
    expect(summary.weekly.biggestDragIntermediate?.id).toBe("recovery_rate");
    expect(summary.weekly.focusedDragIntermediate?.id).toBe("opportunity_density");
    expect(summary.weekly.strongestPositiveBehavior?.id).toBe("sleep_duration");
    expect(summary.weekly.focusedPositiveBehavior?.id).toBe("project_progress");
    expect(summary.weekly.conclusion).toContain("项目优先");
    expect(summary.weekly.conclusion).toContain("项目曲线");
  });
});
