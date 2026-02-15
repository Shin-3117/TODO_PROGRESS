"use client";

import { type FormEvent, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { updatePlanAction } from "@/app/plans/actions";
import type { LabelRow, PlanSummary } from "@/domain/types";
import { LabelMultiSelect } from "@/components/label-multi-select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EditPlanDialogProps {
  plan: PlanSummary;
  labels: LabelRow[];
}

export function EditPlanDialog({ plan, labels }: EditPlanDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("");
  const [targetValue, setTargetValue] = useState("0");
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      setTitle(plan.title);
      setDescription(plan.description ?? "");
      setUnit(plan.unit);
      setTargetValue(String(plan.targetValue));
      setSelectedLabelIds(plan.labels.map((l) => l.id));
      setError(null);
    }
  }, [open, plan]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const parsedTarget = Number(targetValue);
    if (!Number.isFinite(parsedTarget)) {
      setError("목표 값은 숫자여야 합니다.");
      return;
    }

    startTransition(async () => {
      const result = await updatePlanAction(plan.id, {
        title,
        description,
        unit,
        targetValue: parsedTarget,
        labelIds: selectedLabelIds
      });

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setOpen(false);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Pencil className="h-4 w-4" />
          수정
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>계획 수정</DialogTitle>
          <DialogDescription>계획 정보를 수정합니다.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="edit-plan-title">제목</Label>
            <Input
              id="edit-plan-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="예: 3월 러닝 80km"
              maxLength={80}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-plan-description">설명</Label>
            <Textarea
              id="edit-plan-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="세부 목표나 메모를 입력하세요."
              maxLength={400}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-plan-unit">단위</Label>
              <Input id="edit-plan-unit" value={unit} onChange={(event) => setUnit(event.target.value)} placeholder="예: km, 페이지" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-plan-target">목표값</Label>
              <Input
                id="edit-plan-target"
                type="number"
                step="0.01"
                value={targetValue}
                onChange={(event) => setTargetValue(event.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>라벨</Label>
            <LabelMultiSelect labels={labels} selectedIds={selectedLabelIds} onChange={setSelectedLabelIds} placeholder="라벨 선택(복수)" />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
