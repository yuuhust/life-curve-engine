import type { PlanStatus } from "@/types/advice";
import type { DailyBehaviorInput } from "@/types/behavior";
import type { StageModeId } from "@/types/stageMode";

export type DemoScenarioId = "academic" | "venture";

export type DemoScenario = {
  id: DemoScenarioId;
  label: string;
  description: string;
  stageMode: StageModeId;
  inputs: DailyBehaviorInput[];
  planStatuses: Record<string, PlanStatus>;
};

const academicInputs: DailyBehaviorInput[] = [
  input("2026-04-19", { sleep_duration: 6, deep_study: 1, work_completion: 55, focus_score: 45 }),
  input("2026-04-20", { sleep_duration: 6.5, deep_study: 1.5, work_completion: 60, focus_score: 50 }),
  input("2026-04-21", { sleep_duration: 7, deep_study: 2, reading_time: 35, work_completion: 70 }),
  input("2026-04-22", { sleep_duration: 7.5, deep_study: 2.5, reading_time: 45, focus_score: 65 }),
  input("2026-04-23", { sleep_duration: 7.5, deep_study: 3, work_completion: 82, focus_score: 70 }),
  input("2026-04-24", { sleep_duration: 8, deep_study: 3, reading_time: 50, work_completion: 86 }),
  input("2026-04-25", { sleep_duration: 7.5, deep_study: 3.5, focus_score: 78, work_completion: 88 }),
  input("2026-04-26", { sleep_duration: 8, deep_study: 3.5, reading_time: 60, work_completion: 90 }),
  input("2026-04-27", { sleep_duration: 8, deep_study: 4, focus_score: 82, work_completion: 92 }),
  input("2026-04-28", { sleep_duration: 7.5, deep_study: 4, reading_time: 70, work_completion: 94 })
];

const ventureInputs: DailyBehaviorInput[] = [
  input("2026-04-19", { project_progress: 35, output_count: 1, ai_depth: 3, sleep_duration: 6.5 }),
  input("2026-04-20", { project_progress: 45, output_count: 1, ai_hours: 2, ai_depth: 3 }),
  input("2026-04-21", { project_progress: 55, output_count: 2, ai_hours: 2.5, ai_depth: 4 }),
  input("2026-04-22", { project_progress: 60, output_count: 2, ai_depth: 4, focus_score: 70 }),
  input("2026-04-23", { project_progress: 65, output_count: 2, ai_hours: 3, ai_depth: 4 }),
  input("2026-04-24", { project_progress: 72, output_count: 3, ai_depth: 5, focus_score: 75 }),
  input("2026-04-25", { project_progress: 78, output_count: 3, ai_hours: 3.5, sleep_duration: 7 }),
  input("2026-04-26", { project_progress: 82, output_count: 3, ai_depth: 5, focus_score: 80 }),
  input("2026-04-27", { project_progress: 86, output_count: 4, ai_hours: 4, ai_depth: 5 }),
  input("2026-04-28", { project_progress: 90, output_count: 4, ai_depth: 5, focus_score: 84 })
];

export const demoScenarios: Record<DemoScenarioId, DemoScenario> = {
  academic: {
    id: "academic",
    label: "学业优先 Demo",
    description: "展示睡眠、深度学习和主线完成度逐步修复后的学业优先链路。",
    stageMode: "academic",
    inputs: academicInputs,
    planStatuses: {
      repair: "completed",
      reinforce: "in_progress",
      experiment: "completed"
    }
  },
  venture: {
    id: "venture",
    label: "项目优先 Demo",
    description: "展示项目推进、输出次数和 AI 深度持续走强后的项目优先链路。",
    stageMode: "venture",
    inputs: ventureInputs,
    planStatuses: {
      repair: "in_progress",
      reinforce: "completed",
      experiment: "completed"
    }
  }
};

function input(
  date: string,
  overrides: Partial<DailyBehaviorInput["values"]> = {}
): DailyBehaviorInput {
  return {
    date,
    values: {
      ai_hours: 1.5,
      ai_depth: 3,
      reading_time: 25,
      deep_study: 1,
      project_progress: 35,
      output_count: 1,
      sleep_duration: 7,
      exercise_score: 45,
      focus_score: 60,
      work_completion: 68,
      finance_action: 0,
      emotion_state: 0,
      ...overrides
    }
  };
}
