"use client";

import { type FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus } from "lucide-react";
import { createProgressLogAction } from "@/app/plans/actions";
import { todayDateString } from "@/domain/date";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AddProgressDialogProps {
  planId: string;
  triggerLabel?: string;
}

export function AddProgressDialog({ planId, triggerLabel = "진행 등록" }: AddProgressDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [delta, setDelta] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const parsedDelta = Number(delta);
    if (!Number.isFinite(parsedDelta) || parsedDelta === 0) {
      setError("delta는 0이 아닌 숫자여야 합니다.");
      return;
    }

    startTransition(async () => {
      const result = await createProgressLogAction({
        planId,
        delta: parsedDelta,
        note,
        date: todayDateString()
      });

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setOpen(false);
      setDelta("");
      setNote("");
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <CalendarPlus className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>진행 등록</DialogTitle>
          <DialogDescription>오늘 기준으로 진행 로그를 기록합니다.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
          <input type="hidden" value={todayDateString()} name="date" />
          <div className="space-y-2">
            <Label htmlFor={`delta-${planId}`}>delta</Label>
            <Input
              id={`delta-${planId}`}
              type="number"
              step="0.01"
              value={delta}
              onChange={(event) => setDelta(event.target.value)}
              placeholder="예: 3.5"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`note-${planId}`}>note</Label>
            <Textarea
              id={`note-${planId}`}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="메모(선택)"
              maxLength={300}
            />
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
