"use client";

import type { ReviewSummary } from "@/types/review";

type ReviewPanelProps = {
  review: ReviewSummary;
};

export function ReviewPanel({ review }: ReviewPanelProps) {
  return (
    <section className="panel reviewPanel">
      <div>
        <h2>复盘</h2>
        <p className="muted">最近 7 天 / 30 天的趋势归因。</p>
      </div>
      {review.weekly.snapshotCount ? (
        <>
          <div className="reviewGrid">
            <ReviewBlock title="最近 7 天" conclusion={review.weekly.conclusion} />
            <ReviewBlock title="最近 30 天" conclusion={review.monthly.conclusion} />
          </div>
          <div className="trendBox">
            <strong>连续趋势</strong>
            <p>{review.trend.conclusion}</p>
          </div>
        </>
      ) : (
        <div className="emptyState">
          <strong>还没有历史复盘</strong>
          <p>完成今天的 Daily Check-in 后，这里会开始显示 7 天和 30 天复盘。</p>
        </div>
      )}
    </section>
  );
}

function ReviewBlock({ conclusion, title }: { conclusion: string; title: string }) {
  return (
    <article className="reviewBlock">
      <strong>{title}</strong>
      <p>{conclusion}</p>
    </article>
  );
}
