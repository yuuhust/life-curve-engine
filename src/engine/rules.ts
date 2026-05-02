import type { BehaviorFactorId, NormalizedScore } from "@/types/behavior";
import type { EntityId } from "@/types/entity";
import type { IntermediateFactorId } from "@/types/intermediate";

type ThresholdBand = {
  max: number;
  score: NormalizedScore;
};

type StreakProfile = {
  enabled: boolean;
  trigger: "positive";
  bands: Array<{
    minDays: number;
    modifier: number;
  }>;
};

type DecayProfile = {
  enabled: boolean;
  trigger: "nonPositive";
  bands: Array<{
    minDays: number;
    modifier: number;
  }>;
};

type FactorRule = {
  factorId: BehaviorFactorId;
  entities: Partial<Record<EntityId, number>>;
  intermediates: Partial<Record<IntermediateFactorId, number>>;
  curveWeight: number;
  thresholds: ThresholdBand[];
  isMultiplier?: boolean;
  isSlowVariable?: boolean;
  streakEligible?: boolean;
  decayEligible?: boolean;
  streakProfile?: StreakProfile;
  decayProfile?: DecayProfile;
};

export const defaultStreakProfile: StreakProfile = {
  enabled: true,
  trigger: "positive",
  bands: [
    { minDays: 14, modifier: 0.5 },
    { minDays: 7, modifier: 0.35 },
    { minDays: 4, modifier: 0.2 },
    { minDays: 2, modifier: 0.1 }
  ]
};

export const defaultDecayProfile: DecayProfile = {
  enabled: true,
  trigger: "nonPositive",
  bands: [
    { minDays: 7, modifier: -0.4 },
    { minDays: 4, modifier: -0.25 },
    { minDays: 2, modifier: -0.1 }
  ]
};

