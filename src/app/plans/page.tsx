import { PlansList } from "@/components/plans-list";
import { PlansToolbar } from "@/components/plans-toolbar";
import { requireUser } from "@/data/auth";
import { listLabelsForUser } from "@/data/labels";
import { listPlansForUser } from "@/data/plans";

interface PlansPageProps {
  searchParams?: {
    q?: string | string[];
    labels?: string | string[];
  };
}

function resolveParam(value?: string | string[]): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

function parseLabelIds(value?: string | string[]): string[] {
  const raw = resolveParam(value);
  if (!raw) {
    return [];
  }

  return raw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export default async function PlansPage({ searchParams }: PlansPageProps) {
  const { supabase, user } = await requireUser();
  const query = resolveParam(searchParams?.q);
  const selectedLabelIds = parseLabelIds(searchParams?.labels);

  const [labels, plans] = await Promise.all([
    listLabelsForUser(supabase, user.id),
    listPlansForUser(supabase, user.id, {
      searchQuery: query,
      selectedLabelIds
    })
  ]);

  return (
    <main className="container space-y-5 py-6">
      <section className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Plans</h1>
        <p className="text-sm text-muted-foreground">Manage plans, labels, and progress logs from one screen.</p>
      </section>

      <PlansToolbar labels={labels} initialSearchQuery={query} initialSelectedLabelIds={selectedLabelIds} />
      <PlansList plans={plans} />
    </main>
  );
}
