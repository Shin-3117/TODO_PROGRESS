import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateLabelInput, LabelRow } from "@/domain/types";

function normalizeColor(color?: string): string | null {
  const value = color?.trim();
  if (!value) {
    return null;
  }

  return value;
}

export async function listLabelsForUser(supabase: SupabaseClient, userId: string): Promise<LabelRow[]> {
  const { data, error } = await supabase
    .from("labels")
    .select("id, user_id, name, color, created_at")
    .eq("user_id", userId)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to load labels: ${error.message}`);
  }

  return (data ?? []) as LabelRow[];
}

export async function createLabelForUser(supabase: SupabaseClient, userId: string, input: CreateLabelInput): Promise<LabelRow> {
  const payload = {
    user_id: userId,
    name: input.name.trim(),
    color: normalizeColor(input.color)
  };

  const { data, error } = await supabase
    .from("labels")
    .insert(payload)
    .select("id, user_id, name, color, created_at")
    .single();

  if (error) {
    throw new Error(`Failed to create label: ${error.message}`);
  }

  return data as LabelRow;
}
