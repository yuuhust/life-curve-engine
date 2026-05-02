import type { ExplanationItem } from "@/types/explanation";

type ExplanationPanelProps = {
  explanations: ExplanationItem[];
};

export function ExplanationPanel({ explanations }: ExplanationPanelProps) {
  return (
    <section className="panel">
      <h2>解释面板</h2>
      {explanations.length ? (
        <div className="explanationList">
          {explanations.map((item) => (
            <article className={`explanation ${item.severity}`} key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="emptyState">
          <strong>还没有解释结果</strong>
          <p>提交一次记录后，系统会解释哪些行为影响了实体、中间因子和曲线。</p>
        </div>
      )}
    </section>
  );
}
