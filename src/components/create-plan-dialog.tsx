"use client";

import { type FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createPlanAction } from "@/app/plans/actions";
import type { LabelRow } from "@/domain/types";
import { LabelMultiSelect } from "@/components/label-multi-select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CreatePlanDialogProps {
  labels: LabelRow[];
}

export function CreatePlanDialog({ labels }: CreatePlanDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("");
  const [targetValue, setTargetValue] = useState("0");
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const parsedTarget = Number(targetValue);
    if (!Number.isFinite(parsedTarget)) {
      setError("목표 값은 숫자여야 합니다.");
      return;
    }

    startTransition(async () => {
      const result = await createPlanAction({
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
      setTitle("");
      setDescription("");
      setUnit("");
      setTargetValue("0");
      setSelectedLabelIds([]);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          계획 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>계획 추가</DialogTitle>
          <DialogDescription>목표와 단위를 지정해 진행률을 추적할 계획을 만듭니다.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="plan-title">제목</Label>
            <Input
              id="plan-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="예: 3월 러닝 80km"
              maxLength={80}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="plan-description">설명</Label>
            <Textarea
              id="plan-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="세부 목표나 메모를 입력하세요."
              maxLength={400}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="plan-unit">단위</Label>
              <Input id="plan-unit" value={unit} onChange={(event) => setUnit(event.target.value)} placeholder="예: km, 페이지" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-target">목표값</Label>
              <Input
                id="plan-target"
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
