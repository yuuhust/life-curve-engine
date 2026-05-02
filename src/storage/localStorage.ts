import type { DailyBehaviorInput } from "@/types/behavior";
import type { PlanStatus } from "@/types/advice";
import type { LifeCurveSnapshot } from "@/types/snapshot";
import type { StageModeId, UserStageModeSetting } from "@/types/stageMode";

const DAILY_INPUTS_KEY = "lifeCurve.dailyInputs";
const SNAPSHOTS_KEY = "lifeCurve.snapshots";
const SETTINGS_KEY = "lifeCurve.settings";
const PLAN_STATUSES_KEY = "lifeCurve.planStatuses";
const STAGE_MODE_KEY = "lifeCurve.stageMode";
const STORAGE_KEYS = [
  DAILY_INPUTS_KEY,
  SNAPSHOTS_KEY,
  SETTINGS_KEY,
  PLAN_STATUSES_KEY,
  STAGE_MODE_KEY
] as const;
const STORAGE_VERSION = 1;
const DEFAULT_STAGE_MODE_ID: StageModeId = "balanced";

type VersionedStorage<T> = {
  version: number;
  updatedAt: string;
  data: T;
};

export type LifeCurveStorageExport = {
  version: number;
  exportedAt: string;
  dailyInputs: DailyBehaviorInput[];
  snapshots: LifeCurveSnapshot[];
  settings: Record<string, never>;
  planStatuses: Record<string, PlanStatus>;
  stageMode: UserStageModeSetting;
};

export function loadDailyInputs(): DailyBehaviorInput[] {
  return readVersioned<DailyBehaviorInput[]>(DAILY_INPUTS_KEY, []);
}

export function saveDailyInput(input: DailyBehaviorInput): void {
  const existing = loadDailyInputs().filter((item) => item.date !== input.date);
  writeVersioned(DAILY_INPUTS_KEY, [...existing, input]);
}

export function loadSnapshots(): LifeCurveSnapshot[] {
  return readVersioned<LifeCurveSnapshot[]>(SNAPSHOTS_KEY, []);
}

export function saveSnapshot(snapshot: LifeCurveSnapshot): void {
  const existing = loadSnapshots().filter((item) => item.date !== snapshot.date);
  writeVersioned(SNAPSHOTS_KEY, [...existing, snapshot]);
}

export function loadLatestSnapshot(): LifeCurveSnapshot | undefined {
  return loadSnapshots().at(-1);
}

export function exportLifeCurveData(): LifeCurveStorageExport {
  return {
    version: STORAGE_VERSION,
    exportedAt: new Date().toISOString(),
    dailyInputs: loadDailyInputs(),
    snapshots: loadSnapshots(),
    settings: readVersioned<Record<string, never>>(SETTINGS_KEY, {}),
    planStatuses: loadPlanStatuses(),
    stageMode: loadStageModeSetting()
  };
}

export function exportLifeCurveDataAsJson(): string {
  return JSON.stringify(exportLifeCurveData(), null, 2);
}

export function clearLifeCurveData(): void {
  if (typeof window === "undefined") return;
  STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
}

export function loadPlanStatuses(): Record<string, PlanStatus> {
  return readVersioned<Record<string, PlanStatus>>(PLAN_STATUSES_KEY, {});
}

export function savePlanStatus(planId: string, status: PlanStatus): void {
  writeVersioned(PLAN_STATUSES_KEY, {
    ...loadPlanStatuses(),
    [planId]: status
  });
}

export function loadStageModeSetting(): UserStageModeSetting {
  const setting = readVersioned<UserStageModeSetting>(
    STAGE_MODE_KEY,
    createDefaultStageModeSetting()
  );

  return {
    currentMode: setting.currentMode ?? DEFAULT_STAGE_MODE_ID,
    updatedAt: setting.updatedAt ?? new Date().toISOString()
  };
}

export function saveStageModeSetting(currentMode: StageModeId): void {
  writeVersioned<UserStageModeSetting>(STAGE_MODE_KEY, {
    currentMode,
    updatedAt: new Date().toISOString()
  });
}

function createDefaultStageModeSetting(): UserStageModeSetting {
  return {
    currentMode: DEFAULT_STAGE_MODE_ID,
    updatedAt: new Date().toISOString()
  };
}

function readVersioned<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = migrateVersionedStorage(JSON.parse(raw) as VersionedStorage<T>);
    return parsed?.data ?? fallback;
  } catch {
    return fallback;
  }
}

function writeVersioned<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;

  const payload: VersionedStorage<T> = {
    version: STORAGE_VERSION,
    updatedAt: new Date().toISOString(),
    data
  };

  window.localStorage.setItem(key, JSON.stringify(payload));
}

function migrateVersionedStorage<T>(payload: VersionedStorage<T>): VersionedStorage<T> | undefined {
  if (!payload || typeof payload.version !== "number") return undefined;

  // Migration placeholder: future versions can transform payload.data here.
  if (payload.version === STORAGE_VERSION) return payload;
  return payload;
}
