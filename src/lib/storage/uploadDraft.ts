// Utilities for persisting per-video upload drafts in localStorage

export type UploadDraft = {
  videoId: string
  step?: string
  // Selections per stage
  title?: string
  description?: string
  timestamps?: string
  thumbnailUrl?: string
}

const PREFIX = 'postsiva:upload:draft:'

const isBrowser = () => typeof window !== 'undefined'

function read<T>(key: string): T | null {
  if (!isBrowser()) return null
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write<T>(key: string, value: T) {
  if (!isBrowser()) return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore quota or serialize errors silently
  }
}

export function loadUploadDraft(videoId: string): UploadDraft | null {
  return read<UploadDraft>(`${PREFIX}${videoId}`)
}

export function saveUploadDraft(videoId: string, patch: Partial<UploadDraft>) {
  const key = `${PREFIX}${videoId}`
  const existing = read<UploadDraft>(key) ?? { videoId }
  const next = { ...existing, ...patch, videoId }
  write(key, next)
}

export function clearUploadDraft(videoId: string) {
  if (!isBrowser()) return
  try {
    localStorage.removeItem(`${PREFIX}${videoId}`)
  } catch {}
}
