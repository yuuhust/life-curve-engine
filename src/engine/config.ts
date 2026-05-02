export const behaviorScoringConfig = {
  diminishingModifier: -0.1
};

export const reviewConfig = {
  weeklyWindow: 7,
  monthlyWindow: 30,
  trendWindow: 7
} as const;

export const planValidationConfig = {
  recentWindow: 3,
  factorImprovementThreshold: 0.25,
  compositeImprovementThreshold: 0.5
};

export const simulationConfig = {
  defaultContinuousDays: 7,
  minContinuousDays: 2,
  maxContinuousDays: 30
};
