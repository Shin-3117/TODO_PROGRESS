export type DbNumeric = number | string;

export interface PlanRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  unit: string;
  target_value: DbNumeric;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface LabelRow {
  id: string;
  user_id: string;
  name: string;
  color: string | null;
  created_at: string;
}

export interface ProgressLogRow {
  id: string;
  user_id: string;
  plan_id: string;
  date: string;
  delta: DbNumeric;
  note: string | null;
  created_at: string;
}

export interface PlanSummary {
  id: string;
  title: string;
  description: string | null;
  unit: string;
  targetValue: number;
  currentValue: number;
  progressRate: number;
  labels: LabelRow[];
  createdAt: string;
  updatedAt: string;
}

export interface PlanDetail extends PlanSummary {
  logs: Array<{
    id: string;
    date: string;
    delta: number;
    note: string | null;
    createdAt: string;
  }>;
}

export interface CreatePlanInput {
  title: string;
  description?: string;
  unit: string;
  targetValue: number;
  labelIds?: string[];
}

export interface CreateLabelInput {
  name: string;
  color?: string;
}

export interface CreateProgressLogInput {
  planId: string;
  delta: number;
  note?: string;
  date?: string;
}

export interface UpdatePlanInput {
  title: string;
  description?: string;
  unit: string;
  targetValue: number;
  labelIds?: string[];
}
