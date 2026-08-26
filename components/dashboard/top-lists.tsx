"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { NamedCount } from "@/lib/types";

// Ranked "compare magnitude" lists — sequential (single hue), bar length
// encodes relative share. Values lead; labels stay in text tokens.
function RankedList({ items, loading }: { items: NamedCount[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        No data yet.
      </div>
    );
  }

  const max = Math.max(...items.map((i) => i.count), 1);

  return (
    <ul className="space-y-3">
      {items.slice(0, 6).map((item) => (
        <li key={item.name} className="flex items-center gap-3 text-sm">
          <span className="w-28 shrink-0 truncate text-foreground" title={item.name}>
            {item.name}
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max((item.count / max) * 100, 4)}%`,
                backgroundColor: "var(--chart-1)",
              }}
            />
          </div>
          <span className="w-10 shrink-0 text-right font-medium tabular-nums text-foreground">
            {item.count.toLocaleString()}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function TopLists({
  referrers,
  countries,
  browsers,
  loading,
}: {
  referrers: NamedCount[];
  countries: NamedCount[];
  browsers: NamedCount[];
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top sources</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="referrers">
          <TabsList>
            <TabsTrigger value="referrers">Referrers</TabsTrigger>
            <TabsTrigger value="countries">Geography</TabsTrigger>
            <TabsTrigger value="browsers">Browsers</TabsTrigger>
          </TabsList>
          <TabsContent value="referrers" className="pt-4">
            <RankedList items={referrers} loading={loading} />
          </TabsContent>
          <TabsContent value="countries" className="pt-4">
            <RankedList items={countries} loading={loading} />
          </TabsContent>
          <TabsContent value="browsers" className="pt-4">
            <RankedList items={browsers} loading={loading} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
