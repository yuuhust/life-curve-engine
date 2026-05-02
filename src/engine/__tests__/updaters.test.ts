import type { BehaviorScore } from "@/types/behavior";
import { describe, expect, it } from "vitest";
import { initialEntities, initialIntermediateFactors } from "../constants";
import {
  calculateCompositeScore,
  defaultCompositeScoreWeights,
  generateCompositeCurve
} from "../curveGenerator";
import { updateEntities } from "../entityUpdater";
import { updateIntermediateFactors } from "../intermediateUpdater";

const projectProgressScore: BehaviorScore = {
  factorId: "project_progress",
  rawValue: 60,
  normalizedScore: 1,
  streakModifier: 0,
  decayModifier: 0,
  diminishingModifier: 0,
  finalScore: 1
};

describe("entity and intermediate updates", () => {
  it("updates the venture entity from project progress", () => {
    const entities = updateEntities([projectProgressScore], initialEntities, "2026-04-30");
    const venture = entities.find((entity) => entity.id === "venture");

    expect(venture?.score).toBe(51.4);
    expect(venture?.trend).toBe(1.4);
  });

  it("updates intermediate factors from project progress", () => {
    const factors = updateIntermediateFactors([projectProgressScore], initialIntermediateFactors);
    const opportunity = factors.find((factor) => factor.id === "opportunity_density");
    const execution = factors.find((factor) => factor.id === "execution_power");

    expect(opportunity?.score).toBe(51.1);
    expect(opportunity?.trend).toBe(1.1);
    expect(execution?.score).toBe(50.7);
  });
});

describe("calculateCompositeScore", () => {
  it("combines entity average, growth factors, and risk into one score", () => {
    const composite = calculateCompositeScore(initialEntities, initialIntermediateFactors);

    expect(composite).toBe(51.5);
  });

  it("keeps the default weighted formula equivalent to the previous result", () => {
    const composite = calculateCompositeScore(
      initialEntities,
      initialIntermediateFactors,
      defaultCompositeScoreWeights
    );

    expect(composite).toBe(51.5);
  });
});

describe("generateCompositeCurve", () => {
  it("generates base curve fields alongside the composite curve", () => {
    const points = generateCompositeCurve(51.5, initialEntities, initialIntermediateFactors, undefined);
    const point = points[0];

    expect(point).toMatchObject({
      dayIndex: 1,
      employment: 50,
      ai: 50,
      venture: 50,
      capital: 50,
      health: 51.5,
      composite: 51.5
    });
  });
});
