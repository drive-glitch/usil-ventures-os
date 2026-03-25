import { useState, useEffect, useCallback } from 'react'
import { PageHeader, StatusBadge, EmptyState, Btn, Modal, Field, Input, Select } from '../../components/ui'
import {
  fetchUpdates, saveUpdate, deleteUpdate,
  fetchStartups, STATUS_OPTIONS, RISK_OPTIONS, formatCurrency, fetchPendingSubmissions,
} from '../../lib/portafolio'

const RISK_COLOR  = { bajo: '#059669', medio: '#D97706', alto: '#EF4444' }
const SOURCE_LABEL = { manual: 'Manual', formulario: 'Formulario', make: 'Make' }

const sel = { fontSize: 12, padding: '7px 10px', borderRadius: 7, border: '1px solid #D1D5DB', background: '#fff' }

function RiskChip({ level }) {
  const c = RISK_COLOR[level] || '#9CA3AF'
  return <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: c + '22', color: c }}>{level || 'bajo'}</span>
}

function SourceChip({ source }) {
  const color = source === 'formulario' || source === 'make' ? '#1D4ED8' : '#888'
  return <span style={{ fontSize: 10, color, background: color + '18', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>{SOURCE_LABEL[source] || source}</span>
}

const EMPTY_FORM = (startupId = '') => ({
  startup_id: startupId, update_date: new Date().toISOString().split('T')[0],
  source: 'manual', submitted_by: '', current_status: 'activa',
  revenue_current: '', funding_new: '', milestone: '',
  risk_level: 'bajo', support_needed: '', notes: '',
})

function UpdateModal({ startups, onSave, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM())
  const [saving, setSaving] = useState(false)
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const save = async () => {
    if (!form.startup_id) return
    setSaving(true)
    try { await saveUpdate(form); onSave() }
    finally { setSaving(false) }
  }

  return (
    <Modal title="Registrar update" onClose={onClose}>
      <Field label="Startup *">
        <Select value={form.startup_id} onChange={f('startup_id')}>
          <option value="">Seleccionar startup</option>
          {startups.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
        </Select>
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Fecha"><Input type="date" value={form.update_date} onChange={f('update_date')} /></Field>
        <Field label="Registrado por"><Input value={form.submitted_by} onChange={f('submitted_by')} placeholder="Tu nombre" /></Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Status actual">
          <Select value={form.current_status} onChange={f('current_status')}>
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </Field>
        <Field label="Riesgo">
          <Select value={form.risk_level} onChange={f('risk_level')}>
            {RISK_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Revenue actual (S/)"><Input type="number" value={form.revenue_current} onChange={f('revenue_current')} /></Field>
        <Field label="Funding nuevo (S/)"><Input type="number" value={form.funding_new} onChange={f('funding_new')} /></Field>
      </div>
      <Field label="Hito / logro"><Input value={form.milestone} onChange={f('milestone')} placeholder="Ej: Primer contrato" /></Field>
      <Field label="Soporte necesario"><Input value={form.support_needed} onChange={f('support_needed')} /></Field>
      <Field label="Notas">
        <textarea value={form.notes} onChange={f('notes')}
          style={{ width: '100%', padding: '9px 12px', borderRadius: 7, border: '1px solid #D1D5DB', fontSize: 13, fontFamily: 'inherit', resize: 'vertical', minHeight: 72, boxSizing: 'border-box' }} />
      </Field>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
        <Btn variant="secondary" onClick={onClose}>Cancelar</Btn>
        <Btn onClick={save}>{saving ? 'Guardando...' : 'Guardar'}</Btn>
      </div>
    </Modal>
  )
}

export default function Updates() {
  const [updates,   setUpdates]   = useState([])
  const [startups,  setStartups]  = useState([])
  const [pending,   setPending]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)

  const [fStartup, setFStartup]   = useState('')
  const [fRisk,    setFRisk]      = useState('')
  const [fSource,  setFSource]    = useState('')
  const [fFrom,    setFFrom]      = useState('')
  const [fTo,      setFTo]        = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [u, s, p] = await Promise.all([
        fetchUpdates({ limit: 200 }),
        fetchStartups(),
        fetchPendingSubmissions(),
      ])
      setUpdates(u); setStartups(s); setPending(p)
    } catch (e) {
      console.error('Updates load error:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = updates
    .filter(u => !fStartup || String(u.startup_id) === fStartup)
    .filter(u => !fRisk    || u.risk_level === fRisk)
    .filter(u => !fSource  || u.source === fSource)
    .filter(u => !fFrom    || u.update_date >= fFrom)
    .filter(u => !fTo      || u.update_date <= fTo)

  const hasFilters = fStartup || fRisk || fSource || fFrom || fTo

  if (loading) return <div style={{ color: '#888', fontSize: 14, padding: '40px 0' }}>Cargando...</div>

  return (
    <div>
      <PageHeader
        title="Updates"
        subtitle={`${updates.length} registros totales`}
        action={<Btn onClick={() => setShowModal(true)}>+ Registrar update</Btn>}
      />

      {/* Alerta submissions pendientes de Make */}
      {pending.length > 0 && (
        <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 8, padding: '10px 16px', marginBottom: 18, fontSize: 13, color: '#92400E', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>⚠ {pending.length} formulario{pending.length > 1 ? 's' : ''} pendiente{pending.length > 1 ? 's' : ''} de procesar en form_submissions.</span>
          <span style={{ fontSize: 11, color: '#B45309' }}>TODO Fase 7: activar procesado automático vía Make</span>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={fStartup} onChange={e => setFStartup(e.target.value)} style={sel}>
          <option value="">Todas las startups</option>
          {startups.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
        </select>
        <select value={fRisk} onChange={e => setFRisk(e.target.value)} style={sel}>
          <option value="">Todo riesgo</option>
          {RISK_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={fSource} onChange={e => setFSource(e.target.value)} style={sel}>
          <option value="">Toda fuente</option>
          <option value="manual">Manual</option>
          <option value="formulario">Formulario</option>
          <option value="make">Make</option>
        </select>
        <input type="date" value={fFrom} onChange={e => setFFrom(e.target.value)} style={{ ...sel, color: fFrom ? '#1a1a18' : '#aaa' }} title="Desde" />
        <input type="date" value={fTo}   onChange={e => setFTo(e.target.value)}   style={{ ...sel, color: fTo   ? '#1a1a18' : '#aaa' }} title="Hasta" />
        {hasFilters && (
          <button onClick={() => { setFStartup(''); setFRisk(''); setFSource(''); setFFrom(''); setFTo('') }}
            style={{ fontSize: 12, color: '#888', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
            Limpiar
          </button>
        )}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#bbb' }}>{filtered.length} de {updates.length}</span>
      </div>

      {/* Timeline */}
      {filtered.length === 0
        ? <EmptyState message={hasFilters ? 'Sin resultados.' : 'Sin updates registrados aún.'} />
        : (
          <div style={{ background: '#fff', border: '1px solid #E8E7E2', borderRadius: 10, overflow: 'hidden' }}>
            {filtered.map((u, i) => {
              const name = u.startups?.nombre || `ID ${u.startup_id}`
              return (
                <div key={u.id} style={{ padding: '11px 18px', borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : '#FAFAFA', display: 'grid', gridTemplateColumns: '150px 1fr auto', gap: 16, alignItems: 'start' }}>

                  {/* Fecha + startup */}
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>
                      {new Date(u.update_date + 'T00:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{name}</div>
                    <div style={{ marginTop: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      <RiskChip level={u.risk_level} />
                      <SourceChip source={u.source} />
                    </div>
                  </div>

                  {/* Contenido */}
                  <div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                      <StatusBadge status={u.current_status} small />
                      {u.submitted_by && <span style={{ fontSize: 11, color: '#aaa' }}>por {u.submitted_by}</span>}
                    </div>
                    {u.milestone && <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>🏁 {u.milestone}</div>}
                    {(u.revenue_current || u.funding_new) && (
                      <div style={{ fontSize: 12, color: '#555', marginBottom: 4, display: 'flex', gap: 14 }}>
                        {u.revenue_current && <span>Revenue: <strong style={{ color: '#059669' }}>{formatCurrency(u.revenue_current)}</strong></span>}
                        {u.funding_new     && <span>Funding: <strong style={{ color: '#D97706' }}>{formatCurrency(u.funding_new)}</strong></span>}
                      </div>
                    )}
                    {u.support_needed && <div style={{ fontSize: 12, color: '#D97706' }}>Soporte: {u.support_needed}</div>}
                    {u.notes && <div style={{ fontSize: 12, color: '#888', marginTop: 4, lineHeight: 1.5 }}>{u.notes}</div>}
                  </div>

                  {/* Acción */}
                  <button onClick={async () => { if (confirm('¿Eliminar este update?')) { await deleteUpdate(u.id); load() } }}
                    style={{ fontSize: 11, padding: '4px 8px', borderRadius: 5, border: '1px solid #FCA5A5', background: '#FEF2F2', cursor: 'pointer', color: '#991B1B' }}>×</button>
                </div>
              )
            })}
          </div>
        )
      }

      {showModal && (
        <UpdateModal startups={startups} onSave={() => { setShowModal(false); load() }} onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}
