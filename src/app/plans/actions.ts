"use server";

import { revalidatePath } from "next/cache";
import { createLabelForUser } from "@/data/labels";
import { createPlanForUser, updatePlanForUser } from "@/data/plans";
import { createProgressLogForUser } from "@/data/progress-logs";
import { createSupabaseServerClient } from "@/data/supabase/server";

export type ActionResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      message: string;
    };

function resolveErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "요청 처리 중 오류가 발생했습니다.";
}

export async function createPlanAction(input: {
  title: string;
  description?: string;
  unit: string;
  targetValue: number;
  labelIds: string[];
}): Promise<ActionResult> {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, message: "로그인이 필요합니다." };
    }

    await createPlanForUser(supabase, user.id, input);
    revalidatePath("/plans");
    return { ok: true };
  } catch (error) {
    return { ok: false, message: resolveErrorMessage(error) };
  }
}

export async function createLabelAction(input: { name: string; color?: string }): Promise<ActionResult> {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, message: "로그인이 필요합니다." };
    }

    await createLabelForUser(supabase, user.id, input);
    revalidatePath("/plans");
    return { ok: true };
  } catch (error) {
    return { ok: false, message: resolveErrorMessage(error) };
  }
}

export async function updatePlanAction(
  planId: string,
  input: {
    title: string;
    description?: string;
    unit: string;
    targetValue: number;
    labelIds: string[];
  }
): Promise<ActionResult> {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, message: "로그인이 필요합니다." };
    }

    await updatePlanForUser(supabase, user.id, planId, input);
    revalidatePath("/plans");
    revalidatePath(`/plans/${planId}`);
    return { ok: true };
  } catch (error) {
    return { ok: false, message: resolveErrorMessage(error) };
  }
}

export async function createProgressLogAction(input: {
  planId: string;
  delta: number;
  note?: string;
  date?: string;
}): Promise<ActionResult> {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, message: "로그인이 필요합니다." };
    }

    await createProgressLogForUser(supabase, user.id, input);
    revalidatePath("/plans");
    revalidatePath(`/plans/${input.planId}`);
    return { ok: true };
  } catch (error) {
    return { ok: false, message: resolveErrorMessage(error) };
  }
}
