import { Search } from 'lucide-react'

export default function SearchBar({ value, onChange }) {
  return (
    <div style={{ position: 'relative', width: '280px' }}>
      <Search
        size={15}
        style={{
          position: 'absolute',
          left: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#9CA3AF',
          pointerEvents: 'none',
        }}
      />
      <input
        type="text"
        placeholder="Search integrations..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          paddingLeft: '32px',
          paddingRight: '12px',
          paddingTop: '8px',
          paddingBottom: '8px',
          border: '1px solid #D1D5DB',
          borderRadius: '6px',
          fontSize: '13px',
          color: '#111827',
          backgroundColor: '#FFFFFF',
          outline: 'none',
          fontFamily: 'inherit',
        }}
        onFocus={(e) => (e.target.style.borderColor = '#93C5FD')}
        onBlur={(e) => (e.target.style.borderColor = '#D1D5DB')}
      />
    </div>
  )
}
