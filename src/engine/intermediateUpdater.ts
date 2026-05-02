import type { BehaviorScore } from "@/types/behavior";
import type { IntermediateFactorState } from "@/types/intermediate";
import { initialIntermediateFactors } from "./constants";
import { clamp } from "./math";
import { factorRules } from "./rules";

export function updateIntermediateFactors(
  scores: BehaviorScore[],
  previousFactors: IntermediateFactorState[] | undefined
): IntermediateFactorState[] {
  const base = previousFactors?.length ? previousFactors : initialIntermediateFactors;

  return base.map((factor) => {
    const delta = scores.reduce((sum, score) => {
      const weight = factorRules[score.factorId].intermediates[factor.id] ?? 0;
      return sum + score.finalScore * weight;
    }, 0);
    const nextScore = clamp(factor.score + delta, 0, 100);

    return {
      ...factor,
      score: round(nextScore),
      trend: round(nextScore - factor.score)
    };
  });
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
