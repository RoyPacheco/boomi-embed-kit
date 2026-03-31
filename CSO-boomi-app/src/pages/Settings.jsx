import { useMemo } from 'react'
import { drawDonut, drawLineChart, randomSeries } from '../utils/charts.js'
import { useCanvas } from '../hooks/useCanvas.js'
import { useAuth } from '../state/authContext.jsx'

const card = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #BFDBFE',
  borderRadius: '10px',
  padding: '20px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
}

export default function Settings() {
  const { session } = useAuth()
  const usage    = useMemo(() => Math.round(45 + Math.random() * 40), [])
  const activity = useMemo(() => randomSeries(14, 90, 25), [])

  const donutRef    = useCanvas((c) => {
    c.style.height = '220px'
    drawDonut(c, [
      { label: 'Used', value: usage },
      { label: 'Free', value: 100 - usage },
    ])
  })
  const activityRef = useCanvas((c) => { c.style.height = '180px'; drawLineChart(c, activity) })

  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
        Settings
      </h1>
      <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px' }}>
        Manage your account and preferences.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        <div style={card}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>Profile</h3>
          <p style={{ fontSize: '14px', color: '#374151', marginBottom: '16px' }}>
            <strong>Email:</strong> {session?.email || 'unknown'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <button style={{
              padding: '8px 14px', borderRadius: '6px', border: '1px solid #D1D5DB',
              background: 'none', fontSize: '13px', cursor: 'pointer', color: '#374151', fontFamily: 'inherit',
            }}>
              Change password
            </button>
            <button style={{
              padding: '8px 14px', borderRadius: '6px', border: '1px solid #D1D5DB',
              background: 'none', fontSize: '13px', cursor: 'pointer', color: '#374151', fontFamily: 'inherit',
            }}>
              Manage sessions
            </button>
          </div>
        </div>

        <div style={card}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>Plan Usage</h3>
          <canvas ref={donutRef} style={{ width: '100%', height: '220px', display: 'block' }} />
        </div>

        <div style={card}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>Activity (last 14 days)</h3>
          <canvas ref={activityRef} style={{ width: '100%', height: '180px', display: 'block' }} />
        </div>
      </div>
    </div>
  )
}
