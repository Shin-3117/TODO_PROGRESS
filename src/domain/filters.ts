import type { PlanSummary } from "@/domain/types";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function matchesSearch(plan: PlanSummary, searchQuery: string): boolean {
  const normalizedQuery = normalize(searchQuery);
  if (!normalizedQuery) {
    return true;
  }

  const title = normalize(plan.title);
  const description = normalize(plan.description ?? "");
  return title.includes(normalizedQuery) || description.includes(normalizedQuery);
}

export function matchesLabelOr(plan: PlanSummary, selectedLabelIds: string[]): boolean {
  if (!selectedLabelIds.length) {
    return true;
  }

  return plan.labels.some((label) => selectedLabelIds.includes(label.id));
}

export function filterPlans(
  plans: PlanSummary[],
  params: {
    searchQuery?: string;
    selectedLabelIds?: string[];
  }
): PlanSummary[] {
  const searchQuery = params.searchQuery ?? "";
  const selectedLabelIds = params.selectedLabelIds ?? [];

  return plans.filter((plan) => matchesSearch(plan, searchQuery) && matchesLabelOr(plan, selectedLabelIds));
}
