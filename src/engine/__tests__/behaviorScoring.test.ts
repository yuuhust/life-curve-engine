import type { DailyBehaviorInput } from "@/types/behavior";
import { describe, expect, it } from "vitest";
import { scoreDailyBehavior } from "../behaviorScoring";
import { defaultDecayProfile, defaultStreakProfile, getDecayProfile, getStreakProfile } from "../rules";

const baseValues: DailyBehaviorInput["values"] = {
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

function input(
  date: string,
  overrides: Partial<DailyBehaviorInput["values"]> = {}
): DailyBehaviorInput {
  return {
    date,
    values: {
      ...baseValues,
      ...overrides
    }
  };
}

describe("scoreDailyBehavior", () => {
  it("adds a streak bonus after consecutive positive days", () => {
    const history = [
      input("2026-04-27", { project_progress: 60 }),
      input("2026-04-28", { project_progress: 60 }),
      input("2026-04-29", { project_progress: 60 })
    ];

    const score = scoreDailyBehavior(input("2026-04-30", { project_progress: 60 }), history).find(
      (item) => item.factorId === "project_progress"
    );

    expect(score?.normalizedScore).toBe(1);
    expect(score?.streakModifier).toBe(0.2);
    expect(score?.finalScore).toBe(1.2);
  });

  it("does not bridge gaps in the historical streak", () => {
    const history = [
      input("2026-04-27", { project_progress: 60 }),
      input("2026-04-29", { project_progress: 60 })
    ];

    const score = scoreDailyBehavior(input("2026-04-30", { project_progress: 60 }), history).find(
      (item) => item.factorId === "project_progress"
    );

    expect(score?.streakModifier).toBe(0.1);
  });

  it("adds a decay penalty after consecutive interrupted days", () => {
    const history = [
      input("2026-04-27", { reading_time: 0 }),
      input("2026-04-28", { reading_time: 0 }),
      input("2026-04-29", { reading_time: 0 })
    ];

    const score = scoreDailyBehavior(input("2026-04-30", { reading_time: 0 }), history).find(
      (item) => item.factorId === "reading_time"
    );

    expect(score?.normalizedScore).toBe(-2);
    expect(score?.decayModifier).toBe(-0.25);
    expect(score?.finalScore).toBe(-2.25);
  });

  it("does not apply decay to non-decay factors", () => {
    const history = [
      input("2026-04-28", { emotion_state: -2 }),
      input("2026-04-29", { emotion_state: -2 })
    ];

    const score = scoreDailyBehavior(input("2026-04-30", { emotion_state: -2 }), history).find(
      (item) => item.factorId === "emotion_state"
    );

    expect(score?.decayModifier).toBe(0);
  });

  it("uses the default streak and decay profiles from factor rules", () => {
    expect(getStreakProfile("project_progress")).toEqual(defaultStreakProfile);
    expect(getDecayProfile("reading_time")).toEqual(defaultDecayProfile);
    expect(getDecayProfile("emotion_state")).toBeUndefined();
  });
});
