import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { notFound } from "next/navigation";
import { after } from "next/server";

import { prisma } from "@/lib/prisma";
import { parseUserAgent, geoFromHeaders } from "@/lib/analytics";
import { getClientIp } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

// The redirect engine: app/[shortCode]/route.ts
// Looks up the short code, 404s on anything invalid/expired/inactive, then
// issues a fast 302 redirect. Click counting + analytics logging happen
// via `after()` so they never add latency to the redirect itself.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> },
) {
  const { shortCode } = await params;

  const link = await prisma.link.findFirst({
    where: { OR: [{ shortCode }, { customAlias: shortCode }] },
    select: { id: true, originalUrl: true, isActive: true, expiresAt: true },
  });

  if (!link) notFound();
  if (!link.isActive) notFound();
  if (link.expiresAt && link.expiresAt < new Date()) notFound();

  after(async () => {
    const userAgent = request.headers.get("user-agent");
    const referrer = request.headers.get("referer") || request.headers.get("referrer");
    const { deviceType, browser, os } = parseUserAgent(userAgent);
    const { country, city } = geoFromHeaders(request.headers);
    const ipAddress = getClientIp(request.headers);

    await prisma.$transaction([
      prisma.link.update({
        where: { id: link.id },
        data: { clickCount: { increment: 1 } },
      }),
      prisma.analytics.create({
        data: {
          linkId: link.id,
          referrer,
          userAgent,
          ipAddress,
          deviceType,
          browser,
          os,
          country,
          city,
        },
      }),
    ]);
  });

  return NextResponse.redirect(link.originalUrl, { status: 302 });
}
