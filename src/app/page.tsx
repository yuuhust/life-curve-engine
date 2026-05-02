"use client";

import { AdvicePanel } from "@/components/AdvicePanel";
import { CheckInForm } from "@/components/CheckInForm";
import { CompositeCurve } from "@/components/CompositeCurve";
import { EntityStatusPanel } from "@/components/EntityStatusPanel";
import { ExplanationPanel } from "@/components/ExplanationPanel";
import { IntermediatePanel } from "@/components/IntermediatePanel";
import { NaturalSummaryPanel } from "@/components/NaturalSummaryPanel";
import { ReviewPanel } from "@/components/ReviewPanel";
import { SimulationPanel } from "@/components/SimulationPanel";
import { StageModePanel } from "@/components/StageModePanel";
import { StorageManagementPanel } from "@/components/StorageManagementPanel";
import { useLifeCurveMvp } from "@/hooks/useLifeCurveMvp";
import type { ReactNode } from "react";

export default function Home() {
  const {
    adviceSummary,
    actionPlans,
    behaviorFactorDefinitions,
    clearData,
    continuousSimulationResult,
    exportData,
    loadDemoScenario,
    planValidationSummary,
    naturalSummary,
    reviewSummary,
    simulateContinuousFactor,
    simulateSingleFactor,
    simulationResult,
    stageModeSetting,
    submitDailyInput,
    updatePlanStatus,
    updateStageMode,
    viewModel
  } = useLifeCurveMvp();

  return (
    <main className="page">
      <header className="header">
        <p className="eyebrow">Life Curve Engine V2.4</p>
        <h1>人生曲线工作台</h1>
        <p>
          按“记录今天 → 看曲线与复盘 → 看建议与计划 → 做模拟 → 看自然语言摘要”的顺序，
          跑通行为输入到闭环验证的最小产品链路。
        </p>
      </header>

      <nav className="workflowSteps" aria-label="用户主流程">
        <span>1. 记录今天</span>
        <span>2. 看曲线与复盘</span>
        <span>3. 看建议与计划</span>
        <span>4. 做模拟</span>
        <span>5. 看摘要</span>
      </nav>

      <WorkbenchSection
        description="输入今天的关键行为，并选择当前阶段模式。"
        kicker="输入"
        title="记录今天"
      >
        <div className="grid two">
          <CheckInForm factors={behaviorFactorDefinitions} onSubmit={submitDailyInput} />
          <div className="grid">
            <StageModePanel onChange={updateStageMode} setting={stageModeSetting} />
            <StorageManagementPanel
              onClearData={clearData}
              onExportData={exportData}
              onLoadDemoAcademic={() => loadDemoScenario("academic")}
              onLoadDemoVenture={() => loadDemoScenario("venture")}
            />
          </div>
        </div>
      </WorkbenchSection>

      <WorkbenchSection
        description="查看复合总曲线、阶段关注曲线、周/月复盘和规则解释。"
        kicker="结果查看"
        title="看曲线与复盘"
      >
        <div className="grid two">
          <div className="grid">
            <CompositeCurve
              focusedSeries={viewModel.focusedCurveSeries}
              points={viewModel.curvePoints}
              score={viewModel.compositeScore}
            />
            <ReviewPanel review={reviewSummary} />
            <ExplanationPanel explanations={viewModel.explanations} />
          </div>
          <div className="grid">
            <EntityStatusPanel entities={viewModel.entities} />
            <IntermediatePanel factors={viewModel.intermediateFactors} />
          </div>
        </div>
      </WorkbenchSection>

      <WorkbenchSection
        description="把当前结论转成行动计划，并用最近记录做轻量验证。"
        kicker="下一步行动"
        title="看建议与计划"
      >
        <AdvicePanel
          advice={adviceSummary}
          hasHistory={viewModel.hasHistory}
          onStatusChange={updatePlanStatus}
          plans={actionPlans}
          validation={planValidationSummary}
        />
      </WorkbenchSection>

      <WorkbenchSection
        description="先做不写入历史的假设实验，再阅读自然语言摘要。"
        kicker="探索与表达"
        title="做模拟，读摘要"
      >
        <div className="grid two">
          <SimulationPanel
            continuousResult={continuousSimulationResult}
            factors={behaviorFactorDefinitions}
            onContinuousSimulate={simulateContinuousFactor}
            onSimulate={simulateSingleFactor}
            result={simulationResult}
          />
          <NaturalSummaryPanel hasHistory={viewModel.hasHistory} summary={naturalSummary} />
        </div>
      </WorkbenchSection>
    </main>
  );
}

function WorkbenchSection({
  children,
  description,
  kicker,
  title
}: {
  children: ReactNode;
  description: string;
  kicker: string;
  title: string;
}) {
  return (
    <section className="workspaceSection">
      <div className="sectionHeader">
        <span>{kicker}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {children}
    </section>
  );
}
