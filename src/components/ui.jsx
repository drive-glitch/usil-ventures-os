export const ESTADOS = {
  en_ejecucion: { label: 'En ejecución', bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' },
  por_iniciar:  { label: 'Por iniciar',  bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD' },
  en_riesgo:    { label: 'En riesgo',    bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
  retrasado:    { label: 'Retrasado',    bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' },
  cerrado:      { label: 'Cerrado',      bg: '#F3F4F6', text: '#374151', border: '#D1D5DB' },
}

export const PRIORIDADES = {
  alta:  { label: 'Alta',  color: '#EF4444' },
  media: { label: 'Media', color: '#F59E0B' },
  baja:  { label: 'Baja',  color: '#9CA3AF' },
}

export const TRIMESTRES = ['Q1','Q2','Q3','Q4']

export const TIPO_ACTIVIDAD = {
  Evento:   '#3B82F6',
  Comité:   '#8B5CF6',
  Taller:   '#F59E0B',
  Mentoría: '#10B981',
}

export function Badge({ estado, small }) {
  const s = ESTADOS[estado] || ESTADOS.cerrado
  return (
    <span style={{
      background: s.bg, color: s.text, border: `1px solid ${s.border}`,
      borderRadius: 6, padding: small ? '2px 7px' : '3px 10px',
      fontSize: small ? 11 : 12, fontWeight: 600, whiteSpace: 'nowrap', display: 'inline-block'
    }}>{s.label}</span>
  )
}

export function PrioDot({ prioridad }) {
  const c = PRIORIDADES[prioridad]?.color || '#9CA3AF'
  return <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: c, marginRight: 6, flexShrink: 0 }} />
}

export function Card({ children, style }) {
  return <div style={{ background: '#fff', border: '1px solid #E8E7E2', borderRadius: 10, padding: '18px 20px', ...style }}>{children}</div>
}

export function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 14, padding: '28px 30px', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#999', lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 15 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  )
}

const inp = { width: '100%', padding: '9px 12px', borderRadius: 7, border: '1px solid #D1D5DB', fontSize: 13, background: '#fff', color: '#1a1a18', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }

export function Input(props) { return <input {...props} style={{ ...inp, ...props.style }} /> }
export function Select({ children, ...props }) { return <select {...props} style={{ ...inp, ...props.style }}>{children}</select> }

export function Btn({ children, onClick, variant = 'primary', style }) {
  const v = { primary: { background: '#1D4ED8', color: '#fff', border: 'none' }, secondary: { background: '#F3F4F6', color: '#374151', border: '1px solid #D1D5DB' }, danger: { background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5' } }
  return <button onClick={onClick} style={{ padding: '9px 18px', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', ...v[variant], ...style }}>{children}</button>
}

export function KpiBar({ actual, meta, estado }) {
  const pct = Math.min(100, meta > 0 ? Math.round((actual / meta) * 100) : 0)
  const color = estado === 'retrasado' ? '#EF4444' : estado === 'en_riesgo' ? '#F59E0B' : estado === 'en_ejecucion' ? '#10B981' : '#3B82F6'
  const label = meta >= 100000 ? `S/ ${Number(actual).toLocaleString()} / S/ ${Number(meta).toLocaleString()}` : `${actual} / ${meta}`
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#999', marginBottom: 4 }}>
        <span>{pct}%</span><span>{label}</span>
      </div>
      <div style={{ height: 6, background: '#F0EFE9', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.5s' }} />
      </div>
    </div>
  )
}

export function CountdownChip({ fecha }) {
  const today = new Date(); today.setHours(0,0,0,0)
  const d = Math.ceil((new Date(fecha + 'T00:00:00') - today) / 86400000)
  const color = d < 0 ? '#DC2626' : d <= 7 ? '#DC2626' : d <= 21 ? '#D97706' : '#059669'
  const label = d < 0 ? `${Math.abs(d)}d pasado` : d === 0 ? 'Hoy' : `${d}d`
  return <span style={{ fontSize: 12, fontWeight: 700, color, background: color + '18', borderRadius: 5, padding: '2px 8px', whiteSpace: 'nowrap' }}>{label}</span>
}

export function formatDate(d) {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${parseInt(day)} ${['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'][parseInt(m)-1]} ${y}`
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13, color: '#888', marginTop: 4, marginBottom: 0 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
