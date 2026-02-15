"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import type { LabelRow } from "@/domain/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

interface LabelMultiSelectProps {
  labels: LabelRow[];
  selectedIds: string[];
  onChange: (nextIds: string[]) => void;
  placeholder?: string;
  triggerClassName?: string;
}

function colorStyle(color: string | null | undefined) {
  if (!color) {
    return undefined;
  }

  return {
    borderColor: `${color}66`,
    backgroundColor: `${color}22`,
    color
  };
}

export function LabelMultiSelect({
  labels,
  selectedIds,
  onChange,
  placeholder = "라벨 선택",
  triggerClassName
}: LabelMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedLabels = labels.filter((label) => selectedSet.has(label.id));

  const toggle = (labelId: string) => {
    const next = new Set(selectedSet);
    if (next.has(labelId)) {
      next.delete(labelId);
    } else {
      next.add(labelId);
    }
    onChange(Array.from(next));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className={cn("w-full justify-between gap-2", triggerClassName)}>
          <span className="truncate text-left">
            {selectedLabels.length ? selectedLabels.map((label) => label.name).join(", ") : placeholder}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder="라벨 검색..." />
          <CommandList>
            <CommandEmpty>라벨이 없습니다.</CommandEmpty>
            <CommandGroup>
              {labels.map((label) => (
                <CommandItem key={label.id} value={label.name} onSelect={() => toggle(label.id)}>
                  <Check className={cn("mr-2 h-4 w-4", selectedSet.has(label.id) ? "opacity-100" : "opacity-0")} />
                  <span className="mr-2">{label.name}</span>
                  {label.color ? (
                    <Badge variant="outline" style={colorStyle(label.color)} className="ml-auto">
                      color
                    </Badge>
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
