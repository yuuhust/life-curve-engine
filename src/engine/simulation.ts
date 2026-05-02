import type { DailyBehaviorInput } from "@/types/behavior";
import type { CurveSeriesKey } from "@/types/curve";
import type { EntityId, EntityState } from "@/types/entity";
import type { IntermediateFactorId, IntermediateFactorState } from "@/types/intermediate";
import type {
  ContinuousSimulationInput,
  ContinuousSimulationResult,
  SimulationDifference,
  SimulationFactorId,
  SimulationInput,
  SimulationResult
} from "@/types/simulation";
import type { LifeCurveSnapshot } from "@/types/snapshot";
import { createLifeCurveSnapshot } from "./snapshot";

export const supportedSimulationFactors: SimulationFactorId[] = [
  "sleep_duration",
  "ai_depth",
  "project_progress"
];

const simulationFactorLabels: Record<SimulationFactorId, string> = {
  sleep_duration: "睡眠时长",
  ai_depth: "AI 协作深度",
  project_progress: "项目推进度"
};

const curveLabels: Record<CurveSeriesKey, string> = {
  composite: "复合曲线",
  employment: "就业曲线",
  ai: "AI 曲线",
  venture: "项目曲线",
  capital: "资本曲线",
  health: "健康曲线"
};

export function runSingleFactorSimulation(
  currentSnapshot: LifeCurveSnapshot,
  simulation: SimulationInput,
  history: DailyBehaviorInput[] = []
): SimulationResult {
  const simulatedInput: DailyBehaviorInput = {
    ...currentSnapshot.input,
    values: {
      ...currentSnapshot.input.values,
      [simulation.factorId]: simulation.value
    }
  };
  const simulatedSnapshot = createLifeCurveSnapshot(simulatedInput, currentSnapshot, history);
  const beforeComposite = currentSnapshot.compositeScore;
  const afterComposite = simulatedSnapshot.compositeScore;
  const delta = round(afterComposite - beforeComposite);
  const biggestCurveChange = getBiggestCurveChange(currentSnapshot, simulatedSnapshot);
  const biggestEntityChange = getBiggestEntityChange(
    currentSnapshot.entities,
    simulatedSnapshot.entities
  );
  const biggestIntermediateChange = getBiggestIntermediateChange(
    currentSnapshot.intermediateFactors,
    simulatedSnapshot.intermediateFactors
  );

  return {
    input: simulation,
    beforeComposite,
    afterComposite,
    delta,
    biggestCurveChange,
    biggestEntityChange,
    biggestIntermediateChange,
    explanation: buildSimulationExplanation(
      simulation.factorId,
      simulation.value,
      delta,
      biggestEntityChange,
      biggestIntermediateChange,
      biggestCurveChange
    ),
    snapshot: simulatedSnapshot
  };
}