export const factorRules: Record<BehaviorFactorId, FactorRule> = {
  ai_hours: {
    factorId: "ai_hours",
    thresholds: [
      { max: 0, score: -2 },
      { max: 0.49, score: -1 },
      { max: 0.99, score: 0 },
      { max: 2.5, score: 1 },
      { max: Number.POSITIVE_INFINITY, score: 2 }
    ],
    entities: { ai_system: 1.2 },
    intermediates: {
      leverage_level: 0.9,
      execution_power: 0.4,
      opportunity_density: 0.5
    },
    curveWeight: 0.8
  },
  ai_depth: {
    factorId: "ai_depth",
    thresholds: [
      { max: 1, score: -2 },
      { max: 2, score: -1 },
      { max: 3, score: 0 },
      { max: 4, score: 1 },
      { max: Number.POSITIVE_INFINITY, score: 2 }
    ],
    entities: { ai_system: 1.4, knowledge: 0.6 },
    intermediates: {
      leverage_level: 1.2,
      cognitive_growth: 0.7,
      compounding_power: 0.7
    },
    curveWeight: 1.2,
    isSlowVariable: true,
    streakEligible: true,
    decayEligible: true
  },
  reading_time: {
    factorId: "reading_time",
    thresholds: [
      { max: 0, score: -2 },
      { max: 14, score: -1 },
      { max: 29, score: 0 },
      { max: 59, score: 1 },
      { max: Number.POSITIVE_INFINITY, score: 2 }
    ],
    entities: { knowledge: 1 },
    intermediates: {
      cognitive_growth: 0.7,
      compounding_power: 0.5
    },
    curveWeight: 0.6,
    isSlowVariable: true,
    streakEligible: true,
    decayEligible: true
  },
  deep_study: {
    factorId: "deep_study",
    thresholds: [
      { max: 0, score: -2 },
      { max: 0.49, score: -1 },
      { max: 0.99, score: 0 },
      { max: 1.99, score: 1 },
      { max: Number.POSITIVE_INFINITY, score: 2 }
    ],
    entities: { self_core: 0.9, knowledge: 0.8 },
    intermediates: {
      cognitive_growth: 0.9,
      execution_power: 0.5
    },
    curveWeight: 0.9,
    isSlowVariable: true,
    streakEligible: true,
    decayEligible: true
  },
  project_progress: {
    factorId: "project_progress",
    thresholds: [
      { max: 0, score: -2 },
      { max: 19, score: -1 },
      { max: 49, score: 0 },
      { max: 79, score: 1 },
      { max: Number.POSITIVE_INFINITY, score: 2 }
    ],
    entities: { venture: 1.4 },
    intermediates: {
      execution_power: 0.7,
      opportunity_density: 1.1,
      leverage_level: 0.4
    },
    curveWeight: 1.3,
    streakEligible: true,
    decayEligible: true
  },
  output_count: {
    factorId: "output_count",
    thresholds: [
      { max: 0, score: -2 },
      { max: 1, score: 1 },
      { max: Number.POSITIVE_INFINITY, score: 2 }
    ],
    entities: { self_core: 0.5, venture: 0.8 },
    intermediates: {
      execution_power: 0.5,
      opportunity_density: 0.8
    },
    curveWeight: 0.8,
    streakEligible: true
  },
  sleep_duration: {
    factorId: "sleep_duration",
    thresholds: [
      { max: 4.99, score: -2 },
      { max: 5.99, score: -1 },
      { max: 6.99, score: 0 },
      { max: 7.49, score: 1 },
      { max: 8.5, score: 2 },
      { max: 10, score: -1 },
      { max: Number.POSITIVE_INFINITY, score: -2 }
    ],
    entities: { health: 1.5 },
    intermediates: {
      recovery_rate: 1.1,
      execution_power: 0.6,
      safety_floor: 0.8,
      risk_exposure: -0.8
    },
    curveWeight: 1.1,
    isMultiplier: true,
    streakEligible: true
  },
  exercise_score: {
    factorId: "exercise_score",
    thresholds: [
      { max: 20, score: -2 },
      { max: 40, score: -1 },
      { max: 60, score: 0 },
      { max: 80, score: 1 },
      { max: Number.POSITIVE_INFINITY, score: 2 }
    ],
    entities: { health: 1 },
    intermediates: {
      recovery_rate: 0.8,
      execution_power: 0.4,
      risk_exposure: -0.5
    },
    curveWeight: 0.7,
    isSlowVariable: true,
    streakEligible: true,
    decayEligible: true
  },
  focus_score: {
    factorId: "focus_score",
    thresholds: [
      { max: 20, score: -2 },
      { max: 40, score: -1 },
      { max: 60, score: 0 },
      { max: 80, score: 1 },
      { max: Number.POSITIVE_INFINITY, score: 2 }
    ],
    entities: { self_core: 0.8, health: 0.3 },
    intermediates: {
      execution_power: 1,
      leverage_level: 0.6
    },
    curveWeight: 1,
    isMultiplier: true,
    streakEligible: true
  },
  work_completion: {
    factorId: "work_completion",
    thresholds: [
      { max: 20, score: -2 },
      { max: 40, score: -1 },
      { max: 60, score: 0 },
      { max: 80, score: 1 },
      { max: Number.POSITIVE_INFINITY, score: 2 }
    ],
    entities: { employment: 1.3, self_core: 0.5 },
    intermediates: {
      safety_floor: 1,
      execution_power: 0.8
    },
    curveWeight: 1.2,
    isSlowVariable: true,
    streakEligible: true,
    decayEligible: true
  },
  finance_action: {
    factorId: "finance_action",
    thresholds: [
      { max: -2, score: -2 },
      { max: -1, score: -1 },
      { max: 0, score: 0 },
      { max: 1, score: 1 },
      { max: Number.POSITIVE_INFINITY, score: 2 }
    ],
    entities: { capital: 1 },
    intermediates: {
      safety_floor: 0.7,
      compounding_power: 0.8,
      risk_exposure: -0.4
    },
    curveWeight: 0.6,
    isSlowVariable: true,
    streakEligible: true,
    decayEligible: true
  },
  emotion_state: {
    factorId: "emotion_state",
    thresholds: [
      { max: -2, score: -2 },
      { max: -1, score: -1 },
      { max: 0, score: 0 },
      { max: 1, score: 1 },
      { max: Number.POSITIVE_INFINITY, score: 2 }
    ],
    entities: { health: 0.7, self_core: 0.4 },
    intermediates: {
      execution_power: 0.5,
      recovery_rate: 0.6,
      risk_exposure: -0.7
    },
    curveWeight: 0.8,
    isMultiplier: true
  }
};

export function normalizeBehaviorValue(
  factorId: BehaviorFactorId,
  value: number
): NormalizedScore {
  const band = factorRules[factorId].thresholds.find((threshold) => value <= threshold.max);
  return band?.score ?? 0;
}

export function getStreakProfile(factorId: BehaviorFactorId): StreakProfile | undefined {
  const rule = factorRules[factorId];
  if (!rule.streakEligible) return undefined;
  return rule.streakProfile ?? defaultStreakProfile;
}

export function getDecayProfile(factorId: BehaviorFactorId): DecayProfile | undefined {
  const rule = factorRules[factorId];
  if (!rule.decayEligible) return undefined;
  return rule.decayProfile ?? defaultDecayProfile;
}
