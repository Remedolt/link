import { BarChart3, Link2, MousePointerClick, Zap } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/utils";
import type { AnalyticsSummary } from "@/lib/types";

const CARDS = [
  {
    key: "totalClicks" as const,
    label: "Total clicks",
    icon: MousePointerClick,
  },
  { key: "activeLinks" as const, label: "Active links", icon: Zap },
  { key: "totalLinks" as const, label: "Total links", icon: Link2 },
  {
    key: "topReferrer" as const,
    label: "Top referrer",
    icon: BarChart3,
  },
];

export function StatCards({ data }: { data: AnalyticsSummary | null }) {
  if (!data) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((c) => (
          <Card key={c.key}>
            <CardContent>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="mt-3 h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const topReferrer = data.topReferrers[0]?.name ?? "—";

  const values: Record<(typeof CARDS)[number]["key"], string> = {
    totalClicks: formatNumber(data.totalClicks),
    activeLinks: formatNumber(data.activeLinks),
    totalLinks: formatNumber(data.totalLinks),
    topReferrer,
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {CARDS.map((c) => (
        <Card key={c.key}>
          <CardContent className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{c.label}</p>
              <p className="mt-2 truncate text-2xl font-semibold" title={values[c.key]}>
                {values[c.key]}
              </p>
            </div>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <c.icon className="size-4" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
