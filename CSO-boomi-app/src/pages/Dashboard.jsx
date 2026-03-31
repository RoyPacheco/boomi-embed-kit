import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, LayoutGrid, List, Plug, AlertTriangle } from 'lucide-react'
import SearchBar from '../components/SearchBar.jsx'
import IntegrationCard from '../components/IntegrationCard.jsx'
import AddIntegrationModal from '../components/AddIntegrationModal.jsx'
import BoomiMount from '../components/BoomiMount.jsx'
import { getIntegrations } from '../services/api.js'

// ── Skeleton card ──────────────────────────────────────────────────
function SkeletonCard() {
  const bar = (w, h = '12px', radius = '4px') => ({
    height: h,
    width: w,
    backgroundColor: '#F3F4F6',
    borderRadius: radius,
    animation: 'pulse 1.5s ease-in-out infinite',
  })

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #BFDBFE',
        borderRadius: '10px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div style={bar('55px', '10px')} />
      <div style={bar('75%', '15px')} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={bar('100%', '13px')} />
        <div style={bar('65%', '13px')} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
        <div style={bar('56px', '22px', '20px')} />
        <div style={bar('64px', '32px', '6px')} />
      </div>
    </div>
  )
}

// ── Toast system ───────────────────────────────────────────────────
function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 200,
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => onDismiss(toast.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: toast.type === 'success' ? '#065F46' : '#991B1B',
            color: '#FFFFFF',
            fontSize: '13px',
            fontWeight: '500',
            boxShadow: '0 4px 16px rgba(0,0,0,.18)',
            minWidth: '240px',
            maxWidth: '360px',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <span style={{ flex: 1 }}>{toast.message}</span>
          <span style={{ opacity: 0.7, fontSize: '18px', lineHeight: 1 }}>×</span>
        </div>
      ))}
    </div>
  )
}

// ── Empty state ────────────────────────────────────────────────────
function EmptyState({ search }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 0',
        gap: '12px',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          backgroundColor: '#F3F4F6',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '4px',
        }}
      >
        <Plug size={26} color="#9CA3AF" />
      </div>
      <p style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
        No integrations found
      </p>
      <p style={{ fontSize: '14px', color: '#6B7280' }}>
        {search
          ? `No results for "${search}"`
          : 'Get started by adding your first integration.'}
      </p>
    </div>
  )
}

// ── Session error banner ───────────────────────────────────────────
function SessionBanner({ message }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 32px',
        backgroundColor: '#FEF3C7',
        borderBottom: '1px solid #FCD34D',
        fontSize: '13px',
        color: '#92400E',
      }}
    >
      <AlertTriangle size={15} />
      <span>
        <strong>Boomi plugin not connected:</strong> {message}. Check your{' '}
        <code style={{ fontFamily: 'monospace' }}>server/.env</code> variables.
      </span>
    </div>
  )
}

// ── EmbedKit full-screen overlay ───────────────────────────────────
// Renders the Boomi Integrations component inside a modal overlay.
// Called when the user clicks "Edit" on an integration card.
function BoomiOverlay({ integration, onClose }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,.55)',
        zIndex: 110,
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          margin: '32px auto',
          width: '100%',
          maxWidth: '1080px',
          height: 'calc(100vh - 64px)',
          borderRadius: '12px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,.25)',
        }}
      >
        {/* Overlay header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            borderBottom: '1px solid #E5E7EB',
          }}
        >
          <p style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>
            {integration?.name ?? 'Integration'}
          </p>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: '1px solid #D1D5DB',
              borderRadius: '6px',
              padding: '6px 14px',
              fontSize: '13px',
              cursor: 'pointer',
              color: '#374151',
              fontFamily: 'inherit',
            }}
          >
            Close
          </button>
        </div>

        {/* EmbedKit renders here via BoomiMount */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <BoomiMount
            component="Integrations"
            componentKey={`integration-${integration?.id ?? 'new'}`}
            props={{ showTitle: true, showDescription: false }}
          />
        </div>
      </div>
    </div>
  )
}

// ── Main Dashboard (Integrations page) ────────────────────────────
export default function Dashboard({ sessionError }) {
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [boomiOverlayTarget, setBoomiOverlayTarget] = useState(null)
  const [gridView, setGridView] = useState(true)
  const [toasts, setToasts] = useState([])

  const { data: integrations = [], isLoading, isError } = useQuery({
    queryKey: ['integrations'],
    queryFn: getIntegrations,
  })

  const filtered = integrations.filter((i) =>
    (i.name || '').toLowerCase().includes(search.toLowerCase()),
  )

  const addToast = ({ type, message }) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }

  const handleDuplicate = (integration) => {
    // Duplicate pre-fills the Add modal with a copied name
    setShowAddModal({ defaultValues: { ...integration, id: undefined, name: `${integration.name || 'Untitled'} (copy)` } })
  }

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: gridView
      ? 'repeat(auto-fill, minmax(260px, 1fr))'
      : '1fr',
    gap: '16px',
  }

  return (
    <>
      {/* Session error banner (shown when Boomi plugin could not be initialised) */}
      {sessionError && <SessionBanner message={sessionError} />}

      {/* Page header */}
      <div style={{ padding: '32px 32px 0' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
          Integrations
        </h1>
        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px' }}>
          View and manage your active integrations.
        </p>

        {/* Action bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
            flexWrap: 'wrap',
          }}
        >
          <SearchBar value={search} onChange={setSearch} />

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#1565C0',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '9px 16px',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'background-color 150ms ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1976D2')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1565C0')}
          >
            <Plus size={15} />
            Add Integration
          </button>

          {/* Grid / List toggle */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
            {[
              { Icon: LayoutGrid, isGrid: true, title: 'Grid view' },
              { Icon: List, isGrid: false, title: 'List view' },
            ].map(({ Icon, isGrid, title }) => (
              <button
                key={String(isGrid)}
                onClick={() => setGridView(isGrid)}
                title={title}
                style={{
                  padding: '7px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: gridView === isGrid ? '#EFF6FF' : '#FFFFFF',
                  color: gridView === isGrid ? '#1565C0' : '#6B7280',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 150ms ease',
                }}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content area */}
      <div style={{ padding: '0 32px 32px' }}>
        {isLoading ? (
          <div style={gridStyle}>
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : isError ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: '16px', fontWeight: '500', color: '#EF4444' }}>
              Failed to load integrations.
            </p>
            <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '8px' }}>
              Check your server connection and API credentials.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState search={search} />
        ) : (
          <div style={gridStyle}>
            {filtered.map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                // "Edit" opens the full EmbedKit Integrations component in an overlay
                onEdit={(i) => setBoomiOverlayTarget(i)}
                onDuplicate={handleDuplicate}
                onToast={addToast}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Integration modal (custom form with EmbedKit hooks for dropdowns) */}
      {showAddModal && (
        <AddIntegrationModal
          onClose={() => setShowAddModal(false)}
          onToast={addToast}
          defaultValues={showAddModal?.defaultValues}
        />
      )}

      {/* EmbedKit full-screen overlay — renders the Boomi Integrations component */}
      {boomiOverlayTarget && (
        <BoomiOverlay
          integration={boomiOverlayTarget}
          onClose={() => setBoomiOverlayTarget(null)}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
    </>
  )
}
