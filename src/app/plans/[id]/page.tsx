import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { requireUser } from "@/data/auth";
import { listLabelsForUser } from "@/data/labels";
import { getPlanDetailForUser } from "@/data/plans";
import { AddProgressDialog } from "@/components/add-progress-dialog";
import { EditPlanDialog } from "@/components/edit-plan-dialog";
import { ProgressCalendar } from "@/components/progress-calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/domain/date";
import { formatProgressPercent, formatValue } from "@/domain/progress";

interface PlanDetailPageProps {
  params: {
    id: string;
  };
}

function labelStyle(color: string | null) {
  if (!color) {
    return undefined;
  }

  return {
    borderColor: `${color}66`,
    backgroundColor: `${color}22`,
    color
  };
}

export default async function PlanDetailPage({ params }: PlanDetailPageProps) {
  const { supabase, user } = await requireUser();
  const [plan, labels] = await Promise.all([getPlanDetailForUser(supabase, user.id, params.id), listLabelsForUser(supabase, user.id)]);

  if (!plan) {
    notFound();
  }

  return (
    <main className="container space-y-5 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost">
          <Link href="/plans">
            <ChevronLeft className="mr-1 h-4 w-4" />
            목록으로
          </Link>
        </Button>
        <div className="flex gap-2">
          <EditPlanDialog plan={plan} labels={labels} />
          <AddProgressDialog planId={plan.id} />
        </div>
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <div className="space-y-2">
            <CardTitle className="text-2xl">{plan.title}</CardTitle>
            {plan.description ? <CardDescription className="text-sm">{plan.description}</CardDescription> : null}
          </div>
          {plan.labels.length ? (
            <div className="flex flex-wrap gap-2">
              {plan.labels.map((label) => (
                <Badge key={label.id} variant="outline" style={labelStyle(label.color)}>
                  {label.name}
                </Badge>
              ))}
            </div>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={plan.progressRate * 100} />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className="font-medium">{formatProgressPercent(plan.progressRate)}</span>
            <span className="text-muted-foreground">
              {formatValue(plan.currentValue)} / {formatValue(plan.targetValue)} {plan.unit}
            </span>
          </div>
        </CardContent>
      </Card>

      <ProgressCalendar logs={plan.logs} />

      <Card>
        <CardHeader>
          <CardTitle>로그</CardTitle>
          <CardDescription>최신순으로 정렬됩니다.</CardDescription>
        </CardHeader>
        <CardContent>
          {plan.logs.length ? (
            <ul className="space-y-2">
              {plan.logs.map((log) => (
                <li key={log.id} className="rounded-lg border px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm text-muted-foreground">{formatDate(log.date)}</span>
                    <span className="text-sm font-semibold">{formatValue(log.delta)}</span>
                  </div>
                  {log.note ? <p className="mt-2 text-sm">{log.note}</p> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">아직 기록이 없습니다.</p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
