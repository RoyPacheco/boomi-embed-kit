import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Zap, BarChart2, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../state/authContext.jsx'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',    path: '/' },
  { icon: Zap,             label: 'Integrations', path: '/integrations' },
  { icon: BarChart2,       label: 'Reports',      path: '/reports' },
  { icon: Settings,        label: 'Settings',     path: '/settings' },
]

export default function Sidebar() {
  const { session, logout } = useAuth()
  const { pathname } = useLocation()

  return (
    <aside
      style={{
        width: '220px',
        minWidth: '220px',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E5E7EB',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
      }}
    >
      {/* Logo / Brand */}
      <div
        style={{
          padding: '20px',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            backgroundColor: '#1565C0',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Zap size={17} color="#FFFFFF" />
        </div>
        <span style={{ fontWeight: '700', fontSize: '15px', color: '#111827' }}>
          Boomi Kit
        </span>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '12px', flex: 1 }}>
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = path === '/' ? pathname === '/' : pathname.startsWith(path)
          return (
            <Link
              key={path}
              to={path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                borderRadius: '6px',
                marginBottom: '2px',
                cursor: 'pointer',
                backgroundColor: isActive ? '#EFF6FF' : 'transparent',
                color: isActive ? '#1565C0' : '#6B7280',
                borderLeft: isActive ? '3px solid #1565C0' : '3px solid transparent',
                fontWeight: isActive ? '500' : '400',
                fontSize: '14px',
                textDecoration: 'none',
                transition: 'all 150ms ease',
                userSelect: 'none',
              }}
            >
              <Icon size={17} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User / Logout */}
      <div style={{ padding: '12px', borderTop: '1px solid #E5E7EB' }}>
        {session?.email && (
          <p
            style={{
              fontSize: '12px',
              color: '#9CA3AF',
              marginBottom: '8px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              padding: '0 4px',
            }}
          >
            {session.email}
          </p>
        )}
        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
            padding: '9px 12px',
            borderRadius: '6px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: '#6B7280',
            fontSize: '14px',
            fontFamily: 'inherit',
            transition: 'all 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#FEF2F2'
            e.currentTarget.style.color = '#DC2626'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = '#6B7280'
          }}
        >
          <LogOut size={17} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}
