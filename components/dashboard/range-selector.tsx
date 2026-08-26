"use client";

import { cn } from "@/lib/utils";

const RANGES = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "all", label: "All time" },
] as const;

export type RangeValue = (typeof RANGES)[number]["value"];

export function RangeSelector({
  value,
  onChange,
}: {
  value: RangeValue;
  onChange: (value: RangeValue) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-card p-1">
      {RANGES.map((r) => (
        <button
          key={r.value}
          onClick={() => onChange(r.value)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            value === r.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
