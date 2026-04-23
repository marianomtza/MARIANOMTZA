'use client'

export async function fetchWithRetry(
  input: RequestInfo | URL,
  init: RequestInit = {},
  retries = 2,
  timeoutMs = 8000
): Promise<Response> {
  let lastError: unknown

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetch(input, {
        ...init,
        signal: controller.signal,
      })

      clearTimeout(timer)

      if (response.ok) return response

      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        return response
      }

      lastError = new Error(`Request failed with status ${response.status}`)
    } catch (error) {
      lastError = error
    } finally {
      clearTimeout(timer)
    }

    if (attempt < retries) {
      const backoffMs = 350 * Math.pow(2, attempt)
      await new Promise((resolve) => setTimeout(resolve, backoffMs))
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Request failed')
}
