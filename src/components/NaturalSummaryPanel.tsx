"use client";

import type { NaturalSummaryOutput } from "@/types/naturalSummary";

type NaturalSummaryPanelProps = {
  hasHistory: boolean;
  summary: NaturalSummaryOutput;
};

export function NaturalSummaryPanel({ hasHistory, summary }: NaturalSummaryPanelProps) {
  return (
    <section className="panel">
      <div>
        <h2>自然语言摘要</h2>
        <p className="muted">只润色既有事实，不参与评分、阈值或排序。</p>
      </div>
      {hasHistory ? (
        <>
          <SummaryBlock title="复盘摘要" text={summary.reviewSummary} />
          <SummaryBlock title="建议摘要" text={summary.adviceSummary} />
          <SummaryBlock title="执行提醒" text={summary.executionReminder} />
        </>
      ) : (
        <div className="emptyState">
          <strong>还没有可摘要的记录</strong>
          <p>完成一次记录后，这里会把复盘、建议和执行提醒整理成更自然的短摘要。</p>
        </div>
      )}
    </section>
  );
}

function SummaryBlock({ text, title }: { text: string; title: string }) {
  return (
    <article className="reviewBlock">
      <strong>{title}</strong>
      <p>{text}</p>
    </article>
  );
}
