export type EntityId =
  | "self_core"
  | "employment"
  | "ai_system"
  | "venture"
  | "capital"
  | "health"
  | "knowledge";

export type EntityState = {
  id: EntityId;
  label: string;
  score: number;
  trend: number;
  updatedAt: string;
};
