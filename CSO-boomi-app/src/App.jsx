import { useAuth } from './state/authContext.jsx'
import { isBoomiReady } from './state/boomiProvider.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Login from './pages/Login.jsx'

/**
 * Root component.
 *
 * Renders a full-screen spinner while the boot check (GET /api/session) runs,
 * then either the Login page or the Dashboard depending on session state.
 * The Boomi plugin is initialised inside AuthProvider before the Dashboard mounts,
 * so isBoomiReady() is true by the time Dashboard first renders.
 */
export default function App() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F5F6F8',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            border: '3px solid #BFDBFE',
            borderTopColor: '#1565C0',
            borderRadius: '50%',
            animation: 'spin 0.75s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!session) return <Login />

  return <Dashboard pluginReady={isBoomiReady()} sessionError={null} />
}
