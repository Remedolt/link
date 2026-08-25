"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Point {
  date: string;
  clicks: number;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="text-xs text-muted-foreground">
        {format(new Date(label), "MMM d, yyyy")}
      </p>
      <p className="font-semibold text-foreground">
        {payload[0].value.toLocaleString()}{" "}
        <span className="font-normal text-muted-foreground">clicks</span>
      </p>
    </div>
  );
}

export function ClicksChart({ data, loading }: { data: Point[]; loading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Clicks over time</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        {loading ? (
          <Skeleton className="h-full w-full" />
        ) : data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No clicks recorded in this range yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="clicksFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="var(--chart-grid)"
                strokeDasharray="0"
              />
              <XAxis
                dataKey="date"
                tickFormatter={(v: string) => format(new Date(v), "MMM d")}
                stroke="var(--chart-axis)"
                tick={{ fill: "var(--chart-muted)", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
              />
              <YAxis
                allowDecimals={false}
                stroke="var(--chart-axis)"
                tick={{ fill: "var(--chart-muted)", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: "var(--chart-axis)", strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="clicks"
                stroke="var(--chart-1)"
                strokeWidth={2}
                fill="url(#clicksFill)"
                activeDot={{ r: 4, fill: "var(--chart-1)", stroke: "var(--card)", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
