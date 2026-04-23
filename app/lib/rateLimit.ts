const store = new Map<string, number[]>()

interface RateLimitOptions {
  limit: number
  windowMs: number
}

export function applyRateLimit(key: string, options: RateLimitOptions) {
  const now = Date.now()
  const windowStart = now - options.windowMs
  const existing = store.get(key) || []
  const recent = existing.filter((timestamp) => timestamp >= windowStart)

  if (recent.length >= options.limit) {
    return { ok: false, remaining: 0 }
  }

  recent.push(now)
  store.set(key, recent)

  return { ok: true, remaining: Math.max(options.limit - recent.length, 0) }
}
