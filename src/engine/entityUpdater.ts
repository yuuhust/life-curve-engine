import type { BehaviorScore } from "@/types/behavior";
import type { EntityState } from "@/types/entity";
import { initialEntities } from "./constants";
import { factorRules } from "./rules";
import { clamp } from "./math";

export function updateEntities(
  scores: BehaviorScore[],
  previousEntities: EntityState[] | undefined,
  date: string
): EntityState[] {
  const base = previousEntities?.length ? previousEntities : initialEntities;

  return base.map((entity) => {
    const delta = scores.reduce((sum, score) => {
      const weight = factorRules[score.factorId].entities[entity.id] ?? 0;
      return sum + score.finalScore * weight;
    }, 0);
    const nextScore = clamp(entity.score + delta, 0, 100);

    return {
      ...entity,
      score: round(nextScore),
      trend: round(nextScore - entity.score),
      updatedAt: date
    };
  });
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
