import { Routes, Route } from 'react-router-dom'
import { useAuth } from './state/authContext.jsx'
import Sidebar from './components/Sidebar.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import Integrations from './pages/Dashboard.jsx'
import Reports from './pages/Reports.jsx'
import Settings from './pages/Settings.jsx'
import Login from './pages/Login.jsx'

function AppShell() {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div
        style={{
          flex: 1,
          backgroundColor: '#F5F6F8',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Routes>
          <Route path="/"             element={<DashboardPage />} />
          <Route path="/integrations" element={<Integrations sessionError={null} />} />
          <Route path="/reports"      element={<Reports />} />
          <Route path="/settings"     element={<Settings />} />
          <Route path="*"             element={
            <div style={{ padding: '32px', color: '#6B7280' }}>Page not found.</div>
          } />
        </Routes>
      </div>
    </div>
  )
}

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

  return <AppShell />
}
