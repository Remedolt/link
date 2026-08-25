import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate limiting for anonymous (unauthenticated) link creation.
 *
 * Uses Upstash Redis when credentials are configured (recommended in
 * production / serverless, since it's shared across instances). Falls back
 * to an in-memory sliding window otherwise, so the app still works out of
 * the box in local development without any extra setup.
 */

const hasUpstash =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

const upstashLimiter = hasUpstash
  ? new Ratelimit({
      redis: new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      }),
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      analytics: true,
      prefix: "urlshortener:ratelimit",
    })
  : null;

// In-memory fallback: Map<key, timestamps[]>. Fine for a single instance /
// local dev; not shared across serverless invocations in production.
const memoryHits = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

function memoryLimit(key: string) {
  const now = Date.now();
  const hits = (memoryHits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  memoryHits.set(key, hits);
  const success = hits.length <= MAX_REQUESTS;
  return {
    success,
    limit: MAX_REQUESTS,
    remaining: Math.max(0, MAX_REQUESTS - hits.length),
    reset: now + WINDOW_MS,
  };
}

export async function rateLimit(key: string) {
  if (upstashLimiter) {
    const res = await upstashLimiter.limit(key);
    return res;
  }
  return memoryLimit(key);
}

/** Best-effort client IP extraction from standard proxy headers. */
export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]!.trim();
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp;
  return "127.0.0.1";
}
