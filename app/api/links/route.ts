import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const SORTABLE_FIELDS = new Set(["createdAt", "clickCount", "originalUrl", "shortCode"]);

// GET /api/links?q=&sort=createdAt&order=desc&page=1&pageSize=10
// Lists the signed-in user's links with search, sorting, and pagination —
// backs the dashboard data table.
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q")?.trim() ?? "";
  const sortParam = searchParams.get("sort") ?? "createdAt";
  const sort = SORTABLE_FIELDS.has(sortParam) ? sortParam : "createdAt";
  const order = searchParams.get("order") === "asc" ? "asc" : "desc";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize")) || 10));

  const where: Prisma.LinkWhereInput = {
    userId: session.user.id,
    ...(q
      ? {
          OR: [
            { originalUrl: { contains: q, mode: "insensitive" } },
            { shortCode: { contains: q, mode: "insensitive" } },
            { customAlias: { contains: q, mode: "insensitive" } },
            { title: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [links, total] = await Promise.all([
    prisma.link.findMany({
      where,
      orderBy: { [sort]: order },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.link.count({ where }),
  ]);

  return NextResponse.json({
    links,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  });
}
