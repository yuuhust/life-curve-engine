import type { BehaviorScore } from "@/types/behavior";
import { describe, expect, it } from "vitest";
import { initialEntities, initialIntermediateFactors } from "../constants";
import { generateExplanations } from "../explanationGenerator";

const scores: BehaviorScore[] = [
  {
    factorId: "project_progress",
    rawValue: 60,
    normalizedScore: 1,
    streakModifier: 0.2,
    decayModifier: 0,
    diminishingModifier: 0,
    finalScore: 1.2
  },
  {
    factorId: "reading_time",
    rawValue: 0,
    normalizedScore: -2,
    streakModifier: 0,
    decayModifier: -0.25,
    diminishingModifier: 0,
    finalScore: -2.25
  }
];

describe("generateExplanations", () => {
  it("references behavior, entity trend, intermediate trend, streak, and decay", () => {
    const entities = initialEntities.map((entity) =>
      entity.id === "venture" ? { ...entity, score: 52, trend: 2 } : entity
    );
    const factors = initialIntermediateFactors.map((factor) =>
      factor.id === "opportunity_density" ? { ...factor, score: 53, trend: 3 } : factor
    );

    const explanations = generateExplanations(scores, entities, factors);
    const text = explanations.map((item) => `${item.title} ${item.summary}`).join("\n");

    expect(text).toContain("项目推进");
    expect(text).toContain("项目/创业体");
    expect(text).toContain("机会密度");
    expect(text).toContain("连续积累");
    expect(text).toContain("中断衰减");
  });
});
