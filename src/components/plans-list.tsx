import Link from "next/link";
import { AddProgressDialog } from "@/components/add-progress-dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatProgressPercent, formatValue } from "@/domain/progress";
import type { PlanSummary } from "@/domain/types";

interface PlansListProps {
  plans: PlanSummary[];
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

export function PlansList({ plans }: PlansListProps) {
  if (!plans.length) {
    return (
      <div className="rounded-xl border border-dashed bg-card/80 p-8 text-center text-sm text-muted-foreground">
        조건에 맞는 계획이 없습니다. 상단 Dialog에서 계획을 추가해보세요.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {plans.map((plan) => (
        <li key={plan.id} className="rounded-xl border bg-card/90 p-4 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="min-w-0 flex-1 space-y-3">
              <div className="space-y-2">
                <Link href={`/plans/${plan.id}`} className="block text-lg font-semibold hover:text-primary hover:underline">
                  {plan.title}
                </Link>
                {plan.description ? <p className="line-clamp-2 text-sm text-muted-foreground">{plan.description}</p> : null}
                {plan.labels.length ? (
                  <div className="flex flex-wrap gap-2">
                    {plan.labels.map((label) => (
                      <Badge key={label.id} variant="outline" style={labelStyle(label.color)}>
                        {label.name}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="space-y-2">
                <Progress value={plan.progressRate * 100} />
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  <span className="font-medium">{formatProgressPercent(plan.progressRate)}</span>
                  <span className="text-muted-foreground">
                    {formatValue(plan.currentValue)} / {formatValue(plan.targetValue)} {plan.unit}
                  </span>
                </div>
              </div>
            </div>

            <div className="shrink-0">
              <AddProgressDialog planId={plan.id} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
