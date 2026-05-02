import type { DailyBehaviorInput } from "@/types/behavior";
import { describe, expect, it } from "vitest";
import { createLifeCurveSnapshot } from "../snapshot";

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

describe("createLifeCurveSnapshot stage mode", () => {
  it("stores the stage mode used for calculation", () => {
    const snapshot = createLifeCurveSnapshot(
      {
        date: "2026-04-30",
        values
      },
      undefined,
      [],
      "career"
    );

    expect(snapshot.stageMode).toBe("career");
  });
});
