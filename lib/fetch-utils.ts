/*
 * Utility functions for safe fetch operations
 * Handles HTML error pages returned instead of JSON
 */

/*
 * Safely parse JSON from response
 * If response is HTML (404, 500, etc.), returns null instead of throwing
 */
export async function safeJsonParse<T = any>(response: Response): Promise<T | null> {
  const contentType = response.headers.get('content-type')
  
  // Se não é JSON, retornar null
  if (!contentType || !contentType.includes('application/json')) {
    console.warn('⚠️ Response is not JSON:', {
      status: response.status,
      statusText: response.statusText,
      contentType,
      url: response.url
    })
    return null
  }

  try {
    return await response.json()
  } catch (error) {
    console.error('❌ Failed to parse JSON:', error)
    return null
  }
}

/*
 * Wrapper seguro para response.json() que valida Content-Type
 * Uso: const data = await safeParse(response)
 */
export async function safeParse<T = any>(response: Response): Promise<T | null> {
  return safeJsonParse<T>(response)
}

/*
 * Fetch with automatic JSON parsing and error handling
 */
export async function fetchJson<T = any>(
  url: string,
  options?: RequestInit
): Promise<{ data: T | null; error: string | null; response: Response }> {
  try {
    const response = await fetch(url, options)
    const data = await safeJsonParse<T>(response)

    if (!response.ok) {
      const errorMessage = 
        (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string')
          ? data.error
          : `Request failed: ${response.status} ${response.statusText}`

      return {
        data: null,
        error: errorMessage,
        response
      }
    }

    return {
      data,
      error: null,
      response
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Network error',
      response: new Response(null, { status: 0, statusText: 'Network Error' })
    }
  }
}
