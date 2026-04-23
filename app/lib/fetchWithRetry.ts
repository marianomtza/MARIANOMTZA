function abortError() {
  return new DOMException('Request aborted', 'AbortError')
}

export async function fetchWithRetry(
  input: RequestInfo | URL,
  init: RequestInit = {},
  retries = 2,
  timeoutMs = 8000
): Promise<Response> {
  let lastError: unknown

  for (let attempt = 0; attempt <= retries; attempt++) {
    const timeoutController = new AbortController()
    const callerSignal = init.signal

    const onCallerAbort = () => timeoutController.abort(callerSignal?.reason)
    if (callerSignal) {
      if (callerSignal.aborted) throw abortError()
      callerSignal.addEventListener('abort', onCallerAbort, { once: true })
    }

    const timer = setTimeout(() => timeoutController.abort(), timeoutMs)

    try {
      const response = await fetch(input, {
        ...init,
        signal: timeoutController.signal,
      })

      if (response.ok) return response

      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        return response
      }

      lastError = new Error(`Request failed with status ${response.status}`)
    } catch (error) {
      if (timeoutController.signal.aborted && callerSignal?.aborted) {
        throw abortError()
      }

      lastError = error
    } finally {
      clearTimeout(timer)
      if (callerSignal) callerSignal.removeEventListener('abort', onCallerAbort)
    }

    if (attempt < retries) {
      const jitter = Math.floor(Math.random() * 120)
      const backoffMs = 350 * Math.pow(2, attempt) + jitter
      await new Promise((resolve) => setTimeout(resolve, backoffMs))
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Request failed')
}
