import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  isActive: z.boolean().optional(),
  title: z.string().max(200).optional(),
  expiresAt: z.string().datetime().nullable().optional(),
});

async function assertOwnership(id: string, userId: string) {
  const link = await prisma.link.findUnique({ where: { id }, select: { userId: true } });
  if (!link) return "not_found" as const;
  if (link.userId !== userId) return "forbidden" as const;
  return "ok" as const;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const status = await assertOwnership(id, session.user.id);
  if (status === "not_found") {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }
  if (status === "forbidden") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { expiresAt, ...rest } = parsed.data;

  const link = await prisma.link.update({
    where: { id },
    data: {
      ...rest,
      ...(expiresAt !== undefined ? { expiresAt: expiresAt ? new Date(expiresAt) : null } : {}),
    },
  });

  return NextResponse.json({ link });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const status = await assertOwnership(id, session.user.id);
  if (status === "not_found") {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }
  if (status === "forbidden") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.link.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