export function runContinuousFactorSimulation(
  currentSnapshot: LifeCurveSnapshot,
  simulation: ContinuousSimulationInput,
  history: DailyBehaviorInput[] = []
): ContinuousSimulationResult {
  let previousSnapshot = currentSnapshot;
  const simulatedSnapshots: LifeCurveSnapshot[] = [];
  let rollingHistory = [...history, currentSnapshot.input];

  for (let day = 1; day <= simulation.days; day += 1) {
    const simulatedInput: DailyBehaviorInput = {
      date: addDays(currentSnapshot.date, day),
      values: {
        ...currentSnapshot.input.values,
        [simulation.factorId]: simulation.value
      }
    };
    const nextSnapshot = createLifeCurveSnapshot(simulatedInput, previousSnapshot, rollingHistory);
    simulatedSnapshots.push(nextSnapshot);
    rollingHistory = [...rollingHistory, simulatedInput];
    previousSnapshot = nextSnapshot;
  }

  const finalSnapshot = simulatedSnapshots.at(-1) ?? currentSnapshot;
  const biggestCurveChange = getBiggestCurveChange(currentSnapshot, finalSnapshot);
  const biggestEntityChange = getBiggestEntityChange(currentSnapshot.entities, finalSnapshot.entities);
  const biggestIntermediateChange = getBiggestIntermediateChange(
    currentSnapshot.intermediateFactors,
    finalSnapshot.intermediateFactors
  );
  const beforeComposite = currentSnapshot.compositeScore;
  const afterComposite = finalSnapshot.compositeScore;
  const delta = round(afterComposite - beforeComposite);

  return {
    input: simulation,
    days: simulation.days,
    beforeComposite,
    afterComposite,
    delta,
    biggestCurveChange,
    biggestEntityChange,
    biggestIntermediateChange,
    explanation: `连续 ${simulation.days} 天将${simulationFactorLabels[simulation.factorId]}保持为 ${simulation.value} → ${biggestEntityChange.label} ${formatDelta(biggestEntityChange.delta)}、${biggestIntermediateChange.label} ${formatDelta(biggestIntermediateChange.delta)} → ${biggestCurveChange.label} ${formatDelta(biggestCurveChange.delta)}，最终复合分数${delta >= 0 ? "提升" : "下降"} ${Math.abs(delta).toFixed(1)}。`,
    snapshot: finalSnapshot,
    snapshots: simulatedSnapshots
  };
}

function buildSimulationExplanation(
  factorId: SimulationFactorId,
  value: number,
  delta: number,
  entityChange: SimulationDifference<EntityId>,
  intermediateChange: SimulationDifference<IntermediateFactorId>,
  curveChange: SimulationDifference<CurveSeriesKey>
): string {
  const label = simulationFactorLabels[factorId];
  const amount = Math.abs(delta).toFixed(1);
  const compositeText =
    delta === 0
      ? "复合分数基本不变"
      : `复合分数${delta > 0 ? "提升" : "下降"} ${amount}`;

  return `调整${label}为 ${value} → ${entityChange.label} ${formatDelta(entityChange.delta)}、${intermediateChange.label} ${formatDelta(intermediateChange.delta)} → ${curveChange.label} ${formatDelta(curveChange.delta)}，最终${compositeText}。`;
}

function getBiggestCurveChange(
  before: LifeCurveSnapshot,
  after: LifeCurveSnapshot
): SimulationDifference<CurveSeriesKey> {
  const beforePoint = before.curvePoints.at(-1);
  const afterPoint = after.curvePoints.at(-1);
  const series: CurveSeriesKey[] = [
    "composite",
    "ai",
    "venture",
    "health",
    "employment",
    "capital"
  ];

  return getBiggestDifference(
    series.map((id) => ({
      id,
      label: curveLabels[id],
      before: beforePoint?.[id] ?? 0,
      after: afterPoint?.[id] ?? 0
    }))
  );
}

function getBiggestEntityChange(
  before: EntityState[],
  after: EntityState[]
): SimulationDifference<EntityId> {
  return getBiggestDifference(
    before.map((item) => {
      const next = after.find((entity) => entity.id === item.id);
      return {
        id: item.id,
        label: item.label,
        before: item.score,
        after: next?.score ?? item.score
      };
    })
  );
}

function getBiggestIntermediateChange(
  before: IntermediateFactorState[],
  after: IntermediateFactorState[]
): SimulationDifference<IntermediateFactorId> {
  return getBiggestDifference(
    before.map((item) => {
      const next = after.find((factor) => factor.id === item.id);
      return {
        id: item.id,
        label: item.label,
        before: item.score,
        after: next?.score ?? item.score
      };
    })
  );
}

function getBiggestDifference<TId extends string>(
  items: Array<Omit<SimulationDifference<TId>, "delta">>
): SimulationDifference<TId> {
  return items
    .map((item) => ({
      ...item,
      delta: round(item.after - item.before)
    }))
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))[0];
}

function formatDelta(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}`;
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function addDays(date: string, days: number): string {
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}
