import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { initBoomi, destroyBoomi } from './boomiProvider.jsx'

// When using Vite's /api proxy, VITE_SERVER_URL is left empty so all fetch
// calls resolve relative to the dev server (e.g. /api/session → localhost:3000/api/session
// → proxied to localhost:4000/api/session).
const API_BASE = import.meta.env.VITE_SERVER_URL || ''

const Ctx = createContext(null)

/* ── Tiny fetch helpers ────────────────────────────────────────────── */
async function postJSON(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const ct = res.headers.get('content-type') || ''
  const text = await res.text()
  let data = null
  if (ct.includes('application/json')) {
    try { data = JSON.parse(text) } catch {}
  }
  return { ok: res.ok, data, text }
}

async function getJSON(url) {
  const res = await fetch(url, { credentials: 'include' })
  const ct = res.headers.get('content-type') || ''
  const text = await res.text()
  let data = null
  if (ct.includes('application/json')) {
    try { data = JSON.parse(text) } catch {}
  }
  return { ok: res.ok, data, text }
}

/* ── AuthProvider ──────────────────────────────────────────────────── */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true) // true until boot check finishes

  // Boot: check for an existing valid JWT cookie and re-initialise the plugin.
  const booted = useRef(false)
  useEffect(() => {
    if (booted.current) return
    booted.current = true
    ;(async () => {
      try {
        const me = await getJSON(`${API_BASE}/api/session`)
        if (me.ok && me.data?.user) {
          setSession({ email: me.data.user.email, isAdmin: !!me.data.user.isAdmin })
          // Get a fresh nonce for the existing session and init the plugin
          const r = await postJSON(`${API_BASE}/api/session/nonce`)
          if (r.ok && r.data?.nonce) {
            await initBoomi(r.data)
          }
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  async function login(email, password) {
    const r = await postJSON(`${API_BASE}/api/session`, { email, password })
    if (!r.ok) {
      const msg = r.data?.error || r.data?.message || r.text?.slice(0, 200) || 'Unable to sign in'
      return { ok: false, message: msg }
    }
    // r.data = { nonce, ttlSec, serverBase, tenantId }
    await initBoomi(r.data)
    // Fetch the user record now that the cookie is set
    const me = await getJSON(`${API_BASE}/api/session`)
    if (me.ok && me.data?.user) {
      setSession({ email: me.data.user.email, isAdmin: !!me.data.user.isAdmin })
    }
    return { ok: true }
  }

  async function logout() {
    await fetch(`${API_BASE}/api/session`, { method: 'DELETE', credentials: 'include' })
    destroyBoomi()
    setSession(null)
  }

  async function ensureNonce() {
    const r = await postJSON(`${API_BASE}/api/session/nonce`)
    if (!r.ok) return null
    return r.data
  }

  const value = useMemo(
    () => ({ session, loading, login, logout, ensureNonce }),
    [session, loading],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
