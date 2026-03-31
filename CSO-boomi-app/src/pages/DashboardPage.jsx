import { useMemo } from 'react'
import { drawBarChart, drawLineChart, formatMoney, lastNDaysLabels, randomSeries, sum } from '../utils/charts.js'
import { useCanvas } from '../hooks/useCanvas.js'
import BoomiMount from '../components/BoomiMount.jsx'

const card = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #BFDBFE',
  borderRadius: '10px',
  padding: '20px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
}

export default function DashboardPage() {
  const signups7d = useMemo(() => randomSeries(7, 140, 40), [])
  const revenue7d = useMemo(() => randomSeries(7, 3600, 1200), [])
  const labels    = useMemo(() => lastNDaysLabels(7), [])
  const kpiRevenue = useMemo(() => sum(revenue7d), [revenue7d])
  const kpiOrders  = useMemo(() => Math.round(sum(revenue7d) / 120), [revenue7d])
  const kpiConv    = useMemo(() => (2.7 + Math.random() * 0.8).toFixed(1), [])
  const kpiUptime  = useMemo(() => (99.8 + Math.random() * 0.2).toFixed(2), [])

  const signupsRef = useCanvas((c) => { c.style.height = '180px'; drawLineChart(c, signups7d) })
  const revenueRef = useCanvas((c) => { c.style.height = '180px'; drawBarChart(c, labels, revenue7d) })

  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
        Dashboard
      </h1>
      <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px' }}>
        Overview of key metrics and integration activity.
      </p>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#6B7280' }}>Revenue (7d)</span>
            <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '999px', background: '#dcfce7', color: '#14532d', border: '1px solid #bbf7d0' }}>
              +{(Math.random() * 8 + 2).toFixed(1)}%
            </span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '700', color: '#111827' }}>{formatMoney(kpiRevenue)}</div>
        </div>

        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#6B7280' }}>Orders</span>
            <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '999px', background: '#e2e8f0', color: '#334155', border: '1px solid #cbd5e1' }}>~$120 avg</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '700', color: '#111827' }}>{kpiOrders.toLocaleString()}</div>
        </div>

        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#6B7280' }}>Conversion</span>
            <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '999px', background: '#dcfce7', color: '#14532d', border: '1px solid #bbf7d0' }}>▲</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '700', color: '#111827' }}>{kpiConv}%</div>
        </div>

        <div style={card}>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#6B7280' }}>Uptime</span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '700', color: '#111827' }}>{kpiUptime}%</div>
        </div>
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={card}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>Signups (last 7 days)</h3>
          <canvas ref={signupsRef} style={{ width: '100%', height: '180px', display: 'block' }} />
        </div>
        <div style={card}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>Revenue by Day</h3>
          <canvas ref={revenueRef} style={{ width: '100%', height: '180px', display: 'block' }} />
        </div>
      </div>

      {/* Integration History via EmbedKit */}
      <div style={{ ...card, minHeight: '300px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>Integration History</h3>
        <BoomiMount component="Integrations" props={{ componentKey: 'integrationsDashboard' }} />
      </div>
    </div>
  )
}
