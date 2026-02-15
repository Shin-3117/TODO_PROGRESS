import { format, parseISO } from "date-fns";

export function todayDateString(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function formatDate(date: string): string {
  return format(parseISO(date), "yyyy.MM.dd");
}
