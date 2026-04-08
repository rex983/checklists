import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'

/**
 * Constant-time string comparison for secrets/tokens.
 * Returns false on length mismatch instead of leaking timing.
 */
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, 'utf8')
  const bb = Buffer.from(b, 'utf8')
  if (ab.length !== bb.length) return false
  return timingSafeEqual(ab, bb)
}

/**
 * Strict CSRF/origin check for state-changing browser requests.
 * Compares the parsed Origin host to the request Host header.
 * Server-to-server callers (no Origin header) must instead provide
 * a valid shared secret via verifySharedSecret.
 */
export function originMatchesHost(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')
  if (!origin || !host) return false
  try {
    const originHost = new URL(origin).host
    return originHost === host
  } catch {
    return false
  }
}

/**
 * Returns true if the request bears a valid shared secret in the
 * given header. Comparison is constant-time.
 */
export function verifySharedSecret(
  request: NextRequest,
  headerName: string,
  expected: string | undefined,
): boolean {
  if (!expected) return false
  const provided = request.headers.get(headerName)
  if (!provided) return false
  return safeEqual(provided, expected)
}

/* ------------------------------------------------------------------ */
/* Simple in-memory fixed-window per-IP rate limiter.                 */
/*                                                                    */
/* Caveats: state lives in the serverless function instance, so it    */
/* is per-region/per-cold-start and won't survive scaling. Adequate   */
/* as a coarse abuse brake; use Redis (Upstash) for stronger limits. */
/* ------------------------------------------------------------------ */

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()
const WINDOW_MS = 60_000
const DEFAULT_LIMIT = 30

function clientKey(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return request.headers.get('x-real-ip') ?? 'unknown'
}

export function rateLimit(
  request: NextRequest,
  scope: string,
  limit: number = DEFAULT_LIMIT,
): { ok: true } | { ok: false; retryAfter: number } {
  const key = `${scope}:${clientKey(request)}`
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return { ok: true }
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) }
  }

  bucket.count += 1
  return { ok: true }
}

export function rateLimitResponse(retryAfter: number): NextResponse {
  return NextResponse.json(
    { error: 'Too many requests' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } },
  )
}
