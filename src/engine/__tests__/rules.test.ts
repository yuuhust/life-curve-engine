import { describe, expect, it } from "vitest";
import { normalizeBehaviorValue } from "../rules";

describe("normalizeBehaviorValue", () => {
  it("scores AI hours from the threshold table", () => {
    expect(normalizeBehaviorValue("ai_hours", 0)).toBe(-2);
    expect(normalizeBehaviorValue("ai_hours", 0.25)).toBe(-1);
    expect(normalizeBehaviorValue("ai_hours", 0.75)).toBe(0);
    expect(normalizeBehaviorValue("ai_hours", 2)).toBe(1);
    expect(normalizeBehaviorValue("ai_hours", 3)).toBe(2);
  });

  it("scores sleep with upper and lower penalties", () => {
    expect(normalizeBehaviorValue("sleep_duration", 4.5)).toBe(-2);
    expect(normalizeBehaviorValue("sleep_duration", 5.5)).toBe(-1);
    expect(normalizeBehaviorValue("sleep_duration", 6.5)).toBe(0);
    expect(normalizeBehaviorValue("sleep_duration", 7.25)).toBe(1);
    expect(normalizeBehaviorValue("sleep_duration", 8)).toBe(2);
    expect(normalizeBehaviorValue("sleep_duration", 9)).toBe(-1);
    expect(normalizeBehaviorValue("sleep_duration", 11)).toBe(-2);
  });

  it("scores signed factors directly through configured bands", () => {
    expect(normalizeBehaviorValue("emotion_state", -2)).toBe(-2);
    expect(normalizeBehaviorValue("emotion_state", -1)).toBe(-1);
    expect(normalizeBehaviorValue("emotion_state", 0)).toBe(0);
    expect(normalizeBehaviorValue("emotion_state", 1)).toBe(1);
    expect(normalizeBehaviorValue("emotion_state", 2)).toBe(2);
  });
});
