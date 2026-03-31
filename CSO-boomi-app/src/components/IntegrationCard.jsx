import { useState, useRef, useEffect } from 'react'
import { MoreVertical, Pencil, Copy, Trash2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteIntegration } from '../services/api.js'

const STATUS_STYLES = {
  active: { bg: '#D1FAE5', text: '#065F46', label: 'Active' },
  inactive: { bg: '#F3F4F6', text: '#6B7280', label: 'Inactive' },
  error: { bg: '#FEE2E2', text: '#991B1B', label: 'Error' },
}

export default function IntegrationCard({ integration, onEdit, onDuplicate, onToast }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const queryClient = useQueryClient()

  const status = (integration.status || 'inactive').toLowerCase()
  const badge = STATUS_STYLES[status] || STATUS_STYLES.inactive

  const deleteMutation = useMutation({
    mutationFn: () => deleteIntegration(integration.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] })
      onToast({ type: 'success', message: 'Integration deleted.' })
    },
    onError: () => {
      onToast({ type: 'error', message: 'Failed to delete integration.' })
    },
  })

  // Close menu when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const menuActions = [
    {
      icon: Pencil,
      label: 'View details',
      action: () => { onEdit(integration); setMenuOpen(false) },
    },
    {
      icon: Copy,
      label: 'Duplicate',
      action: () => { onDuplicate(integration); setMenuOpen(false) },
    },
    {
      icon: Trash2,
      label: 'Delete',
      action: () => { deleteMutation.mutate(); setMenuOpen(false) },
      danger: true,
    },
  ]

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #BFDBFE',
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)',
        transition: 'all 200ms ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.10)'
        e.currentTarget.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Header: title + kebab */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
          <p
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '.06em',
              color: '#9CA3AF',
              marginBottom: '4px',
              fontWeight: '500',
            }}
          >
            Integration
          </p>
          <h3
            style={{
              fontSize: '15px',
              fontWeight: '600',
              color: '#111827',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {integration.name || 'Untitled'}
          </h3>
        </div>

        {/* Kebab menu */}
        <div style={{ position: 'relative', flexShrink: 0 }} ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              color: '#9CA3AF',
              display: 'flex',
              alignItems: 'center',
              transition: 'color 150ms ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#6B7280')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
            aria-label="More options"
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '30px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,.12)',
                zIndex: 50,
                minWidth: '152px',
                overflow: 'hidden',
              }}
            >
              {menuActions.map(({ icon: Icon, label, action, danger }) => (
                <button
                  key={label}
                  onClick={action}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '9px 14px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: danger ? '#DC2626' : '#374151',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                    transition: 'background-color 100ms ease',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = danger ? '#FEF2F2' : '#F9FAFB')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = 'transparent')
                  }
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <p
        style={{
          fontSize: '13px',
          color: '#6B7280',
          lineHeight: '1.5',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          minHeight: '39px',
        }}
      >
        {integration.description || 'No description provided.'}
      </p>

      {/* Footer: badge + edit button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 'auto',
        }}
      >
        <span
          style={{
            fontSize: '12px',
            fontWeight: '500',
            padding: '3px 9px',
            borderRadius: '20px',
            backgroundColor: badge.bg,
            color: badge.text,
          }}
        >
          {badge.label}
        </span>

        <button
          onClick={() => onEdit(integration)}
          style={{
            backgroundColor: '#1565C0',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '6px',
            padding: '7px 16px',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 150ms ease',
            fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1976D2')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1565C0')}
        >
          Edit
        </button>
      </div>
    </div>
  )
}
