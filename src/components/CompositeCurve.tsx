"use client";

import type { CurvePoint, CurveSeriesKey } from "@/types/curve";
import { useEffect, useMemo, useState } from "react";

const curveSeriesLabels: Record<CurveSeriesKey, string> = {
  composite: "复合",
  ai: "AI",
  venture: "项目",
  health: "健康",
  employment: "就业",
  capital: "资本"
};

const curveSeries: CurveSeriesKey[] = [
  "composite",
  "ai",
  "venture",
  "health",
  "employment",
  "capital"
];

type CompositeCurveProps = {
  focusedSeries?: CurveSeriesKey[];
  points: CurvePoint[];
  score: number;
};

export function CompositeCurve({ focusedSeries = ["composite"], points, score }: CompositeCurveProps) {
  const defaultSeries = focusedSeries[0] ?? "composite";
  const [selectedSeries, setSelectedSeries] = useState<CurveSeriesKey>(defaultSeries);
  const orderedSeries = useMemo(() => prioritizeSeries(curveSeries, focusedSeries), [focusedSeries]);
  const width = 520;
  const height = 180;
  const padding = 18;
  const path = buildPath(points, selectedSeries, width, height, padding);
  const latestValue = points.at(-1)?.[selectedSeries] ?? (selectedSeries === "composite" ? score : 50);

  useEffect(() => {
    setSelectedSeries(defaultSeries);
  }, [defaultSeries]);

  return (
    <section className="panel">
      <div className="metricRow">
        <div>
          <h2>{curveSeriesLabels[selectedSeries]}曲线</h2>
          <p className="muted">当前阶段优先展示 {curveSeriesLabels[defaultSeries]}，也可基于同一份 CurvePoint 数据切换查看。</p>
        </div>
        <strong className="score">{latestValue.toFixed(1)}</strong>
      </div>
      <div className="curveTabs">
        {orderedSeries.map((series) => (
          <button
            className={series === selectedSeries ? "tabButton active" : "tabButton"}
            key={series}
            type="button"
            onClick={() => setSelectedSeries(series)}
          >
            {curveSeriesLabels[series]}
          </button>
        ))}
      </div>
      {points.length ? (
        <svg className="curve" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${curveSeriesLabels[selectedSeries]}曲线`}>
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} />
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} />
          {path ? <path d={path} /> : null}
          {points.map((point, index) => {
            const x = getX(index, points.length, width, padding);
            const y = getY(point[selectedSeries], height, padding);
            return <circle cx={x} cy={y} r="4" key={`${point.dayIndex}-${point[selectedSeries]}`} />;
          })}
        </svg>
      ) : (
        <div className="emptyState">
          <strong>还没有曲线数据</strong>
          <p>完成一次 Daily Check-in 后，这里会生成当前阶段优先关注的曲线。</p>
        </div>
      )}
    </section>
  );
}

function prioritizeSeries(
  series: CurveSeriesKey[],
  focusedSeries: CurveSeriesKey[]
): CurveSeriesKey[] {
  return [...series].sort((a, b) => {
    const aIndex = focusedSeries.indexOf(a);
    const bIndex = focusedSeries.indexOf(b);
    const aRank = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
    const bRank = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;

    if (aRank !== bRank) return aRank - bRank;
    return series.indexOf(a) - series.indexOf(b);
  });
}

function buildPath(
  points: CurvePoint[],
  selectedSeries: CurveSeriesKey,
  width: number,
  height: number,
  padding: number
): string {
  if (!points.length) return "";

  return points
    .map((point, index) => {
      const command = index === 0 ? "M" : "L";
      return `${command} ${getX(index, points.length, width, padding)} ${getY(point[selectedSeries], height, padding)}`;
    })
    .join(" ");
}

function getX(index: number, length: number, width: number, padding: number): number {
  if (length <= 1) return width / 2;
  return padding + (index / (length - 1)) * (width - padding * 2);
}

function getY(value: number, height: number, padding: number): number {
  return height - padding - (value / 100) * (height - padding * 2);
}
