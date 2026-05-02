"use client";

import type {
  ActionPlanItem,
  AdviceItem,
  AdviceSummary,
  PlanStatus,
  PlanValidationSummary
} from "@/types/advice";

type AdvicePanelProps = {
  advice: AdviceSummary;
  hasHistory: boolean;
  plans: ActionPlanItem[];
  validation: PlanValidationSummary;
  onStatusChange: (planId: string, status: PlanStatus) => void;
};

const statusLabels: Record<PlanStatus, string> = {
  not_started: "未开始",
  in_progress: "进行中",
  completed: "已完成",
  abandoned: "已放弃"
};

const effectivenessLabels = {
  effective: "有效",
  partially_effective: "部分有效",
  no_clear_effect: "无明显效果"
};

export function AdvicePanel({
  advice,
  hasHistory,
  onStatusChange,
  plans,
  validation
}: AdvicePanelProps) {
  return (
    <section className="panel advicePanel">
      <div>
        <h2>建议 / 计划 / 验证</h2>
        <p className="muted">从分析结论落到行动，再用最近记录做轻量验证。</p>
      </div>
      <h3 className="subSectionTitle">建议</h3>
      <AdviceBlock item={advice.repair} />
      <AdviceBlock item={advice.reinforce} />
      <AdviceBlock item={advice.experiment} />
      <h3 className="subSectionTitle">行动计划</h3>
      <div className="planList">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            onStatusChange={onStatusChange}
            plan={plan}
            validation={
              hasHistory ? validation.validations.find((item) => item.planId === plan.id) : undefined
            }
          />
        ))}
      </div>
      <h3 className="subSectionTitle">闭环统计</h3>
      {hasHistory ? (
        <div className="planStats">
          {validation.stats.map((item) => (
            <span key={item.sourceKind}>
              {item.sourceKind}: 完成 {item.completed}/{item.total}，有效 {item.effective}
            </span>
          ))}
        </div>
      ) : (
        <div className="emptyState">
          <strong>还没有计划验证结果</strong>
          <p>先记录几天行为，并更新计划状态，系统会用最近数据判断行动是否有效。</p>
        </div>
      )}
    </section>
  );
}

function AdviceBlock({ item }: { item: AdviceItem }) {
  return (
    <article className={`adviceBlock ${item.kind}`}>
      <strong>{item.title}</strong>
      <p>{item.summary}</p>
      {item.evidence.length ? (
        <ul>
          {item.evidence.map((evidence) => (
            <li key={evidence}>{evidence}</li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

function PlanCard({
  onStatusChange,
  plan,
  validation
}: {
  onStatusChange: (planId: string, status: PlanStatus) => void;
  plan: ActionPlanItem;
  validation?: PlanValidationSummary["validations"][number];
}) {
  return (
    <article className="planCard">
      <div className="planHeader">
        <strong>{plan.title}</strong>
        <select
          value={plan.status}
          onChange={(event) => onStatusChange(plan.id, event.target.value as PlanStatus)}
        >
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <p>{plan.actionGoal}</p>
      <small>{plan.successCriteria}</small>
      {validation ? (
        <div className="validationBox">
          <strong>{effectivenessLabels[validation.effectiveness]}</strong>
          <p>{validation.summary}</p>
        </div>
      ) : null}
    </article>
  );
}
