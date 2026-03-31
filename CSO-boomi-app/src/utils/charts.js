export const COLORS = ['#2563eb','#22c55e','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#10b981','#a855f7']

const ChartRegistry = []

function debounce(fn, ms = 120) {
  let t
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms) }
}

function px(n, dpr) { return Math.round(n * dpr) }

function setCanvasSize(c) {
  const dpr = window.devicePixelRatio || 1
  const w = c.clientWidth
  const h = c.clientHeight
  c.width = px(w, dpr)
  c.height = px(h, dpr)
  const ctx = c.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  return { ctx, w, h, dpr }
}

function drawGrid(ctx, x0, y0, x1, y1, steps = 4) {
  ctx.save()
  ctx.strokeStyle = 'rgba(100,116,139,0.18)'
  ctx.lineWidth = 1
  const dy = (y1 - y0) / steps
  for (let i = 0; i <= steps; i++) {
    const y = y1 - i * dy
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke()
  }
  ctx.restore()
}

function niceMinMax(values) {
  let min = Math.min(...values), max = Math.max(...values)
  if (min === max) { min -= 1; max += 1 }
  const pad = (max - min) * 0.1
  return [Math.floor(min - pad), Math.ceil(max + pad)]
}

export function registerChart(canvas, drawFn) {
  ChartRegistry.push({ canvas, drawFn })
  drawFn()
}

if (typeof window !== 'undefined') {
  window.addEventListener('resize', debounce(() => {
    ChartRegistry.forEach(({ drawFn }) => drawFn())
  }))
}

export function drawLineChart(canvas, values) {
  const { ctx, w, h } = setCanvasSize(canvas)
  const m = { left: 36, right: 10, top: 14, bottom: 24 }
  const x0 = m.left, y0 = m.top, x1 = w - m.right, y1 = h - m.bottom
  ctx.clearRect(0, 0, w, h)
  const [min, max] = niceMinMax(values)
  const dx = (x1 - x0) / ((values.length - 1) || 1)
  const scaleY = (v) => y1 - ((v - min) / (max - min)) * (y1 - y0)

  drawGrid(ctx, x0, y0, x1, y1, 4)

  const grad = ctx.createLinearGradient(0, y0, 0, y1)
  grad.addColorStop(0, 'rgba(37,99,235,0.28)')
  grad.addColorStop(1, 'rgba(37,99,235,0.02)')

  ctx.beginPath()
  values.forEach((v, i) => { const x = x0 + i * dx, y = scaleY(v); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y) })
  ctx.lineTo(x1, y1); ctx.lineTo(x0, y1); ctx.closePath()
  ctx.fillStyle = grad; ctx.fill()

  ctx.beginPath()
  values.forEach((v, i) => { const x = x0 + i * dx, y = scaleY(v); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y) })
  ctx.strokeStyle = COLORS[0]; ctx.lineWidth = 2; ctx.stroke()

  ctx.fillStyle = '#fff'; ctx.strokeStyle = COLORS[0]
  values.forEach((v, i) => {
    const x = x0 + i * dx, y = scaleY(v)
    ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
  })
}

function roundRect(ctx, x, y, w, h, r = 8) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

export function drawBarChart(canvas, labels, values) {
  const { ctx, w, h } = setCanvasSize(canvas)
  const m = { left: 36, right: 10, top: 14, bottom: 28 }
  const x0 = m.left, y0 = m.top, x1 = w - m.right, y1 = h - m.bottom
  ctx.clearRect(0, 0, w, h)

  const [min, max] = niceMinMax(values)
  const N = values.length
  const band = (x1 - x0) / (N || 1)
  const barW = Math.max(10, band * 0.58)
  const scaleY = (v) => y1 - ((v - min) / (max - min)) * (y1 - y0)

  drawGrid(ctx, x0, y0, x1, y1, 4)

  values.forEach((v, i) => {
    const cx = x0 + i * band + band / 2
    const y = scaleY(v)
    const x = cx - barW / 2
    const hBar = Math.max(4, y1 - y)
    ctx.fillStyle = COLORS[i % COLORS.length]
    roundRect(ctx, x, y, barW, hBar, 6)
    ctx.fill()
  })

  ctx.fillStyle = 'rgba(100,116,139,0.8)'
  ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto'
  ctx.textAlign = 'center'
  labels.forEach((lab, i) => { const cx = x0 + i * band + band / 2; ctx.fillText(lab, cx, y1 + 18) })
}

export function drawDonut(canvas, segments) {
  const { ctx, w, h } = setCanvasSize(canvas)
  ctx.clearRect(0, 0, w, h)
  const cx = w / 2, cy = h / 2, r = Math.min(w, h) * 0.36, innerR = r * 0.6
  const total = segments.reduce((a, s) => a + s.value, 0) || 1
  let ang = -Math.PI / 2
  segments.forEach((s, i) => {
    const frac = s.value / total, end = ang + frac * Math.PI * 2
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, ang, end); ctx.closePath()
    ctx.fillStyle = s.color || COLORS[i % COLORS.length]; ctx.fill()
    ang = end
  })
  ctx.save(); ctx.globalCompositeOperation = 'destination-out'
  ctx.beginPath(); ctx.arc(cx, cy, innerR, 0, Math.PI * 2); ctx.fill(); ctx.restore()

  const main = segments[0]?.value ?? 0
  ctx.fillStyle = '#111827'
  ctx.font = '600 16px system-ui, -apple-system, Segoe UI, Roboto'
  ctx.textAlign = 'center'
  ctx.fillText(`${Math.round((main / total) * 100)}%`, cx, cy + 6)
}

export function randomSeries(n, base = 100, spread = 25) {
  let x = base + (Math.random() * spread - spread / 2)
  return Array.from({ length: n }, () => {
    x = x + (Math.random() * spread - spread / 2)
    return Math.max(0, Math.round(x))
  })
}

export function sum(a) { return a.reduce((x, y) => x + y, 0) }
export function formatMoney(n) { return `$${n.toLocaleString()}` }

export function lastNDaysLabels(n) {
  const d = new Date()
  return Array.from({ length: n }).map((_, i) => {
    const t = new Date(d); t.setDate(d.getDate() - (n - 1 - i))
    return t.toLocaleDateString(undefined, { weekday: 'short' })
  })
}

export function monthLabels(n = 12) {
  const d = new Date()
  return Array.from({ length: n }).map((_, i) => {
    const t = new Date(d); t.setMonth(d.getMonth() - (n - 1 - i))
    return t.toLocaleString(undefined, { month: 'short' })
  })
}
