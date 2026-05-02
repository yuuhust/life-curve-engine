"use client";

import { stageModeConfigs } from "@/engine/stageModes";
import type { StageModeId, UserStageModeSetting } from "@/types/stageMode";

type StageModePanelProps = {
  setting?: UserStageModeSetting;
  onChange: (mode: StageModeId) => void;
};

export function StageModePanel({ onChange, setting }: StageModePanelProps) {
  const currentMode = setting?.currentMode ?? "balanced";
  const currentConfig = stageModeConfigs[currentMode];

  return (
    <section className="panel stageModePanel">
      <div>
        <h2>阶段模式</h2>
        <p className="muted">{currentConfig.description}</p>
      </div>
      <select value={currentMode} onChange={(event) => onChange(event.target.value as StageModeId)}>
        {Object.values(stageModeConfigs).map((mode) => (
          <option key={mode.id} value={mode.id}>
            {mode.label}
          </option>
        ))}
      </select>
    </section>
  );
}
