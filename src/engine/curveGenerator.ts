import type { CurveParameters, CurvePoint } from "@/types/curve";
import type { EntityId } from "@/types/entity";
import type { EntityState } from "@/types/entity";
import type { IntermediateFactorId } from "@/types/intermediate";
import type { IntermediateFactorState } from "@/types/intermediate";
import { clamp } from "./math";

export type CompositeScoreWeights = {
  entityWeights: Record<EntityId, number>;
  intermediateWeights: Record<IntermediateFactorId, number>;
  entityGroupWeight: number;
  intermediateGroupWeight: number;
  riskGroupWeight: number;
};

export const defaultCompositeScoreWeights: CompositeScoreWeights = {
  entityWeights: {
    self_core: 1,
    employment: 1,
    ai_system: 1,
    venture: 1,
    capital: 1,
    health: 1,
    knowledge: 1
  },
  intermediateWeights: {
    cognitive_growth: 1,
    execution_power: 1,
    leverage_level: 1,
    opportunity_density: 1,
    safety_floor: 1,
    recovery_rate: 1,
    compounding_power: 1,
    risk_exposure: 0
  },
  entityGroupWeight: 0.55,
  intermediateGroupWeight: 0.35,
  riskGroupWeight: 0.1
};

export function calculateCompositeScore(
  entities: EntityState[],
  factors: IntermediateFactorState[],
  weights: CompositeScoreWeights = defaultCompositeScoreWeights
): number {
  const entityAverage = calculateWeightedAverage(
    entities.map((entity) => ({
      score: entity.score,
      weight: weights.entityWeights[entity.id]
    }))
  );
  const growthAverage = calculateWeightedAverage(
    factors
      .filter((factor) => factor.id !== "risk_exposure")
      .map((factor) => ({
        score: factor.score,
        weight: weights.intermediateWeights[factor.id]
      }))
  );
  const risk = factors.find((factor) => factor.id === "risk_exposure")?.score ?? 35;
  const composite =
    entityAverage * weights.entityGroupWeight +
    growthAverage * weights.intermediateGroupWeight +
    (100 - risk) * weights.riskGroupWeight;

  return Math.round(clamp(composite, 0, 100) * 10) / 10;
}

export function calculateCurveParameters(
  factors: IntermediateFactorState[]
): CurveParameters {
  const get = (id: IntermediateFactorState["id"]) =>
    factors.find((factor) => factor.id === id)?.score ?? 50;

  return {
    slope: round((get("cognitive_growth") + get("execution_power") + get("compounding_power")) / 3),
    volatility: round(100 - (get("safety_floor") + get("recovery_rate")) / 2 + get("risk_exposure") * 0.25),
    recovery: round((get("recovery_rate") + get("safety_floor")) / 2),
    jumpProbability: round((get("leverage_level") + get("opportunity_density")) / 2)
  };
}

export function generateCompositeCurve(
  currentComposite: number,
  entities: EntityState[],
  factors: IntermediateFactorState[],
  previousCurve: CurvePoint[] | undefined
): CurvePoint[] {
  const history = previousCurve?.length ? previousCurve.slice(-13) : [];
  const nextPoint = {
    dayIndex: history.length ? history[history.length - 1].dayIndex + 1 : 1,
    ...calculateBaseCurveValues(entities, factors),
    composite: currentComposite
  };

  return [...history, nextPoint];
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function calculateWeightedAverage(items: Array<{ score: number; weight: number }>): number {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight === 0) return 0;
  return items.reduce((sum, item) => sum + item.score * item.weight, 0) / totalWeight;
}

function calculateBaseCurveValues(
  entities: EntityState[],
  factors: IntermediateFactorState[]
): Omit<CurvePoint, "dayIndex" | "composite"> {
  const entity = (id: EntityId) => entities.find((item) => item.id === id)?.score ?? 50;
  const factor = (id: IntermediateFactorId) => factors.find((item) => item.id === id)?.score ?? 50;

  return {
    employment: round(entity("employment") * 0.75 + factor("safety_floor") * 0.25),
    ai: round(entity("ai_system") * 0.7 + factor("leverage_level") * 0.3),
    venture: round(
      entity("venture") * 0.6 +
        factor("opportunity_density") * 0.25 +
        factor("execution_power") * 0.15
    ),
    capital: round(entity("capital") * 0.7 + factor("compounding_power") * 0.2 + factor("safety_floor") * 0.1),
    health: round(entity("health") * 0.7 + factor("recovery_rate") * 0.2 + (100 - factor("risk_exposure")) * 0.1)
  };
}
