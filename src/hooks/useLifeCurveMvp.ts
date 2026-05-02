"use client";

import { behaviorFactorDefinitions } from "@/data/behaviorFactors";
import { demoScenarios, type DemoScenarioId } from "@/data/demoScenarios";
import { createActionPlansFromAdvice, generateAdviceSummary } from "@/engine/advice";
import { initialEntities, initialIntermediateFactors } from "@/engine/constants";
import { generateNaturalSummary } from "@/engine/naturalLanguageSummary";
import { validateActionPlans } from "@/engine/planValidation";
import { generateReviewSummary } from "@/engine/review";
import { runContinuousFactorSimulation, runSingleFactorSimulation } from "@/engine/simulation";
import { createLifeCurveSnapshot } from "@/engine/snapshot";
import { getStageModeConfig, defaultStageModeId } from "@/engine/stageModes";
import {
  clearLifeCurveData,
  exportLifeCurveDataAsJson,
  loadDailyInputs,
  loadLatestSnapshot,
  loadPlanStatuses,
  loadSnapshots,
  loadStageModeSetting,
  saveDailyInput,
  savePlanStatus,
  saveSnapshot,
  saveStageModeSetting
} from "@/storage/localStorage";
import type { PlanStatus } from "@/types/advice";
import type { DailyBehaviorInput } from "@/types/behavior";
import type {
  ContinuousSimulationInput,
  ContinuousSimulationResult,
  SimulationInput,
  SimulationResult
} from "@/types/simulation";
import type { LifeCurveSnapshot } from "@/types/snapshot";
import type { StageModeId, UserStageModeSetting } from "@/types/stageMode";
import { useEffect, useState } from "react";

