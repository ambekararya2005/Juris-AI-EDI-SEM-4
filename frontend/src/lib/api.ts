import { supabase } from './supabase'
import toast from 'react-hot-toast'

const getApiBase = (): string => {
  if (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL
  }
  try {
    // @ts-ignore — Vite only; safe in CRA via try/catch
    const env = (import.meta as { env?: { VITE_API_URL?: string } }).env
    if (env?.VITE_API_URL) return env.VITE_API_URL
  } catch {
    /* CRA */
  }
  return 'http://localhost:8000/api'
}

const API_BASE = getApiBase()

export function parseApiError(text: string): string {
  try {
    const parsed = JSON.parse(text) as { detail?: string | { msg?: string }[] }
    if (typeof parsed.detail === 'string') return parsed.detail
    if (Array.isArray(parsed.detail)) {
      return parsed.detail.map(d => d.msg || String(d)).join('. ')
    }
  } catch {
    /* plain text */
  }
  return text || 'Request failed'
}

/** Supabase access token — used for all FastAPI AI routes */
export async function getAccessToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

// ── Core fetch wrapper ──────────────────────────────────────────
export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = await getAccessToken()

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!res.ok) {
    const errorText = await res.text()
    const msg = parseApiError(errorText) || `HTTP ${res.status}`
    toast.error(msg)
    throw new Error(msg)
  }

  return res.json()
}

export function logoutUser() {
  localStorage.removeItem('jurisai_token')
  localStorage.removeItem('jurisai_role')
}

// ── Documents ───────────────────────────────────────────────────
export async function generateDraft(payload: {
  doc_type: string
  title?: string
  questionnaire_data: Record<string, unknown>
}) {
  return apiFetch('/documents/draft', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function listDocuments() {
  return apiFetch('/documents/')
}

export async function summarizeDocument(file: File) {
  const token = await getAccessToken()
  if (!token) {
    throw new Error('Not signed in. Please sign in again before uploading.')
  }
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${API_BASE}/documents/summarize`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })
  if (!res.ok) throw new Error(parseApiError(await res.text()))
  return res.json()
}

export async function analyzeRisk(file: File) {
  const token = await getAccessToken()
  if (!token) {
    throw new Error('Not signed in. Please sign in again before uploading.')
  }
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${API_BASE}/documents/risk-analysis`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })
  if (!res.ok) throw new Error(parseApiError(await res.text()))
  return res.json()
}

export async function askDocumentQuestion(
  docId: string,
  question: string,
  history: { role: string; content: string }[] = []
) {
  return apiFetch(`/documents/${docId}/qa`, {
    method: 'POST',
    body: JSON.stringify({ question, history }),
  })
}

export async function askDocumentQuestionInline(
  text: string,
  question: string,
  history: { role: string; content: string }[] = []
) {
  return apiFetch('/documents/qa-inline', {
    method: 'POST',
    body: JSON.stringify({ text, question, history }),
  })
}

export async function streamDraft(
  docType: string,
  data: Record<string, unknown>,
  onChunk: (text: string) => void
) {
  const token = await getAccessToken()
  const res = await fetch(`${API_BASE}/documents/draft/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ doc_type: docType, questionnaire_data: data, title: 'Draft' }),
  })
  if (!res.ok) throw new Error(await res.text())
  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value).replace(/^data: /, '')
    onChunk(chunk)
  }
}

export async function approveDocument(docId: string) {
  return apiFetch(`/documents/${docId}/approve`, { method: 'PATCH' })
}

export async function rejectDocument(docId: string, reason?: string) {
  return apiFetch(`/documents/${docId}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ reason: reason ?? '' }),
  })
}

// ── Case Law Search ─────────────────────────────────────────────
export async function searchCaseLaw(params: {
  q: string
  court?: string
  year_from?: number
  year_to?: number
  domain?: string
}) {
  const query = new URLSearchParams()
  query.set('q', params.q)
  if (params.court) query.set('court', params.court)
  if (params.year_from) query.set('year_from', String(params.year_from))
  if (params.year_to) query.set('year_to', String(params.year_to))
  if (params.domain) query.set('domain', params.domain)

  return apiFetch(`/search/case-law?${query.toString()}`)
}
