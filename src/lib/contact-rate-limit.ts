const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SECONDS = 60;

function rateLimitCacheKey(ip: string): Request {
  return new Request(`https://contact-rate-limit.internal/${encodeURIComponent(ip)}`, {
    method: "GET",
  });
}

/**
 * Worker-side rate limiter using the Cache API (5 POSTs/min per IP).
 *
 * Tradeoff vs Cloudflare dashboard Rate Limiting rules:
 * - Pros: version-controlled, no extra dashboard step, works on all plans with Workers.
 * - Cons: counts are per-PoP (not global), reset on cache eviction, slightly less precise
 *   than edge rate limiting rules. For a contact form this is sufficient.
 */
export async function isContactRateLimited(request: Request): Promise<boolean> {
  const ip =
    request.headers.get("CF-Connecting-IP") ??
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ??
    "unknown";

  const cache = (caches as unknown as { default: Cache }).default;
  const cacheKey = rateLimitCacheKey(ip);
  const existing = await cache.match(cacheKey);

  let count = 0;
  if (existing) {
    const parsed = Number.parseInt(await existing.text(), 10);
    if (!Number.isNaN(parsed)) {
      count = parsed;
    }
  }

  if (count >= RATE_LIMIT_MAX) {
    return true;
  }

  await (
    cache.put as (
      request: Request,
      response: Response,
      options?: { expirationTtl?: number },
    ) => Promise<void>
  )(cacheKey, new Response(String(count + 1), { status: 200 }), {
    expirationTtl: RATE_LIMIT_WINDOW_SECONDS,
  });

  return false;
}
