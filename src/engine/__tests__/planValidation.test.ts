import type { ActionPlanItem } from "@/types/advice";
import type { DailyBehaviorInput } from "@/types/behavior";
import { describe, expect, it } from "vitest";
import { validateActionPlans } from "../planValidation";
import { createLifeCurveSnapshot } from "../snapshot";

const baseValues: DailyBehaviorInput["values"] = {
  ai_hours: 1,
  ai_depth: 3,
  reading_time: 20,
  deep_study: 1,
  project_progress: 20,
  output_count: 1,
  sleep_duration: 7,
  exercise_score: 40,
  focus_score: 60,
  work_completion: 70,
  finance_action: 0,
  emotion_state: 0
};

const plan: ActionPlanItem = {
  id: "experiment",
  sourceKind: "experiment",
  title: "连续 7 天测试：项目推进",
  actionGoal: "连续 7 天改善项目推进。",
  successCriteria: "项目推进带动 composite 改善。",
  status: "completed",
  relatedFactors: ["project_progress"],
  evidence: ["test"]
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

function snapshots(inputs: DailyBehaviorInput[]) {
  return inputs.reduce<ReturnType<typeof createLifeCurveSnapshot>[]>((items, item) => {
    const previous = items.at(-1);
    return [
      ...items,
      createLifeCurveSnapshot(item, previous, inputs.filter((entry) => entry.date < item.date))
    ];
  }, []);
}

describe("validateActionPlans", () => {
  it("marks a plan effective when related factors and composite both improve", () => {
    const result = validateActionPlans(
      [plan],
      snapshots([
        input("2026-04-25", { project_progress: 20 }),
        input("2026-04-26", { project_progress: 20 }),
        input("2026-04-27", { project_progress: 20 }),
        input("2026-04-28", { project_progress: 90 }),
        input("2026-04-29", { project_progress: 90 }),
        input("2026-04-30", { project_progress: 90 })
      ])
    );

    expect(result.validations[0].effectiveness).toBe("effective");
    expect(result.validations[0].factorImproved).toBe(true);
    expect(result.validations[0].compositeImproved).toBe(true);
  });

  it("marks a plan partially effective when only the related factor improves", () => {
    const result = validateActionPlans(
      [plan],
      snapshots([
        input("2026-04-25", { project_progress: 20, sleep_duration: 8 }),
        input("2026-04-26", { project_progress: 20, sleep_duration: 8 }),
        input("2026-04-27", { project_progress: 20, sleep_duration: 8 }),
        input("2026-04-28", {
          ai_depth: 1,
          focus_score: 0,
          project_progress: 90,
          sleep_duration: 0,
          work_completion: 0
        }),
        input("2026-04-29", {
          ai_depth: 1,
          focus_score: 0,
          project_progress: 90,
          sleep_duration: 0,
          work_completion: 0
        }),
        input("2026-04-30", {
          ai_depth: 1,
          focus_score: 0,
          project_progress: 90,
          sleep_duration: 0,
          work_completion: 0
        })
      ])
    );

    expect(result.validations[0].effectiveness).toBe("partially_effective");
    expect(result.validations[0].factorImproved).toBe(true);
  });

  it("marks a plan as no clear effect when neither signal improves", () => {
    const result = validateActionPlans(
      [plan],
      snapshots([
        input("2026-04-25", { project_progress: 20 }),
        input("2026-04-26", { project_progress: 20 }),
        input("2026-04-27", { project_progress: 20 }),
        input("2026-04-28", {
          ai_depth: 1,
          focus_score: 0,
          project_progress: 20,
          sleep_duration: 0,
          work_completion: 0
        }),
        input("2026-04-29", {
          ai_depth: 1,
          focus_score: 0,
          project_progress: 20,
          sleep_duration: 0,
          work_completion: 0
        }),
        input("2026-04-30", {
          ai_depth: 1,
          focus_score: 0,
          project_progress: 20,
          sleep_duration: 0,
          work_completion: 0
        })
      ])
    );

    expect(result.validations[0].effectiveness).toBe("no_clear_effect");
    expect(result.stats[2].completed).toBe(1);
  });
});