export function useLifeCurveMvp() {
  const [snapshot, setSnapshot] = useState<LifeCurveSnapshot | undefined>();
  const [snapshots, setSnapshots] = useState<LifeCurveSnapshot[]>([]);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | undefined>();
  const [planStatuses, setPlanStatuses] = useState<Record<string, PlanStatus>>({});
  const [stageModeSetting, setStageModeSetting] = useState<UserStageModeSetting>();
  const [continuousSimulationResult, setContinuousSimulationResult] = useState<
    ContinuousSimulationResult | undefined
  >();

  useEffect(() => {
    const storedSnapshots = loadSnapshots();
    if (!storedSnapshots.length && !loadDailyInputs().length) {
      loadDemoScenario("academic");
      return;
    }

    refreshStateFromStorage();
  }, []);

  function submitDailyInput(input: DailyBehaviorInput) {
    const history = loadDailyInputs().filter((item) => item.date < input.date);
    const nextSnapshot = createLifeCurveSnapshot(
      input,
      snapshot,
      history,
      stageModeSetting?.currentMode
    );
    saveDailyInput(input);
    saveSnapshot(nextSnapshot);
    setSnapshots(loadSnapshots());
    setSnapshot(nextSnapshot);
    setSimulationResult(undefined);
    setContinuousSimulationResult(undefined);
  }

  function updatePlanStatus(planId: string, status: PlanStatus) {
    savePlanStatus(planId, status);
    setPlanStatuses(loadPlanStatuses());
  }

  function updateStageMode(currentMode: StageModeId) {
    saveStageModeSetting(currentMode);
    setStageModeSetting(loadStageModeSetting());
  }

  function exportData() {
    const blob = new Blob([exportLifeCurveDataAsJson()], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `life-curve-export-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function clearData() {
    clearLifeCurveData();
    setSnapshot(undefined);
    setSnapshots([]);
    setStageModeSetting(loadStageModeSetting());
    setSimulationResult(undefined);
    setContinuousSimulationResult(undefined);
  }

  function loadDemoScenario(scenarioId: DemoScenarioId) {
    const scenario = demoScenarios[scenarioId];
    clearLifeCurveData();
    saveStageModeSetting(scenario.stageMode);

    const generatedSnapshots = scenario.inputs.reduce<LifeCurveSnapshot[]>((items, input) => {
      const previous = items.at(-1);
      const history = scenario.inputs.filter((item) => item.date < input.date);
      const nextSnapshot = createLifeCurveSnapshot(input, previous, history, scenario.stageMode);
      saveDailyInput(input);
      saveSnapshot(nextSnapshot);
      return [...items, nextSnapshot];
    }, []);

    Object.entries(scenario.planStatuses).forEach(([planId, status]) => {
      savePlanStatus(planId, status);
    });

    const latest = generatedSnapshots.at(-1);
    if (latest) {
      const history = scenario.inputs.filter((item) => item.date < latest.input.date);
      setSimulationResult(
        runSingleFactorSimulation(latest, getDemoSimulationInput(scenarioId), history)
      );
      setContinuousSimulationResult(
        runContinuousFactorSimulation(latest, getDemoContinuousSimulationInput(scenarioId), history)
      );
    }

    refreshStateFromStorage();
  }

  function refreshStateFromStorage() {
    setSnapshots(loadSnapshots());
    setSnapshot(loadLatestSnapshot());
    setPlanStatuses(loadPlanStatuses());
    setStageModeSetting(loadStageModeSetting());
  }

  function simulateSingleFactor(input: SimulationInput) {
    if (!snapshot) return;

    const history = loadDailyInputs().filter((item) => item.date < snapshot.input.date);
    setSimulationResult(runSingleFactorSimulation(snapshot, input, history));
  }

  function simulateContinuousFactor(input: ContinuousSimulationInput) {
    if (!snapshot) return;

    const history = loadDailyInputs().filter((item) => item.date < snapshot.input.date);
    setContinuousSimulationResult(runContinuousFactorSimulation(snapshot, input, history));
  }

  const currentStageMode = getStageModeConfig(stageModeSetting?.currentMode ?? defaultStageModeId);
  const reviewSummary = generateReviewSummary(snapshots, currentStageMode);
  const adviceSummary = generateAdviceSummary({
    continuousSimulation: continuousSimulationResult,
    currentSnapshot: snapshot,
    review: reviewSummary,
    stageMode: currentStageMode
  });
  const actionPlans = createActionPlansFromAdvice(adviceSummary, planStatuses);
  const planValidationSummary = validateActionPlans(actionPlans, snapshots);
  const naturalSummary = generateNaturalSummary({
    advice: adviceSummary,
    review: reviewSummary,
    stageMode: currentStageMode,
    validation: planValidationSummary
  });

  return {
    adviceSummary,
    actionPlans,
    behaviorFactorDefinitions,
    clearData,
    continuousSimulationResult,
    exportData,
    reviewSummary,
    planValidationSummary,
    naturalSummary,
    simulateContinuousFactor,
    simulateSingleFactor,
    simulationResult,
    submitDailyInput,
    snapshot,
    stageModeSetting,
    loadDemoScenario,
    updatePlanStatus,
    updateStageMode,
    viewModel: {
      compositeScore: snapshot?.compositeScore ?? 50,
      curvePoints: snapshot?.curvePoints ?? [],
      focusedCurveSeries: currentStageMode.curveFocus,
      hasHistory: snapshots.length > 0,
      entities: snapshot?.entities ?? initialEntities,
      explanations: snapshot?.explanations ?? [],
      intermediateFactors: snapshot?.intermediateFactors ?? initialIntermediateFactors
    }
  };
}

function getDemoSimulationInput(scenarioId: DemoScenarioId): SimulationInput {
  if (scenarioId === "venture") {
    return {
      factorId: "project_progress",
      value: 95
    };
  }

  return {
    factorId: "sleep_duration",
    value: 8
  };
}

function getDemoContinuousSimulationInput(
  scenarioId: DemoScenarioId
): ContinuousSimulationInput {
  if (scenarioId === "venture") {
    return {
      days: 7,
      factorId: "project_progress",
      value: 95
    };
  }

  return {
    days: 7,
    factorId: "ai_depth",
    value: 5
  };
}
