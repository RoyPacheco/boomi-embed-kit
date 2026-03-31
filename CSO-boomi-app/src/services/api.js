import axios from 'axios'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || ''

const api = axios.create({
  // When VITE_SERVER_URL is set use it directly; otherwise rely on the Vite dev proxy
  baseURL: SERVER_URL ? `${SERVER_URL}/api` : '/api',
  withCredentials: true,
})

// ── EmbedKit session ───────────────────────────────────────────────
// Returns { nonce, ttlSec, serverBase, tenantId, childAccountId, accountGroup }
export const createSession = () =>
  api.post('/session').then((r) => r.data)

export const deleteSession = () =>
  api.delete('/session').then((r) => r.data)

// ── Integration instances ──────────────────────────────────────────
export const getIntegrations = () =>
  api.get('/integrations').then((r) => r.data)

export const createIntegration = (data) =>
  api.post('/integrations', data).then((r) => r.data)

export const getIntegration = (id) =>
  api.get(`/integrations/${id}`).then((r) => r.data)

export const updateIntegration = (id, data) =>
  api.put(`/integrations/${id}`, data).then((r) => r.data)

export const deleteIntegration = (id) =>
  api.delete(`/integrations/${id}`).then((r) => r.data)

// ── Catalogue data (fallback proxies if hooks are unavailable) ─────
export const getAvailableIntegrations = () =>
  api.get('/available-integrations').then((r) => r.data)

export const getEnvironments = () =>
  api.get('/environments').then((r) => r.data)
