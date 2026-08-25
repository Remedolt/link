import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { shortenSchema, RESERVED_CODES } from "@/lib/validations";
import { generateShortCode } from "@/lib/shortcode";
import { rateLimit, getClientIp } from "@/lib/ratelimit";
import { getBaseUrl } from "@/lib/utils";

const MAX_GENERATION_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  const session = await auth();

  // Rate limit anonymous users only — signed-in users are trusted by account.
  if (!session?.user) {
    const ip = getClientIp(req.headers);
    const { success, remaining, reset } = await rateLimit(`shorten:${ip}`);
    if (!success) {
      return NextResponse.json(
        { error: "Too many links created. Please try again in a minute or sign in." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": String(remaining),
            "X-RateLimit-Reset": String(reset),
          },
        },
      );
    }
  }

  const body = await req.json().catch(() => null);
  const parsed = shortenSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { originalUrl, customAlias, expiresAt } = parsed.data;

  if (customAlias) {
    if (RESERVED_CODES.has(customAlias.toLowerCase())) {
      return NextResponse.json(
        { error: "That alias is reserved. Please choose another." },
        { status: 400 },
      );
    }

    const existing = await prisma.link.findFirst({
      where: { OR: [{ shortCode: customAlias }, { customAlias }] },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: "That alias is already taken." },
        { status: 409 },
      );
    }
  }

  try {
    const link = await createLinkWithUniqueCode({
      originalUrl,
      customAlias: customAlias || null,
      userId: session?.user?.id ?? null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });

    return NextResponse.json(
      {
        link: {
          id: link.id,
          shortCode: link.shortCode,
          shortUrl: `${getBaseUrl()}/${link.shortCode}`,
          originalUrl: link.originalUrl,
          customAlias: link.customAlias,
          createdAt: link.createdAt,
          expiresAt: link.expiresAt,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("Failed to create short link", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

async function createLinkWithUniqueCode(data: {
  originalUrl: string;
  customAlias: string | null;
  userId: string | null;
  expiresAt: Date | null;
}) {
  const desiredCode = data.customAlias ?? generateShortCode();

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
    const shortCode = data.customAlias ? desiredCode : generateShortCode();
    try {
      return await prisma.link.create({
        data: {
          originalUrl: data.originalUrl,
          shortCode,
          customAlias: data.customAlias,
          userId: data.userId,
          expiresAt: data.expiresAt,
        },
      });
    } catch (err) {
      // Unique constraint collision on shortCode — retry with a fresh code,
      // unless it was a user-chosen alias (already validated as free above).
      const isUniqueViolation =
        err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
      if (!isUniqueViolation || data.customAlias) throw err;
    }
  }

  throw new Error("Could not generate a unique short code, please retry.");
}
