export type CurveParameters = {
  slope: number;
  volatility: number;
  recovery: number;
  jumpProbability: number;
};

export type CurvePoint = {
  dayIndex: number;
  employment: number;
  ai: number;
  venture: number;
  capital: number;
  health: number;
  composite: number;
};

export type CurveSeriesKey = Exclude<keyof CurvePoint, "dayIndex">;
