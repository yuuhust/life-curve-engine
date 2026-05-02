import type { StageModeConfig, StageModeId, UserStageModeSetting } from "@/types/stageMode";
import type { CompositeScoreWeights } from "./curveGenerator";
import { defaultCompositeScoreWeights } from "./curveGenerator";

export const defaultStageModeId: StageModeId = "balanced";

export const stageModeConfigs: Record<StageModeId, StageModeConfig> = {
  balanced: {
    id: "balanced",
    label: "均衡模式",
    description: "保持 V1 默认权重，用于稳定对比和默认计算。",
    entityWeights: {},
    intermediateWeights: {},
    behaviorPriorities: ["sleep_duration", "work_completion", "focus_score"],
    curveFocus: ["composite", "health", "employment"],
    adviceBias: {
      repair: ["sleep_duration", "work_completion"],
      reinforce: ["focus_score", "ai_depth"],
      experiment: ["project_progress"]
    }
  },
  academic: {
    id: "academic",
    label: "学业优先",
    description: "优先提高学习质量、主线完成度和稳定底盘。",
    entityWeights: {
      self_core: 1.2,
      employment: 1.3,
      knowledge: 1.2,
      health: 1.1
    },
    intermediateWeights: {
      cognitive_growth: 1.3,
      execution_power: 1.2,
      safety_floor: 1.2,
      recovery_rate: 1.1
    },
    behaviorPriorities: [
      "work_completion",
      "deep_study",
      "sleep_duration",
      "reading_time",
      "focus_score"
    ],
    curveFocus: ["employment", "health", "composite"],
    adviceBias: {
      repair: ["sleep_duration", "work_completion"],
      reinforce: ["deep_study", "reading_time"],
      experiment: ["focus_score", "deep_study"]
    }
  },
  career: {
    id: "career",
    label: "求职优先",
    description: "优先提高就业底盘、输出质量和机会暴露。",
    entityWeights: {
      employment: 1.35,
      self_core: 1.2,
      ai_system: 1.1,
      health: 1.05
    },
    intermediateWeights: {
      execution_power: 1.25,
      safety_floor: 1.25,
      leverage_level: 1.15,
      opportunity_density: 1.15
    },
    behaviorPriorities: [
      "work_completion",
      "output_count",
      "ai_depth",
      "project_progress",
      "sleep_duration"
    ],
    curveFocus: ["employment", "ai", "composite"],
    adviceBias: {
      repair: ["work_completion", "sleep_duration"],
      reinforce: ["output_count", "ai_depth"],
      experiment: ["project_progress", "ai_depth"]
    }
  },
  venture: {
    id: "venture",
    label: "项目优先",
    description: "优先提高项目推进、真实输出和非线性机会。",
    entityWeights: {
      venture: 1.45,
      ai_system: 1.2,
      self_core: 1.1,
      knowledge: 1.05
    },
    intermediateWeights: {
      opportunity_density: 1.35,
      leverage_level: 1.25,
      execution_power: 1.2,
      compounding_power: 1.1
    },
    behaviorPriorities: [
      "project_progress",
      "output_count",
      "ai_depth",
      "focus_score",
      "sleep_duration"
    ],
    curveFocus: ["venture", "ai", "composite"],
    adviceBias: {
      repair: ["sleep_duration", "focus_score"],
      reinforce: ["project_progress", "output_count"],
      experiment: ["project_progress", "ai_depth"]
    }
  },
  health_recovery: {
    id: "health_recovery",
    label: "健康修复",
    description: "优先修复睡眠、恢复速度和风险暴露。",
    entityWeights: {
      health: 1.5,
      self_core: 1.1,
      employment: 1.05,
      capital: 1.05
    },
    intermediateWeights: {
      recovery_rate: 1.4,
      risk_exposure: 1.25,
      safety_floor: 1.25,
      execution_power: 1.1
    },
    behaviorPriorities: [
      "sleep_duration",
      "emotion_state",
      "exercise_score",
      "focus_score",
      "work_completion"
    ],
    curveFocus: ["health", "employment", "composite"],
    adviceBias: {
      repair: ["sleep_duration", "emotion_state"],
      reinforce: ["exercise_score", "focus_score"],
      experiment: ["sleep_duration"]
    }
  },
  ai_leverage: {
    id: "ai_leverage",
    label: "AI 杠杆成长",
    description: "优先提高 AI 协作深度、杠杆强度和知识复利。",
    entityWeights: {
      ai_system: 1.45,
      knowledge: 1.25,
      venture: 1.15,
      self_core: 1.1
    },
    intermediateWeights: {
      leverage_level: 1.45,
      cognitive_growth: 1.25,
      compounding_power: 1.2,
      opportunity_density: 1.15
    },
    behaviorPriorities: [
      "ai_depth",
      "ai_hours",
      "project_progress",
      "reading_time",
      "output_count"
    ],
    curveFocus: ["ai", "venture", "composite"],
    adviceBias: {
      repair: ["sleep_duration", "focus_score"],
      reinforce: ["ai_depth", "reading_time"],
      experiment: ["ai_depth", "project_progress"]
    }
  }
};

export function createDefaultStageModeSetting(): UserStageModeSetting {
  return {
    currentMode: defaultStageModeId,
    updatedAt: new Date().toISOString()
  };
}

export function getStageModeConfig(stageModeId: StageModeId): StageModeConfig {
  return stageModeConfigs[stageModeId] ?? stageModeConfigs[defaultStageModeId];
}

export function getCompositeScoreWeightsForStageMode(
  stageModeId: StageModeId
): CompositeScoreWeights {
  const config = getStageModeConfig(stageModeId);

  return {
    ...defaultCompositeScoreWeights,
    entityWeights: {
      ...defaultCompositeScoreWeights.entityWeights,
      ...config.entityWeights
    },
    intermediateWeights: {
      ...defaultCompositeScoreWeights.intermediateWeights,
      ...config.intermediateWeights
    }
  };
}
