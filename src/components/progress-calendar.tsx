"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatValue } from "@/domain/progress";

interface ProgressCalendarProps {
  logs: Array<{
    id: string;
    date: string;
    delta: number;
    note: string | null;
    createdAt: string;
  }>;
}

export function ProgressCalendar({ logs }: ProgressCalendarProps) {
  const [selected, setSelected] = useState<Date | undefined>(undefined);

  const { totalByDate, loggedDates, sortedDailyTotals } = useMemo(() => {
    const totals = new Map<string, number>();

    logs.forEach((log) => {
      const current = totals.get(log.date) ?? 0;
      totals.set(log.date, current + log.delta);
    });

    const dailyTotals = Array.from(totals.entries())
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => b.date.localeCompare(a.date));

    return {
      totalByDate: totals,
      loggedDates: Array.from(totals.keys()).map((date) => parseISO(date)),
      sortedDailyTotals: dailyTotals
    };
  }, [logs]);

  const selectedDateKey = selected ? format(selected, "yyyy-MM-dd") : null;
  const selectedTotal = selectedDateKey ? totalByDate.get(selectedDateKey) ?? 0 : null;

  return (
    <div className="grid gap-4 lg:grid-cols-[auto_minmax(0,1fr)]">
      <Card>
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
          <CardDescription>기록이 있는 날짜가 강조됩니다.</CardDescription>
        </CardHeader>
        <CardContent className="p-2">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={setSelected}
            locale={ko}
            modifiers={{ hasLog: loggedDates }}
            modifiersClassNames={{
              hasLog: "bg-primary/15 text-primary font-semibold"
            }}
            className="rounded-md border"
          />
          <p className="px-3 pb-3 text-sm text-muted-foreground">
            {selected && selectedTotal !== null
              ? `${format(selected, "yyyy.MM.dd", { locale: ko })} 합계: ${formatValue(selectedTotal)}`
              : "날짜를 선택하면 해당 일자의 합계를 볼 수 있습니다."}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>일별 합계</CardTitle>
          <CardDescription>날짜별 delta 합계입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          {sortedDailyTotals.length ? (
            <ul className="space-y-2">
              {sortedDailyTotals.map((item) => (
                <li key={item.date} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                  <span>{format(parseISO(item.date), "yyyy.MM.dd")}</span>
                  <span className="font-medium">{formatValue(item.total)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">아직 기록된 로그가 없습니다.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
