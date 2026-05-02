import type { DailyBehaviorInput } from "@/types/behavior";
import type { LifeCurveSnapshot } from "@/types/snapshot";
import { scoreDailyBehavior } from "./behaviorScoring";
import {
  calculateCompositeScore,
  calculateCurveParameters,
  generateCompositeCurve
} from "./curveGenerator";
import { updateEntities } from "./entityUpdater";
import { generateExplanations } from "./explanationGenerator";
import { updateIntermediateFactors } from "./intermediateUpdater";
import { defaultStageModeId, getCompositeScoreWeightsForStageMode } from "./stageModes";
import type { StageModeId } from "@/types/stageMode";

export function createLifeCurveSnapshot(
  input: DailyBehaviorInput,
  previousSnapshot?: LifeCurveSnapshot,
  history: DailyBehaviorInput[] = [],
  stageMode: StageModeId = previousSnapshot?.stageMode ?? defaultStageModeId
): LifeCurveSnapshot {
  const behaviorScores = scoreDailyBehavior(input, history);
  const entities = updateEntities(behaviorScores, previousSnapshot?.entities, input.date);
  const intermediateFactors = updateIntermediateFactors(
    behaviorScores,
    previousSnapshot?.intermediateFactors
  );
  const compositeScore = calculateCompositeScore(
    entities,
    intermediateFactors,
    getCompositeScoreWeightsForStageMode(stageMode)
  );
  const curveParameters = calculateCurveParameters(intermediateFactors);
  const curvePoints = generateCompositeCurve(
    compositeScore,
    entities,
    intermediateFactors,
    previousSnapshot?.curvePoints
  );
  const explanations = generateExplanations(behaviorScores, entities, intermediateFactors);

  return {
    date: input.date,
    input,
    behaviorScores,
    entities,
    intermediateFactors,
    curveParameters,
    curvePoints,
    explanations,
    compositeScore,
    stageMode
  };
}
