import { useState } from 'react'
import { useAuth } from '../state/authContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim() || !password) return
    setError('')
    setLoading(true)
    const result = await login(email.trim(), password)
    if (!result.ok) setError(result.message)
    setLoading(false)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F6F8',
        padding: '24px',
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '40px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 8px 40px rgba(0,0,0,.12)',
          border: '1.5px solid #BFDBFE',
        }}
      >
        {/* Logo / title */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#1565C0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>
            Sign in
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280' }}>
            Access your Boomi integrations dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 14px',
                border: '1.5px solid #BFDBFE',
                borderRadius: '8px',
                fontSize: '15px',
                color: '#111827',
                outline: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                transition: 'border-color 150ms ease',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#3B82F6')}
              onBlur={(e) => (e.target.style.borderColor = '#BFDBFE')}
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 14px',
                border: '1.5px solid #BFDBFE',
                borderRadius: '8px',
                fontSize: '15px',
                color: '#111827',
                outline: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                transition: 'border-color 150ms ease',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#3B82F6')}
              onBlur={(e) => (e.target.style.borderColor = '#BFDBFE')}
            />
          </div>

          {/* Error */}
          {error && (
            <p
              style={{
                fontSize: '13px',
                color: '#DC2626',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '6px',
                padding: '10px 12px',
                margin: 0,
              }}
            >
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: loading ? '#93C5FD' : '#1565C0',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              color: '#FFFFFF',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              transition: 'background-color 150ms ease',
              marginTop: '4px',
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#1976D2' }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#1565C0' }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
