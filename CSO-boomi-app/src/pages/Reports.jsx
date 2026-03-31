import { useMemo } from 'react'
import { drawBarChart, drawDonut, drawLineChart, monthLabels, randomSeries } from '../utils/charts.js'
import { useCanvas } from '../hooks/useCanvas.js'

const card = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #BFDBFE',
  borderRadius: '10px',
  padding: '20px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
}

const sources = [
  { label: 'Organic', value: 42 },
  { label: 'Paid',    value: 28 },
  { label: 'Referral',value: 18 },
  { label: 'Email',   value: 12 },
]

export default function Reports() {
  const rev12    = useMemo(() => randomSeries(12, 120000, 25000), [])
  const orders12 = useMemo(() => randomSeries(12, 2200, 700), [])
  const months   = useMemo(() => monthLabels(12), [])

  const revRef    = useCanvas((c) => { c.style.height = '220px'; drawLineChart(c, rev12) })
  const ordRef    = useCanvas((c) => { c.style.height = '220px'; drawBarChart(c, months, orders12) })
  const donutRef  = useCanvas((c) => { c.style.height = '220px'; drawDonut(c, sources) })

  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
        Reports
      </h1>
      <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px' }}>
        Analytics and trend data for your integrations.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        <div style={card}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>Revenue (last 12 months)</h3>
          <canvas ref={revRef} style={{ width: '100%', height: '220px', display: 'block' }} />
        </div>

        <div style={card}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>Orders (last 12 months)</h3>
          <canvas ref={ordRef} style={{ width: '100%', height: '220px', display: 'block' }} />
        </div>

        <div style={card}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>Traffic Sources</h3>
          <canvas ref={donutRef} style={{ width: '100%', height: '220px', display: 'block' }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
            {sources.map((s, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6B7280' }}>
                <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '3px', backgroundColor: ['#2563eb','#22c55e','#f59e0b','#ef4444'][i] }} />
                {s.label} • {s.value}%
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
