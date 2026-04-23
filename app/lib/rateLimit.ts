const store = new Map<string, number[]>()
const MAX_KEYS = 5000

interface RateLimitOptions {
  limit: number
  windowMs: number
}

function gcStore(windowMs: number) {
  const now = Date.now()
  const oldestAllowed = now - windowMs

  for (const [key, timestamps] of store.entries()) {
    const recent = timestamps.filter((timestamp) => timestamp >= oldestAllowed)

    if (recent.length === 0) {
      store.delete(key)
      continue
    }

    store.set(key, recent)
  }

  if (store.size > MAX_KEYS) {
    const overflow = store.size - MAX_KEYS
    let removed = 0
    for (const key of store.keys()) {
      store.delete(key)
      removed += 1
      if (removed >= overflow) break
    }
  }
}

export function applyRateLimit(key: string, options: RateLimitOptions) {
  const now = Date.now()
  const windowStart = now - options.windowMs
  const existing = store.get(key) || []
  const recent = existing.filter((timestamp) => timestamp >= windowStart)

  if (recent.length >= options.limit) {
    gcStore(options.windowMs)
    return { ok: false, remaining: 0, retryAfterMs: Math.max(options.windowMs - (now - recent[0]), 0) }
  }

  recent.push(now)
  store.set(key, recent)

  if (store.size % 200 === 0) {
    gcStore(options.windowMs)
  }

  return {
    ok: true,
    remaining: Math.max(options.limit - recent.length, 0),
    retryAfterMs: 0,
  }
}
