import type { SupabaseClient } from "@supabase/supabase-js";
import { filterPlans } from "@/domain/filters";
import { calculateProgressRate, toNumber } from "@/domain/progress";
import type { CreatePlanInput, LabelRow, PlanDetail, PlanRow, PlanSummary, ProgressLogRow } from "@/domain/types";

type PlanLabelJoinRow = {
  plan_id: string;
  label: LabelRow | LabelRow[] | null;
};

function extractLabel(value: PlanLabelJoinRow["label"]): LabelRow | null {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

function buildPlanSummary(plan: PlanRow, labels: LabelRow[], currentValue: number): PlanSummary {
  const targetValue = toNumber(plan.target_value);
  return {
    id: plan.id,
    title: plan.title,
    description: plan.description,
    unit: plan.unit,
    targetValue,
    currentValue,
    progressRate: calculateProgressRate(currentValue, targetValue),
    labels,
    createdAt: plan.created_at,
    updatedAt: plan.updated_at
  };
}

export async function listPlansForUser(
  supabase: SupabaseClient,
  userId: string,
  params?: {
    searchQuery?: string;
    selectedLabelIds?: string[];
  }
): Promise<PlanSummary[]> {
  const { data: plansData, error: plansError } = await supabase
    .from("plans")
    .select("id, user_id, title, description, unit, target_value, archived, created_at, updated_at")
    .eq("user_id", userId)
    .eq("archived", false)
    .order("created_at", { ascending: false });

  if (plansError) {
    throw new Error(`Failed to load plans: ${plansError.message}`);
  }

  const plans = (plansData ?? []) as PlanRow[];
  if (!plans.length) {
    return [];
  }

  const planIds = plans.map((plan) => plan.id);

  const [labelLinksResult, progressResult] = await Promise.all([
    supabase
      .from("plan_labels")
      .select("plan_id, label:labels(id, user_id, name, color, created_at)")
      .eq("user_id", userId)
      .in("plan_id", planIds),
    supabase.from("progress_logs").select("plan_id, delta").eq("user_id", userId).in("plan_id", planIds)
  ]);

  if (labelLinksResult.error) {
    throw new Error(`Failed to load plan labels: ${labelLinksResult.error.message}`);
  }

  if (progressResult.error) {
    throw new Error(`Failed to load progress logs: ${progressResult.error.message}`);
  }

  const labelsByPlan = new Map<string, LabelRow[]>();
  (labelLinksResult.data as PlanLabelJoinRow[] | null)?.forEach((item) => {
    const label = extractLabel(item.label);
    if (!label) {
      return;
    }

    const existing = labelsByPlan.get(item.plan_id) ?? [];
    labelsByPlan.set(item.plan_id, [...existing, label]);
  });

  const currentByPlan = new Map<string, number>();
  (progressResult.data as Array<{ plan_id: string; delta: number | string }> | null)?.forEach((row) => {
    const current = currentByPlan.get(row.plan_id) ?? 0;
    currentByPlan.set(row.plan_id, current + toNumber(row.delta));
  });

  const summaries = plans.map((plan) => buildPlanSummary(plan, labelsByPlan.get(plan.id) ?? [], currentByPlan.get(plan.id) ?? 0));

  return filterPlans(summaries, {
    searchQuery: params?.searchQuery,
    selectedLabelIds: params?.selectedLabelIds
  });
}

export async function getPlanDetailForUser(
  supabase: SupabaseClient,
  userId: string,
  planId: string
): Promise<PlanDetail | null> {
  const { data: planData, error: planError } = await supabase
    .from("plans")
    .select("id, user_id, title, description, unit, target_value, archived, created_at, updated_at")
    .eq("user_id", userId)
    .eq("id", planId)
    .eq("archived", false)
    .maybeSingle();

  if (planError) {
    throw new Error(`Failed to load plan detail: ${planError.message}`);
  }

  if (!planData) {
    return null;
  }

  const plan = planData as PlanRow;

  const [labelLinksResult, logsResult] = await Promise.all([
    supabase
      .from("plan_labels")
      .select("plan_id, label:labels(id, user_id, name, color, created_at)")
      .eq("user_id", userId)
      .eq("plan_id", planId),
    supabase
      .from("progress_logs")
      .select("id, user_id, plan_id, date, delta, note, created_at")
      .eq("user_id", userId)
      .eq("plan_id", planId)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
  ]);

  if (labelLinksResult.error) {
    throw new Error(`Failed to load plan labels: ${labelLinksResult.error.message}`);
  }

  if (logsResult.error) {
    throw new Error(`Failed to load plan logs: ${logsResult.error.message}`);
  }

  const labels = ((labelLinksResult.data as PlanLabelJoinRow[] | null) ?? [])
    .map((item) => extractLabel(item.label))
    .filter((label): label is LabelRow => Boolean(label));

  const logs = (logsResult.data as ProgressLogRow[] | null) ?? [];
  const currentValue = logs.reduce((sum, log) => sum + toNumber(log.delta), 0);
  const summary = buildPlanSummary(plan, labels, currentValue);

  return {
    ...summary,
    logs: logs.map((log) => ({
      id: log.id,
      date: log.date,
      delta: toNumber(log.delta),
      note: log.note,
      createdAt: log.created_at
    }))
  };
}

export async function createPlanForUser(supabase: SupabaseClient, userId: string, input: CreatePlanInput): Promise<PlanRow> {
  const title = input.title.trim();
  const unit = input.unit.trim();

  if (!title) {
    throw new Error("제목을 입력해 주세요.");
  }

  if (!unit) {
    throw new Error("단위를 입력해 주세요.");
  }

  const { data: planData, error: planError } = await supabase
    .from("plans")
    .insert({
      user_id: userId,
      title,
      description: input.description?.trim() || null,
      unit,
      target_value: Number.isFinite(input.targetValue) ? input.targetValue : 0
    })
    .select("id, user_id, title, description, unit, target_value, archived, created_at, updated_at")
    .single();

  if (planError) {
    throw new Error(`Failed to create plan: ${planError.message}`);
  }

  const plan = planData as PlanRow;
  const labelIds = Array.from(new Set((input.labelIds ?? []).map((id) => id.trim()).filter(Boolean)));

  if (labelIds.length) {
    const { error: linkError } = await supabase.from("plan_labels").insert(
      labelIds.map((labelId) => ({
        user_id: userId,
        plan_id: plan.id,
        label_id: labelId
      }))
    );

    if (linkError) {
      throw new Error(`Failed to map labels to plan: ${linkError.message}`);
    }
  }

  return plan;
}
