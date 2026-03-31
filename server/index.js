/**
 * Express BFF server for the Boomi EmbedKit Integration Manager
 * Follows the official embedkit-examples/server pattern:
 *  - single-tenant (config via env)
 *  - no DB (any valid email+password accepted in demo mode)
 *  - JWT session cookie (2-hour TTL)
 *  - EmbedKit nonce issued on login and refreshed on /api/session/nonce
 *
 * Node 18+ built-in fetch is used (node-fetch not required).
 */
import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken'
import { RateLimiterMemory } from 'rate-limiter-flexible'
import integrationsRouter from './routes/integrations.js'
import availableIntegrationsRouter from './routes/available-integrations.js'
import environmentsRouter from './routes/environments.js'

/* ------------ env ------------ */
const {
  PORT = 8080,
  NODE_ENV,
  JWT_SECRET,
  CORS_ORIGINS,
  COOKIE_DOMAIN,
  EMBEDKIT_SERVER_BASE,
  API_URL,
  API_ACCOUNT_ID,
  API_USERNAME,
  API_TOKEN,
  API_AUTH_USER,
  API_ACCOUNT_GROUP,
} = process.env

/* ------------ session email store (no DB demo) ------------ */
let iEmail

/* ------------ app ------------ */
const app = express()
app.set('trust proxy', 1)
app.disable('x-powered-by')
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'same-site' } }))
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'tiny'))
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

/* ------------ CORS (multi-origin, credentialed) ------------ */
const ALLOW_ORIGINS = new Set(
  (CORS_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
)

app.use((req, res, next) => {
  const origin = req.headers.origin
  if (origin && ALLOW_ORIGINS.has(origin)) {
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Vary', 'Origin')
  }
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

/* ------------ rate limit ------------ */
const limiter = new RateLimiterMemory({ points: 100, duration: 60 })
app.use(async (req, res, next) => {
  try {
    await limiter.consume(req.ip)
    return next()
  } catch {
    return res.status(429).json({ error: 'rate_limited' })
  }
})

/* ------------ cookie helpers ------------ */
function cookieOptions(req) {
  const origin = req.headers.origin || ''
  const allow = origin && ALLOW_ORIGINS.has(origin)
  const isProd = NODE_ENV === 'production'
  return {
    httpOnly: true,
    secure: allow || isProd,           // required when SameSite=None
    sameSite: allow ? 'none' : 'lax',  // cross-site vs same-site
    path: '/',
    domain: COOKIE_DOMAIN || undefined,
  }
}

/* ------------ session helpers ------------ */
function setSession(req, res, claims) {
  if (!claims || typeof claims !== 'object') {
    return res.status(500).json({ error: 'internal_no_claims' })
  }
  if (!JWT_SECRET) {
    return res.status(500).json({ error: 'server_misconfigured' })
  }
  const token = jwt.sign(claims, JWT_SECRET, { expiresIn: '2h' })
  res.cookie('sid', token, { ...cookieOptions(req), maxAge: 2 * 60 * 60 * 1000 })
}

function requireAuth(req, res, next) {
  const c = req.cookies?.sid
  if (!c) return res.status(401).json({ error: 'unauthorized' })
  try {
    req.user = jwt.verify(c, JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'unauthorized' })
  }
}

/* ------------ Boomi payload helper ------------ */
function boomiPayload() {
  return {
    url: API_URL,
    parentAccountId: API_ACCOUNT_ID,
    apiUserName: API_USERNAME,
    apiToken: API_TOKEN,
    childAccountId: API_AUTH_USER || undefined,
    accountGroup: API_ACCOUNT_GROUP || undefined,
  }
}

/* ------------ routes ------------ */

// Health
app.get('/api/ping', (_req, res) => res.json({ ok: true }))

// Login — set JWT cookie + return EmbedKit nonce
app.post('/api/session', async (req, res) => {
  console.log('[login] Login attempt')
  const { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ error: 'email_and_password_required' })
  }
  iEmail = String(email).toLowerCase()
  console.log(`[login] User logged in: ${email}`)

  setSession(req, res, {
    sub: iEmail,
    email: iEmail,
    isAdmin: false,
  })

  try {
    const origin = req.headers.origin || ''
    console.log('Request Session Origin:', origin, API_ACCOUNT_ID)
    const r = await fetch(`${EMBEDKIT_SERVER_BASE}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Origin: origin,
        'X-Tenant-Id': API_ACCOUNT_ID || '',
      },
      body: JSON.stringify(boomiPayload()),
    })

    if (!r.ok) {
      const errText = await r.text().catch(() => '')
      console.error('EmbedKit Server login failed:', r.status, errText)
      return res.status(r.status).json({ error: 'Login Failed', detail: errText })
    }

    const { nonce, ttlSec } = await r.json()
    return res.json({ nonce, ttlSec, serverBase: EMBEDKIT_SERVER_BASE, tenantId: API_ACCOUNT_ID })
  } catch (e) {
    console.error('Error connecting to EmbedKit Server:', e)
    return res.status(502).json({ error: 'embedkit_server_unreachable' })
  }
})

// Session check — returns current user if JWT cookie is valid
app.get('/api/session', requireAuth, (_req, res) => {
  res.json({ ok: true, user: { id: String(iEmail), email: iEmail, isAdmin: false } })
})

// Logout — clear JWT cookie
app.delete('/api/session', (req, res) => {
  res.clearCookie('sid', cookieOptions(req))
  res.json({ ok: true })
})

// Nonce refresh — returns a fresh EmbedKit nonce for an existing session
app.post('/api/session/nonce', requireAuth, async (req, res) => {
  try {
    const origin = req.headers.origin || ''
    console.log('Request Nonce Origin:', origin)
    const r = await fetch(`${EMBEDKIT_SERVER_BASE}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Id': API_ACCOUNT_ID || '',
        Origin: origin,
      },
      body: JSON.stringify(boomiPayload()),
    })

    if (!r.ok) {
      const errText = await r.text().catch(() => '')
      return res.status(r.status).json({ error: 'embedkit_server_login_failed', detail: errText })
    }

    const { nonce, ttlSec } = await r.json()
    return res.json({ serverBase: EMBEDKIT_SERVER_BASE, nonce, ttlSec, tenantId: API_ACCOUNT_ID })
  } catch {
    return res.status(502).json({ error: 'embedkit_server_unreachable' })
  }
})

/* ------------ Boomi API proxy routes ------------ */
app.use('/api/integrations', integrationsRouter)
app.use('/api/available-integrations', availableIntegrationsRouter)
app.use('/api/environments', environmentsRouter)

/* ------------ start ------------ */
app.listen(Number(PORT), () => {
  console.log(`API listening on :${PORT}`)
  console.log('Allowed origins:', [...ALLOW_ORIGINS].join(', ') || '(none — set CORS_ORIGINS in .env)')
})
