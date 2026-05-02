export type BehaviorFactorId =
  | "ai_hours"
  | "ai_depth"
  | "reading_time"
  | "deep_study"
  | "project_progress"
  | "output_count"
  | "sleep_duration"
  | "exercise_score"
  | "focus_score"
  | "work_completion"
  | "finance_action"
  | "emotion_state";

export type BehaviorFactorInputType = "number" | "scale" | "emotion";

export type DailyBehaviorInput = {
  date: string;
  values: Record<BehaviorFactorId, number>;
};

export type NormalizedScore = -2 | -1 | 0 | 1 | 2;

export type BehaviorScore = {
  factorId: BehaviorFactorId;
  rawValue: number;
  normalizedScore: NormalizedScore;
  streakModifier: number;
  decayModifier: number;
  diminishingModifier: number;
  finalScore: number;
};

export type BehaviorFactorDefinition = {
  id: BehaviorFactorId;
  label: string;
  description: string;
  inputType: BehaviorFactorInputType;
  min: number;
  max: number;
  step: number;
  unit?: string;
  defaultValue: number;
};
