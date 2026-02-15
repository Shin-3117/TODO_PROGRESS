import type { SupabaseClient } from "@supabase/supabase-js";
import { todayDateString } from "@/domain/date";
import type { CreateProgressLogInput } from "@/domain/types";

export async function createProgressLogForUser(supabase: SupabaseClient, userId: string, input: CreateProgressLogInput) {
  if (!input.planId) {
    throw new Error("Plan ID is required.");
  }

  if (!Number.isFinite(input.delta) || input.delta === 0) {
    throw new Error("delta 값은 0이 아닌 숫자여야 합니다.");
  }

  const { error } = await supabase.from("progress_logs").insert({
    user_id: userId,
    plan_id: input.planId,
    date: input.date ?? todayDateString(),
    delta: input.delta,
    note: input.note?.trim() || null
  });

  if (error) {
    throw new Error(`Failed to create progress log: ${error.message}`);
  }
}
