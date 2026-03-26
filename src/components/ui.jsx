import { useState } from 'react'

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

export const ETAPAS_HITO = [
  'Convocatoria','Inicio','Kick-off','Evento','Taller',
  'Lanzamiento','Evaluación','Cierre','Demo Day','Otro',
]

// ─── Date helper (timezone-safe) ──────────────────────────────────────────────
export function localDate() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

// ─── Toast ────────────────────────────────────────────────────────────────────
export function useToast() {
  const [toast, setToast] = useState(null)
  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }
  return { toast, showToast }
}

export function Toast({ message }) {
  if (!message) return null
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24,
      background: '#1a1a18', color: '#fff',
      padding: '12px 20px', borderRadius: 8,
      fontSize: 13, fontWeight: 600, zIndex: 9999,
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      display: 'flex', alignItems: 'center', gap: 8,
      pointerEvents: 'none',
    }}>
      <span style={{ color: '#4ade80', fontSize: 14 }}>✓</span>
      {message}
    </div>
  )
}

// ─── Help Button ──────────────────────────────────────────────────────────────
export function HelpButton({ title, children }) {
  const [open, setOpen] = useState(false)
  return <>
    <button onClick={() => setOpen(true)}
      style={{ width:24, height:24, borderRadius:'50%', border:'1px solid #D1D5DB', background:'#F9FAFB', cursor:'pointer', fontSize:12, fontWeight:700, color:'#6B7280', display:'inline-flex', alignItems:'center', justifyContent:'center', lineHeight:1, flexShrink:0 }}>
      ?
    </button>
    {open && (
      <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:1002, display:'flex', alignItems:'center', justifyContent:'center' }}
        onClick={e => { if (e.target===e.currentTarget) setOpen(false) }}>
        <div style={{ background:'#fff', borderRadius:12, padding:'24px 28px', maxWidth:440, width:'90%', boxShadow:'0 10px 40px rgba(0,0,0,0.2)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <span style={{ fontSize:14, fontWeight:700 }}>💡 {title || 'Ayuda'}</span>
            <button onClick={() => setOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:18, color:'#999', lineHeight:1 }}>×</button>
          </div>
          <div style={{ fontSize:13, color:'#555', lineHeight:1.7 }}>{children}</div>
        </div>
      </div>
    )}
  </>
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
export function ConfirmDialog({ message, onConfirm, onCancel }) {
  if (!message) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: '24px 28px', maxWidth: 380, width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
        <p style={{ fontSize: 14, margin: '0 0 20px', lineHeight: 1.6, color: '#1a1a18' }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Btn variant="secondary" onClick={onCancel}>Cancelar</Btn>
          <Btn variant="danger" onClick={onConfirm}>Eliminar</Btn>
        </div>
      </div>
    </div>
  )
}

// ─── Base components ──────────────────────────────────────────────────────────
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

export function Field({ label, children, error }) {
  return (
    <div style={{ marginBottom: 15 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: error ? '#EF4444' : '#555', display: 'block', marginBottom: 5 }}>{label}</label>
      {children}
      {error && <div style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}>{error}</div>}
    </div>
  )
}

const inp = { width: '100%', padding: '9px 12px', borderRadius: 7, border: '1px solid #D1D5DB', fontSize: 13, background: '#fff', color: '#1a1a18', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }

export function Input(props) { return <input {...props} style={{ ...inp, ...props.style }} /> }
export function Select({ children, ...props }) { return <select {...props} style={{ ...inp, ...props.style }}>{children}</select> }

export function Btn({ children, onClick, variant = 'primary', style }) {
  const v = {
    primary:   { background: '#1D4ED8', color: '#fff', border: 'none' },
    secondary: { background: '#F3F4F6', color: '#374151', border: '1px solid #D1D5DB' },
    danger:    { background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5' },
  }
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

// ─── Portfolio-specific components ───────────────────────────────────────────

export const PORTFOLIO_STATUS = {
  activa:         { label: 'Activa',         bg: '#D1FAE5', text: '#065F46' },
  en_seguimiento: { label: 'En seguimiento', bg: '#DBEAFE', text: '#1E40AF' },
  pausada:        { label: 'Pausada',        bg: '#FEF3C7', text: '#92400E' },
  cerrada:        { label: 'Cerrada',        bg: '#F3F4F6', text: '#374151' },
  adquirida:      { label: 'Adquirida',      bg: '#EDE9FE', text: '#5B21B6' },
  sin_dato:       { label: 'Sin dato',       bg: '#F3F4F6', text: '#9CA3AF' },
}

export function StatusBadge({ status, small }) {
  const s = PORTFOLIO_STATUS[status] || PORTFOLIO_STATUS.sin_dato
  return (
    <span style={{
      background: s.bg, color: s.text, borderRadius: 5,
      padding: small ? '2px 7px' : '3px 9px',
      fontSize: small ? 10 : 11, fontWeight: 600, whiteSpace: 'nowrap', display: 'inline-block'
    }}>{s.label}</span>
  )
}

export function RecencyDot({ color, label }) {
  return (
    <span title={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }} />
      <span style={{ fontSize: 11, color: '#888' }}>{label}</span>
    </span>
  )
}

export function EmptyState({ message = 'Sin resultados', action }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 0', color: '#bbb' }}>
      <div style={{ fontSize: 13, marginBottom: action ? 14 : 0 }}>{message}</div>
      {action}
    </div>
  )
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
