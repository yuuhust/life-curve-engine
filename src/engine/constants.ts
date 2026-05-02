import type { EntityState } from "@/types/entity";
import type { IntermediateFactorState } from "@/types/intermediate";

export const initialEntities: EntityState[] = [
  { id: "self_core", label: "自我能力体", score: 50, trend: 0, updatedAt: "" },
  { id: "employment", label: "传统就业体", score: 50, trend: 0, updatedAt: "" },
  { id: "ai_system", label: "AI 协作体", score: 50, trend: 0, updatedAt: "" },
  { id: "venture", label: "项目/创业体", score: 50, trend: 0, updatedAt: "" },
  { id: "capital", label: "资本复利体", score: 50, trend: 0, updatedAt: "" },
  { id: "health", label: "健康体", score: 50, trend: 0, updatedAt: "" },
  { id: "knowledge", label: "知识积累体", score: 50, trend: 0, updatedAt: "" }
];

export const initialIntermediateFactors: IntermediateFactorState[] = [
  { id: "cognitive_growth", label: "认知增量", score: 50, trend: 0 },
  { id: "execution_power", label: "执行力", score: 50, trend: 0 },
  { id: "leverage_level", label: "杠杆强度", score: 50, trend: 0 },
  { id: "opportunity_density", label: "机会密度", score: 50, trend: 0 },
  { id: "safety_floor", label: "安全底盘", score: 50, trend: 0 },
  { id: "recovery_rate", label: "恢复速度", score: 50, trend: 0 },
  { id: "compounding_power", label: "复利能力", score: 50, trend: 0 },
  { id: "risk_exposure", label: "风险暴露度", score: 35, trend: 0 }
];
