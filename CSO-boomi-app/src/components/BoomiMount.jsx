/**
 * BoomiMount — drop-in component for rendering any named EmbedKit component.
 *
 * Usage:
 *   <BoomiMount component="Integrations" props={{ componentKey: 'integrationsPage' }} />
 *
 * The component:
 *  1. Generates (or accepts) a stable DOM id for the host div.
 *  2. On mount, ensures the plugin is initialised (calls ensureNonce + initBoomi if needed).
 *  3. Calls renderBoomiComponent so EmbedKit mounts inside the div.
 *  4. On unmount, cancels any in-flight init — does NOT destroy the plugin
 *     (destroying would break other mounted BoomiMount instances).
 */
import { useEffect, useId, useRef } from 'react'
import { initBoomi, isBoomiReady, renderBoomiComponent } from '../state/boomiProvider.jsx'
import { useAuth } from '../state/authContext.jsx'

export default function BoomiMount({ component, props, hostId, componentKey }) {
  const { ensureNonce } = useAuth()
  const autoId = useId()
  // Stable id for the lifetime of this component instance
  const idRef = useRef(hostId || `boomi-${autoId.replace(/:/g, '-')}`)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!isBoomiReady()) {
        const payload = await ensureNonce()
        if (payload) await initBoomi(payload)
      }
      if (cancelled) return
      renderBoomiComponent({
        hostId: idRef.current,
        component,
        props: componentKey ? { ...(props || {}), componentKey } : props,
      })
    })()
    return () => { cancelled = true } // guard against StrictMode double-invoke
  }, [component, JSON.stringify(props), componentKey, ensureNonce])

  return <div id={idRef.current} style={{ width: '100%', height: '100%' }} />
}
