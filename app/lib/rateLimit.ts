const WINDOW_MS = 60_000

type Bucket = { count: number; resetAt: number }

const store = new Map<string, Bucket>()

export function checkRateLimit(key: string, limit: number) {
  const now = Date.now()
  const current = store.get(key)

  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 }
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000),
    }
  }

  current.count += 1
  store.set(key, current)

  return { allowed: true, remaining: Math.max(0, limit - current.count), retryAfterSeconds: 0 }
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown'
  }
  return request.headers.get('x-real-ip') ?? 'unknown'
}
