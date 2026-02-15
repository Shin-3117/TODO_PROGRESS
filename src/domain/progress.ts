import type { DbNumeric } from "@/domain/types";

export function toNumber(value: DbNumeric | null | undefined): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  if (value < 0) {
    return 0;
  }

  if (value > 1) {
    return 1;
  }

  return value;
}

export function calculateProgressRate(currentValue: number, targetValue: number): number {
  if (targetValue <= 0) {
    return 0;
  }

  return clamp01(currentValue / targetValue);
}

export function formatProgressPercent(progressRate: number): string {
  return `${Math.round(clamp01(progressRate) * 100)}%`;
}

export function formatValue(value: number): string {
  return Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: 2
  }).format(value);
}
