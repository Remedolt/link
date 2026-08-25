"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Laptop, Smartphone, Tablet, Bot, HelpCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { NamedCount } from "@/lib/types";

const DEVICE_META: Record<string, { label: string; icon: typeof Laptop; color: string }> = {
  desktop: { label: "Desktop", icon: Laptop, color: "var(--chart-1)" },
  mobile: { label: "Mobile", icon: Smartphone, color: "var(--chart-2)" },
  tablet: { label: "Tablet", icon: Tablet, color: "var(--chart-3)" },
  bot: { label: "Bot / crawler", icon: Bot, color: "var(--chart-4)" },
  unknown: { label: "Unknown", icon: HelpCircle, color: "var(--chart-5)" },
};

function metaFor(key: string) {
  return DEVICE_META[key] ?? { label: key, icon: HelpCircle, color: "var(--chart-5)" };
}

function DeviceTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { name: string; count: number } }[];
}) {
  if (!active || !payload?.length) return null;
  const { name, count } = payload[0].payload;
  const meta = metaFor(name);
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="text-xs text-muted-foreground">{meta.label}</p>
      <p className="font-semibold text-foreground">
        {count.toLocaleString()} <span className="font-normal text-muted-foreground">clicks</span>
      </p>
    </div>
  );
}

export function DeviceChart({ data, loading }: { data: NamedCount[]; loading: boolean }) {
  const chartData = data.map((d) => ({ ...d, meta: metaFor(d.name) }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Clicks by device</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        {loading ? (
          <Skeleton className="h-full w-full" />
        ) : chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No device data yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
              barCategoryGap={10}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                tickFormatter={(v: string) => metaFor(v).label}
                width={90}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--chart-muted)", fontSize: 12 }}
              />
              <Tooltip content={<DeviceTooltip />} cursor={{ fill: "var(--muted)" }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={24}>
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.meta.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
