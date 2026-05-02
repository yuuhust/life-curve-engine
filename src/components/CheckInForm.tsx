"use client";

import type { DailyBehaviorInput } from "@/types/behavior";
import type { BehaviorFactorDefinition } from "@/types/behavior";
import { useMemo, useState } from "react";

type CheckInFormProps = {
  factors: BehaviorFactorDefinition[];
  onSubmit: (input: DailyBehaviorInput) => void;
};

export function CheckInForm({ factors, onSubmit }: CheckInFormProps) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [date, setDate] = useState(today);
  const [values, setValues] = useState(() =>
    Object.fromEntries(
      factors.map((factor) => [factor.id, factor.defaultValue])
    ) as DailyBehaviorInput["values"]
  );

  function updateValue(id: keyof DailyBehaviorInput["values"], value: number) {
    setValues((current) => ({
      ...current,
      [id]: value
    }));
  }

  return (
    <form
      className="panel checkin"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({ date, values });
      }}
    >
      <div className="formHeader">
        <div>
          <h2>Daily Check-in</h2>
          <p className="muted">录入今天的 12 个行为因子，生成第一版人生势能快照。</p>
        </div>
        <label className="dateField">
          日期
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
      </div>

      <div className="factorGrid">
        {factors.map((factor) => (
          <label className="factorField" key={factor.id}>
            <span className="factorTitle">
              {factor.label}
              {factor.unit ? <small>{factor.unit}</small> : null}
            </span>
            <span className="factorDescription">{factor.description}</span>
            <input
              type="number"
              min={factor.min}
              max={factor.max}
              step={factor.step}
              value={values[factor.id]}
              onChange={(event) => updateValue(factor.id, Number(event.target.value))}
            />
          </label>
        ))}
      </div>

      <button type="submit">生成今日曲线快照</button>
    </form>
  );
}
