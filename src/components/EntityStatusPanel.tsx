import type { EntityState } from "@/types/entity";

type EntityStatusPanelProps = {
  entities: EntityState[];
};

export function EntityStatusPanel({ entities }: EntityStatusPanelProps) {
  return (
    <section className="panel">
      <h2>主体/实体状态</h2>
      <div className="statusList">
        {entities.map((entity) => (
          <div className="statusItem" key={entity.id}>
            <span>{entity.label}</span>
            <strong>{entity.score.toFixed(1)}</strong>
            <small className={entity.trend >= 0 ? "positiveText" : "warningText"}>
              {entity.trend >= 0 ? "+" : ""}
              {entity.trend.toFixed(1)}
            </small>
          </div>
        ))}
      </div>
    </section>
  );
}
