import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { startOfDay, startOfWeek, startOfMonth, subDays, formatISO } from "date-fns";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Granularity = "day" | "week" | "month";

function bucketStart(date: Date, granularity: Granularity) {
  if (granularity === "week") return startOfWeek(date, { weekStartsOn: 1 });
  if (granularity === "month") return startOfMonth(date);
  return startOfDay(date);
}

// GET /api/analytics?range=7d|30d|90d|all
// Aggregated stats for the dashboard overview + charts.
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const range = req.nextUrl.searchParams.get("range") ?? "30d";
  const days = range === "7d" ? 7 : range === "90d" ? 90 : range === "all" ? 3650 : 30;
  const granularity: Granularity = days <= 14 ? "day" : days <= 60 ? "day" : "week";
  const since = subDays(new Date(), days);

  const userLinks = await prisma.link.findMany({
    where: { userId },
    select: { id: true, clickCount: true, isActive: true, expiresAt: true },
  });
  const linkIds = userLinks.map((l) => l.id);

  const now = new Date();
  const totalClicks = userLinks.reduce((sum, l) => sum + l.clickCount, 0);
  const activeLinks = userLinks.filter(
    (l) => l.isActive && (!l.expiresAt || l.expiresAt > now),
  ).length;
  const totalLinks = userLinks.length;

  if (linkIds.length === 0) {
    return NextResponse.json({
      totalClicks: 0,
      totalLinks: 0,
      activeLinks: 0,
      topReferrers: [],
      topCountries: [],
      topBrowsers: [],
      deviceBreakdown: [],
      timeseries: [],
    });
  }

  const [referrerGroups, countryGroups, browserGroups, deviceGroups, events] =
    await Promise.all([
      prisma.analytics.groupBy({
        by: ["referrer"],
        where: { linkId: { in: linkIds } },
        _count: { _all: true },
        orderBy: { _count: { linkId: "desc" } },
        take: 6,
      }),
      prisma.analytics.groupBy({
        by: ["country"],
        where: { linkId: { in: linkIds } },
        _count: { _all: true },
        orderBy: { _count: { linkId: "desc" } },
        take: 6,
      }),
      prisma.analytics.groupBy({
        by: ["browser"],
        where: { linkId: { in: linkIds } },
        _count: { _all: true },
        orderBy: { _count: { linkId: "desc" } },
        take: 6,
      }),
      prisma.analytics.groupBy({
        by: ["deviceType"],
        where: { linkId: { in: linkIds } },
        _count: { _all: true },
      }),
      prisma.analytics.findMany({
        where: { linkId: { in: linkIds }, clickedAt: { gte: since } },
        select: { clickedAt: true },
        orderBy: { clickedAt: "asc" },
      }),
    ]);

  const buckets = new Map<string, number>();
  for (const { clickedAt } of events) {
    const key = formatISO(bucketStart(clickedAt, granularity), { representation: "date" });
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  const timeseries = Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, clicks]) => ({ date, clicks }));

  const mapGroup = (
    groups: Record<string, unknown>[],
    keyName: string,
    fallback = "Direct / Unknown",
  ) =>
    groups
      .map((g) => ({
        name: (g[keyName] as string | null) || fallback,
        count: (g._count as { _all: number })._all,
      }))
      .sort((a, b) => b.count - a.count);

  return NextResponse.json({
    totalClicks,
    totalLinks,
    activeLinks,
    topReferrers: mapGroup(referrerGroups, "referrer"),
    topCountries: mapGroup(countryGroups, "country", "Unknown"),
    topBrowsers: mapGroup(browserGroups, "browser", "Unknown"),
    deviceBreakdown: mapGroup(deviceGroups, "deviceType", "unknown"),
    timeseries,
  });
}
