/**
 * Singleton wrapper for the Boomi EmbedKit plugin.
 *
 * Uses a global registry keyed by a Symbol so the same plugin instance
 * survives React StrictMode double-invocations and HMR reloads.
 *
 * The CDN build exports named symbols (no default export):
 *   import { BoomiPlugin, RenderComponent, DestroyPlugin } from '@boomi-demo/embedkit-cdn/embedkit-cdn.js'
 */
import { BoomiPlugin, RenderComponent, DestroyPlugin } from '@boomi-demo/embedkit-cdn/embedkit-cdn.js'
import uiConfig from '../boomi.config.js'

const KEY = Symbol.for('boomi.embedkit.registry')

function getRegistry() {
  if (!globalThis.__BOOMI_REGISTRY__) globalThis.__BOOMI_REGISTRY__ = {}
  if (!globalThis.__BOOMI_REGISTRY__[KEY]) {
    globalThis.__BOOMI_REGISTRY__[KEY] = { state: 'idle', promise: null, renderNonce: 0 }
  }
  return globalThis.__BOOMI_REGISTRY__[KEY]
}

/**
 * Initialises the plugin with a fresh nonce payload.
 * Idempotent: if the plugin is already ready, returns immediately.
 */
export async function initBoomi(payload) {
  const reg = getRegistry()
  if (reg.state === 'ready') return
  if (reg.state === 'initializing' && reg.promise) return reg.promise

  reg.state = 'initializing'
  reg.promise = (async () => {
    BoomiPlugin({
      serverBase: payload.serverBase,
      tenantId: payload.tenantId,
      nonce: payload.nonce,
      boomiConfig: uiConfig,
    })
    // Allow the plugin one animation frame to wire up its internal state
    await new Promise((r) => requestAnimationFrame(() => r()))
    reg.state = 'ready'
  })()

  try {
    await reg.promise
  } catch (e) {
    reg.state = 'idle'
    reg.promise = null
    throw e
  }
}

export function isBoomiReady() {
  return getRegistry().state === 'ready'
}

/**
 * Renders a named EmbedKit component into the DOM node with the given hostId.
 * A monotonically-increasing __refresh__ prop forces the plugin to re-render
 * if the same component is mounted again after being destroyed.
 */
export function renderBoomiComponent({ hostId, component, props }) {
  const reg = getRegistry()
  reg.renderNonce += 1
  RenderComponent({
    hostId,
    component,
    props: { ...(props || {}), __refresh__: reg.renderNonce },
  })
}

/**
 * Tears down the plugin and resets the registry.
 * Called on logout so a subsequent login gets a clean slate.
 */
export function destroyBoomi() {
  const reg = getRegistry()
  reg.state = 'idle'
  reg.promise = null
  reg.renderNonce = 0
  try {
    DestroyPlugin({ removeHost: true, clearAuth: true })
  } catch {
    // DestroyPlugin may throw if already destroyed; ignore.
  }
}
