export async function fetchWithRetry(input: RequestInfo | URL, init?: RequestInit, retries = 2) {
  let attempt = 0
  let lastError: Error | null = null

  while (attempt <= retries) {
    try {
      const response = await fetch(input, init)
      if (response.ok || response.status < 500 || attempt === retries) {
        return response
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Network request failed')
      if (attempt === retries) throw lastError
    }

    const delay = Math.min(250 * 2 ** attempt, 1000)
    await new Promise((resolve) => setTimeout(resolve, delay))
    attempt += 1
  }

  throw lastError ?? new Error('Request failed after retries')
}
