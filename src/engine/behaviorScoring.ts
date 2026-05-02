import type { BehaviorScore, DailyBehaviorInput } from "@/types/behavior";
import {
  factorRules,
  getDecayProfile,
  getStreakProfile,
  normalizeBehaviorValue
} from "./rules";
import { behaviorScoringConfig } from "./config";

export function scoreDailyBehavior(
  input: DailyBehaviorInput,
  history: DailyBehaviorInput[] = []
): BehaviorScore[] {
  return Object.entries(input.values).map(([factorId, rawValue]) => {
    const typedFactorId = factorId as keyof DailyBehaviorInput["values"];
    const normalizedScore = normalizeBehaviorValue(typedFactorId, rawValue);
    const rule = factorRules[typedFactorId];
    const streakModifier = calculateStreakModifier(input, history, typedFactorId, normalizedScore);
    const decayModifier = calculateDecayModifier(input, history, typedFactorId, normalizedScore);
    const diminishingModifier =
      rule.isMultiplier || rule.isSlowVariable
        ? 0
        : normalizedScore === 2
          ? behaviorScoringConfig.diminishingModifier
          : 0;

    return {
      factorId: typedFactorId,
      rawValue,
      normalizedScore,
      streakModifier,
      decayModifier,
      diminishingModifier,
      finalScore: round(normalizedScore + streakModifier + decayModifier + diminishingModifier)
    };
  });
}

function calculateStreakModifier(
  input: DailyBehaviorInput,
  history: DailyBehaviorInput[],
  factorId: keyof DailyBehaviorInput["values"],
  normalizedScore: number
): number {
  const profile = getStreakProfile(factorId);
  if (!profile?.enabled || normalizedScore <= 0) return 0;

  const streakDays = countConsecutiveDays(input, history, factorId, (score) => score > 0);
  return getProfileModifier(streakDays, profile.bands);
}

function calculateDecayModifier(
  input: DailyBehaviorInput,
  history: DailyBehaviorInput[],
  factorId: keyof DailyBehaviorInput["values"],
  normalizedScore: number
): number {
  const profile = getDecayProfile(factorId);
  if (!profile?.enabled || normalizedScore > 0) return 0;

  const interruptedDays = countConsecutiveDays(input, history, factorId, (score) => score <= 0);
  return getProfileModifier(interruptedDays, profile.bands);
}

function countConsecutiveDays(
  input: DailyBehaviorInput,
  history: DailyBehaviorInput[],
  factorId: keyof DailyBehaviorInput["values"],
  predicate: (score: number) => boolean
): number {
  const byDate = new Map(history.map((item) => [item.date, item]));
  let cursor = parseDate(input.date);
  let days = 1;

  while (true) {
    cursor = addDays(cursor, -1);
    const previous = byDate.get(formatDate(cursor));
    if (!previous) return days;

    const previousScore = normalizeBehaviorValue(factorId, previous.values[factorId]);
    if (!predicate(previousScore)) return days;

    days += 1;
  }
}

function getProfileModifier(
  days: number,
  bands: Array<{ minDays: number; modifier: number }>
): number {
  return bands.find((band) => days >= band.minDays)?.modifier ?? 0;
}

function parseDate(date: string): Date {
  return new Date(`${date}T00:00:00Z`);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
