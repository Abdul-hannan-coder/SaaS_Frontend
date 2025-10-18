import axios from 'axios'

export function mapAxiosError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status
    const detail = (err.response?.data as any)?.detail
    if (status === 403) return 'Access denied. You do not have permission.'
    if (status === 413) return 'Payload too large. Please try a smaller file.'
    if (status === 401) return 'Authentication failed. Please login again.'
    if (status === 400) return detail || 'Invalid request.'
    if (status === 404) return 'Resource not found.'
    if (status === 422) return 'Invalid request data.'
    if (status === 429) return 'Too many requests. Please try again later.'
    if (status === 500) return 'Server error. Please try again later.'
    return `Request failed: ${status ?? 'unknown'} ${err.response?.statusText ?? ''}`.trim()
  }
  const anyErr = err as any
  if (anyErr?.name === 'AbortError') return 'Request was cancelled or timed out.'
  if (anyErr?.code === 'ECONNABORTED') return 'Request timed out. Please try again.'
  if (anyErr?.code === 'ERR_NETWORK') return 'Network error. Please check your connection.'
  if (typeof anyErr?.message === 'string') return anyErr.message
  return fallback
}
