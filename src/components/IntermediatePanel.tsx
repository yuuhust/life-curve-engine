import type { IntermediateFactorState } from "@/types/intermediate";

type IntermediatePanelProps = {
  factors: IntermediateFactorState[];
};

export function IntermediatePanel({ factors }: IntermediatePanelProps) {
  return (
    <section className="panel">
      <h2>中间因子</h2>
      <div className="statusList">
        {factors.map((factor) => (
          <div className="statusItem" key={factor.id}>
            <span>{factor.label}</span>
            <strong>{factor.score.toFixed(1)}</strong>
            <small className={factor.trend >= 0 ? "positiveText" : "warningText"}>
              {factor.trend >= 0 ? "+" : ""}
              {factor.trend.toFixed(1)}
            </small>
          </div>
        ))}
      </div>
    </section>
  );
}
