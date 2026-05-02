"use client";

import { supportedSimulationFactors } from "@/engine/simulation";
import { simulationConfig } from "@/engine/config";
import type { BehaviorFactorDefinition } from "@/types/behavior";
import type {
  ContinuousSimulationInput,
  ContinuousSimulationResult,
  SimulationFactorId,
  SimulationInput,
  SimulationResult
} from "@/types/simulation";
import { useMemo, useState } from "react";

type SimulationPanelProps = {
  factors: BehaviorFactorDefinition[];
  onContinuousSimulate: (input: ContinuousSimulationInput) => void;
  onSimulate: (input: SimulationInput) => void;
  continuousResult?: ContinuousSimulationResult;
  result?: SimulationResult;
};

export function SimulationPanel({
  continuousResult,
  factors,
  onContinuousSimulate,
  onSimulate,
  result
}: SimulationPanelProps) {
  const availableFactors = useMemo(
    () =>
      supportedSimulationFactors
        .map((id) => factors.find((factor) => factor.id === id))
        .filter((factor): factor is BehaviorFactorDefinition => Boolean(factor)),
    [factors]
  );
  const [factorId, setFactorId] = useState<SimulationFactorId>("sleep_duration");
  const selectedFactor = availableFactors.find((factor) => factor.id === factorId);
  const [value, setValue] = useState(selectedFactor?.defaultValue ?? 7.5);
  const [days, setDays] = useState(simulationConfig.defaultContinuousDays);

  function updateFactor(nextFactorId: SimulationFactorId) {
    const nextFactor = availableFactors.find((factor) => factor.id === nextFactorId);
    setFactorId(nextFactorId);
    setValue(nextFactor?.defaultValue ?? 0);
  }

  return (
    <section className="panel simulationPanel">
      <div>
        <h2>模拟</h2>
        <p className="muted">单次调整或连续测试，不写入历史记录。</p>
      </div>

      <div className="simulationControls">
        <label>
          因子
          <select
            value={factorId}
            onChange={(event) => updateFactor(event.target.value as SimulationFactorId)}
          >
            {availableFactors.map((factor) => (
              <option key={factor.id} value={factor.id}>
                {factor.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          假设值
          <input
            type="number"
            min={selectedFactor?.min}
            max={selectedFactor?.max}
            step={selectedFactor?.step}
            value={value}
            onChange={(event) => setValue(Number(event.target.value))}
          />
        </label>
        <button type="button" onClick={() => onSimulate({ factorId, value })}>
          运行模拟
        </button>
        <button
          className="secondaryButton"
          type="button"
          onClick={() => onContinuousSimulate({ factorId, value, days })}
        >
          连续模拟
        </button>
      </div>

      <label className="daysField">
        连续天数
        <input
          type="number"
          min={simulationConfig.minContinuousDays}
          max={simulationConfig.maxContinuousDays}
          step={1}
          value={days}
          onChange={(event) => setDays(Number(event.target.value))}
        />
      </label>

      {result ? (
        <div className="simulationResult">
          <div className="comparisonGrid">
            <div>
              <span className="comparisonLabel">当前方案</span>
              <strong>{result.beforeComposite.toFixed(1)}</strong>
            </div>
            <div>
              <span className="comparisonLabel">模拟方案</span>
              <strong>{result.afterComposite.toFixed(1)}</strong>
            </div>
            <div>
              <span className="comparisonLabel">差异</span>
              <strong className={result.delta >= 0 ? "positiveText" : "warningText"}>
                {formatDelta(result.delta)}
              </strong>
            </div>
          </div>
          <div className="differenceList">
            <DifferenceRow title="基础曲线" difference={result.biggestCurveChange} />
            <DifferenceRow title="实体" difference={result.biggestEntityChange} />
            <DifferenceRow title="中间因子" difference={result.biggestIntermediateChange} />
          </div>
          <p>{result.explanation}</p>
        </div>
      ) : (
        <div className="emptyState">
          <strong>还没有单次模拟结果</strong>
          <p>选择一个因子和假设值，运行模拟后会看到当前方案与模拟方案的差异。</p>
        </div>
      )}

      {continuousResult ? (
        <div className="simulationResult">
          <strong>
            连续 {continuousResult.days} 天：{continuousResult.beforeComposite.toFixed(1)} →{" "}
            {continuousResult.afterComposite.toFixed(1)}
          </strong>
          <p>{continuousResult.explanation}</p>
        </div>
      ) : (
        <div className="emptyState">
          <strong>还没有连续模拟结果</strong>
          <p>运行连续模拟后，可以看到单因子连续改善 N 天对复合分数的影响。</p>
        </div>
      )}
    </section>
  );
}

function DifferenceRow({
  difference,
  title
}: {
  difference: {
    label: string;
    before: number;
    after: number;
    delta: number;
  };
  title: string;
}) {
  return (
    <div className="differenceRow">
      <span>{title}</span>
      <strong>{difference.label}</strong>
      <small className={difference.delta >= 0 ? "positiveText" : "warningText"}>
        {difference.before.toFixed(1)} → {difference.after.toFixed(1)} ({formatDelta(difference.delta)})
      </small>
    </div>
  );
}

function formatDelta(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}`;
}
