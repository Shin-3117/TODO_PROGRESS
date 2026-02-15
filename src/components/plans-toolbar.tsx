"use client";

import { type FormEvent, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FilterX, Search } from "lucide-react";
import type { LabelRow } from "@/domain/types";
import { LabelMultiSelect } from "@/components/label-multi-select";
import { CreateLabelDialog } from "@/components/create-label-dialog";
import { CreatePlanDialog } from "@/components/create-plan-dialog";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PlansToolbarProps {
  labels: LabelRow[];
  initialSearchQuery: string;
  initialSelectedLabelIds: string[];
}

export function PlansToolbar({ labels, initialSearchQuery, initialSelectedLabelIds }: PlansToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialSearchQuery);
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>(initialSelectedLabelIds);

  const canReset = useMemo(() => Boolean(query.trim()) || selectedLabelIds.length > 0, [query, selectedLabelIds.length]);

  const updateRoute = (nextQuery: string, nextLabels: string[]) => {
    const params = new URLSearchParams(searchParams.toString());

    if (nextQuery.trim()) {
      params.set("q", nextQuery.trim());
    } else {
      params.delete("q");
    }

    if (nextLabels.length) {
      params.set("labels", nextLabels.join(","));
    } else {
      params.delete("labels");
    }

    const serialized = params.toString();
    router.push(serialized ? `${pathname}?${serialized}` : pathname);
  };

  const onSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateRoute(query, selectedLabelIds);
  };

  const onLabelChange = (nextIds: string[]) => {
    setSelectedLabelIds(nextIds);
    updateRoute(query, nextIds);
  };

  const onReset = () => {
    setQuery("");
    setSelectedLabelIds([]);
    router.push(pathname);
  };

  return (
    <section className="space-y-4 rounded-xl border bg-card/90 p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <CreatePlanDialog labels={labels} />
        <CreateLabelDialog />
        <div className="ml-auto">
          <LogoutButton />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_280px_auto]">
        <form className="flex gap-2" onSubmit={onSearchSubmit}>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="제목/설명 검색"
            className="bg-background"
          />
          <Button type="submit" size="icon" variant="outline">
            <Search className="h-4 w-4" />
            <span className="sr-only">검색</span>
          </Button>
        </form>

        <LabelMultiSelect
          labels={labels}
          selectedIds={selectedLabelIds}
          onChange={onLabelChange}
          placeholder="라벨 필터(OR)"
          triggerClassName="bg-background"
        />

        <Button type="button" variant="ghost" onClick={onReset} disabled={!canReset} className="justify-self-start md:justify-self-end">
          <FilterX className="mr-2 h-4 w-4" />
          필터 초기화
        </Button>
      </div>
    </section>
  );
}
