"use client";

import { useEffect, useState } from "react";

import { StatCards } from "@/components/dashboard/stat-cards";
import { ClicksChart } from "@/components/dashboard/clicks-chart";
import { DeviceChart } from "@/components/dashboard/device-chart";
import { TopLists } from "@/components/dashboard/top-lists";
import { LinksTable } from "@/components/dashboard/links-table";
import { RangeSelector, type RangeValue } from "@/components/dashboard/range-selector";
import type { AnalyticsSummary } from "@/lib/types";

export function DashboardShell() {
  const [range, setRange] = useState<RangeValue>("30d");
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);

  // Only true before the very first successful fetch — once we have data,
  // a range change re-fetches in the background and swaps in place rather
  // than flashing a skeleton over the existing charts.
  const loading = summary === null;

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/analytics?range=${range}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setSummary(data);
      });
    return () => {
      cancelled = true;
    };
  }, [range]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of your links and click activity.
          </p>
        </div>
        <RangeSelector value={range} onChange={setRange} />
      </div>

      <StatCards data={summary} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ClicksChart data={summary?.timeseries ?? []} loading={loading} />
        </div>
        <DeviceChart data={summary?.deviceBreakdown ?? []} loading={loading} />
      </div>

      <TopLists
        referrers={summary?.topReferrers ?? []}
        countries={summary?.topCountries ?? []}
        browsers={summary?.topBrowsers ?? []}
        loading={loading}
      />

      <div>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Your links</h2>
        <LinksTable />
      </div>
    </div>
  );
}
