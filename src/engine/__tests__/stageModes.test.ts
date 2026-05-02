import { describe, expect, it } from "vitest";
import { initialEntities, initialIntermediateFactors } from "../constants";
import { calculateCompositeScore, defaultCompositeScoreWeights } from "../curveGenerator";
import {
  defaultStageModeId,
  getCompositeScoreWeightsForStageMode,
  stageModeConfigs
} from "../stageModes";

describe("stage modes", () => {
  it("implements the default mode and the first five V2 modes", () => {
    expect(defaultStageModeId).toBe("balanced");
    expect(Object.keys(stageModeConfigs)).toEqual([
      "balanced",
      "academic",
      "career",
      "venture",
      "health_recovery",
      "ai_leverage"
    ]);
  });

  it("keeps balanced mode equivalent to the previous default score", () => {
    const defaultScore = calculateCompositeScore(
      initialEntities,
      initialIntermediateFactors,
      defaultCompositeScoreWeights
    );
    const balancedScore = calculateCompositeScore(
      initialEntities,
      initialIntermediateFactors,
      getCompositeScoreWeightsForStageMode("balanced")
    );

    expect(balancedScore).toBe(defaultScore);
  });

  it("creates explainable differences across stage modes when focused scores diverge", () => {
    const entities = initialEntities.map((entity) => {
      if (entity.id === "venture") return { ...entity, score: 80 };
      if (entity.id === "health") return { ...entity, score: 30 };
      return entity;
    });
    const factors = initialIntermediateFactors.map((factor) => {
      if (factor.id === "opportunity_density") return { ...factor, score: 80 };
      if (factor.id === "recovery_rate") return { ...factor, score: 30 };
      return factor;
    });

    const ventureScore = calculateCompositeScore(
      entities,
      factors,
      getCompositeScoreWeightsForStageMode("venture")
    );
    const healthScore = calculateCompositeScore(
      entities,
      factors,
      getCompositeScoreWeightsForStageMode("health_recovery")
    );

    expect(ventureScore).toBeGreaterThan(healthScore);
  });
});
