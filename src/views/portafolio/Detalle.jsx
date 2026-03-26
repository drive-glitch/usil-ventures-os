import { useState, useEffect, useCallback } from 'react'
import {
  Card, Modal, Field, Input, Select, Btn,
  StatusBadge, RecencyDot, PrioDot, EmptyState, CountdownChip, formatDate,
  Toast, useToast, ConfirmDialog, localDate,
} from '../../components/ui'
import {
  fetchPrograms, saveProgram, deleteProgram,
  fetchUpdates, saveUpdate, deleteUpdate,
  fetchContacts,
  fetchTasks, saveTask, deleteTask,
  fetchStartupById,
  saveStartup, deleteStartup,
  STATUS_OPTIONS, RISK_OPTIONS, TASK_STATUS_OPTIONS, SECTOR_OPTIONS,
  PRIORITY_OPTIONS, TIER_OPTIONS, formatCurrency, getRecency,
} from '../../lib/portafolio'

// ─── Shared styles ────────────────────────────────────────────────────────────
const S = {
  sectionTitle: { fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 },
  row:          { display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 10, fontSize: 13 },
  label:        { color: '#888', minWidth: 130, flexShrink: 0 },
  value:        { fontWeight: 500, color: '#1a1a18' },
  // botones inline — igual que Hitos/Programas
  btnEdit:      { fontSize: 11, padding: '4px 8px', borderRadius: 5, border: '1px solid #D1D5DB', background: '#F9FAFB', cursor: 'pointer' },
  btnDanger:    { fontSize: 11, padding: '4px 8px', borderRadius: 5, border: '1px solid #FCA5A5', background: '#FEF2F2', cursor: 'pointer', color: '#991B1B' },
  chip:         (bg, color) => ({ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: bg, color, display: 'inline-block' }),
}

// ─── Risk dot ─────────────────────────────────────────────────────────────────
const RISK_COLOR = { bajo: '#059669', medio: '#D97706', alto: '#EF4444' }
function RiskDot({ level }) {
  const c = RISK_COLOR[level] || '#9CA3AF'
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#888' }}>
    <span style={{ width: 7, height: 7, borderRadius: '50%', background: c, display: 'inline-block', flexShrink: 0 }} />
    {level || 'bajo'}
  </span>
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, action, children }) {
  return (
    <Card style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={S.sectionTitle}>{title}</div>
        {action}
      </div>
      {children}
    </Card>
  )
}

// ─── Startup edit form ────────────────────────────────────────────────────────
const EMPTY_STARTUP_FORM = s => ({
  nombre: s.nombre || '', fundadores: s.fundadores || '',
  sector: s.sector || '', pais: s.pais || '', city: s.city || '',
  current_status: s.current_status || s.estado || 'activa',
  priority: s.priority || 'media', portfolio_tier: s.portfolio_tier || 'seguimiento',
  owner_uv: s.owner_uv || '', has_softlanding: !!(s.has_softlanding || s.softlanding),
  has_revenue: !!s.has_revenue, has_funding: !!s.has_funding,
  revenue_latest: s.revenue_latest || '', funding_total: s.funding_total || '',
  revenue_currency: s.revenue_currency || 'PEN', funding_currency: s.funding_currency || 'PEN',
  link_web: s.link_web || '', notas: s.notas || '',
})

function StartupEditModal({ startup, onSave, onClose }) {
  const [form, setForm] = useState(EMPTY_STARTUP_FORM(startup))
  const [saving, setSaving] = useState(false)
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))
  const fb = k => e => setForm(p => ({ ...p, [k]: e.target.value === 'si' }))

  const save = async () => {
    if (!form.nombre.trim()) return
    setSaving(true)
    try { await saveStartup(form, startup.id); onSave() }
    finally { setSaving(false) }
  }

  return (
    <Modal title="Editar startup" onClose={onClose}>
      <Field label="Nombre *"><Input value={form.nombre} onChange={f('nombre')} /></Field>
      <Field label="Fundadores"><Input value={form.fundadores} onChange={f('fundadores')} /></Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Sector">
          <Select value={form.sector} onChange={f('sector')}>
            <option value="">Seleccionar</option>
            {SECTOR_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </Select>
        </Field>
        <Field label="Status">
          <Select value={form.current_status} onChange={f('current_status')}>
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="País"><Input value={form.pais} onChange={f('pais')} /></Field>
        <Field label="Ciudad"><Input value={form.city} onChange={f('city')} /></Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Prioridad">
          <Select value={form.priority} onChange={f('priority')}>
            {PRIORITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </Field>
        <Field label="Tier">
          <Select value={form.portfolio_tier} onChange={f('portfolio_tier')}>
            {TIER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </Field>
      </div>
      <Field label="Owner UV"><Input value={form.owner_uv} onChange={f('owner_uv')} placeholder="Ej: Leslie Ponce" /></Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Revenue (S/ o $)"><Input type="number" value={form.revenue_latest} onChange={f('revenue_latest')} /></Field>
        <Field label="Moneda revenue">
          <Select value={form.revenue_currency} onChange={f('revenue_currency')}>
            <option value="PEN">PEN (S/)</option><option value="USD">USD ($)</option>
          </Select>
        </Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Funding total"><Input type="number" value={form.funding_total} onChange={f('funding_total')} /></Field>
        <Field label="Moneda funding">
          <Select value={form.funding_currency} onChange={f('funding_currency')}>
            <option value="PEN">PEN (S/)</option><option value="USD">USD ($)</option>
          </Select>
        </Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <Field label="Revenue">
          <Select value={form.has_revenue ? 'si' : 'no'} onChange={fb('has_revenue')}>
            <option value="no">No</option><option value="si">Sí</option>
          </Select>
        </Field>
        <Field label="Funding">
          <Select value={form.has_funding ? 'si' : 'no'} onChange={fb('has_funding')}>
            <option value="no">No</option><option value="si">Sí</option>
          </Select>
        </Field>
        <Field label="Softlanding">
          <Select value={form.has_softlanding ? 'si' : 'no'} onChange={fb('has_softlanding')}>
            <option value="no">No</option><option value="si">Sí</option>
          </Select>
        </Field>
      </div>
      <Field label="Link web / pitch"><Input value={form.link_web} onChange={f('link_web')} placeholder="https://..." /></Field>
      <Field label="Notas internas">
        <textarea value={form.notas} onChange={f('notas')}
          style={{ width: '100%', padding: '9px 12px', borderRadius: 7, border: '1px solid #D1D5DB', fontSize: 13, fontFamily: 'inherit', resize: 'vertical', minHeight: 72, boxSizing: 'border-box' }} />
      </Field>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
        <Btn variant="secondary" onClick={onClose}>Cancelar</Btn>
        <Btn onClick={save}>{saving ? 'Guardando...' : 'Guardar'}</Btn>
      </div>
    </Modal>
  )
}

// ─── Update form ──────────────────────────────────────────────────────────────
const EMPTY_UPDATE = startupId => ({
  startup_id: startupId, update_date: localDate(),
  source: 'manual', submitted_by: '', current_status: 'activa',
  revenue_current: '', funding_new: '', milestone: '',
  risk_level: 'bajo', support_needed: '', notes: '',
})

function UpdateModal({ startupId, onSave, onClose }) {
  const [form, setForm] = useState(EMPTY_UPDATE(startupId))
  const [saving, setSaving] = useState(false)
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const save = async () => {
    setSaving(true)
    try { await saveUpdate(form); onSave() }
    finally { setSaving(false) }
  }

  return (
    <Modal title="Registrar update" onClose={onClose}>
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
        <Field label="Nivel de riesgo">
          <Select value={form.risk_level} onChange={f('risk_level')}>
            {RISK_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Revenue actual (S/)"><Input type="number" value={form.revenue_current} onChange={f('revenue_current')} placeholder="0" /></Field>
        <Field label="Funding nuevo (S/)"><Input type="number" value={form.funding_new} onChange={f('funding_new')} placeholder="0" /></Field>
      </div>
      <Field label="Hito / logro"><Input value={form.milestone} onChange={f('milestone')} placeholder="Ej: Primer contrato firmado" /></Field>
      <Field label="Soporte necesario"><Input value={form.support_needed} onChange={f('support_needed')} placeholder="Ej: Intro a inversores" /></Field>
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

// ─── Task form ────────────────────────────────────────────────────────────────
const EMPTY_TASK = startupId => ({ startup_id: startupId, title: '', owner_uv: '', due_date: '', status: 'pendiente', notes: '' })

function TaskModal({ startupId, task, onSave, onClose }) {
  const [form, setForm] = useState(task ? { ...task, due_date: task.due_date || '' } : EMPTY_TASK(startupId))
  const [saving, setSaving] = useState(false)
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const save = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    try { await saveTask(form, task?.id); onSave() }
    finally { setSaving(false) }
  }

  return (
    <Modal title={task ? 'Editar tarea' : 'Nueva tarea'} onClose={onClose}>
      <Field label="Tarea *"><Input value={form.title} onChange={f('title')} placeholder="Descripción de la tarea" /></Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Owner UV"><Input value={form.owner_uv} onChange={f('owner_uv')} placeholder="Ej: Leslie Ponce" /></Field>
        <Field label="Fecha límite"><Input type="date" value={form.due_date} onChange={f('due_date')} /></Field>
      </div>
      <Field label="Estado">
        <Select value={form.status} onChange={f('status')}>
          {TASK_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Select>
      </Field>
      <Field label="Notas"><Input value={form.notes} onChange={f('notes')} /></Field>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
        <Btn variant="secondary" onClick={onClose}>Cancelar</Btn>
        <Btn onClick={save}>{saving ? 'Guardando...' : 'Guardar'}</Btn>
      </div>
    </Modal>
  )
}

// ─── Program form ─────────────────────────────────────────────────────────────
const EMPTY_PROGRAM = startupId => ({ startup_id: startupId, program_name: '', program_year: new Date().getFullYear(), cohort: '', entry_stage: '', exit_stage: '', result: '' })

function ProgramModal({ startupId, program, onSave, onClose }) {
  const [form, setForm] = useState(program || EMPTY_PROGRAM(startupId))
  const [saving, setSaving] = useState(false)
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const save = async () => {
    if (!form.program_name.trim()) return
    setSaving(true)
    try { await saveProgram(form, program?.id); onSave() }
    finally { setSaving(false) }
  }

  return (
    <Modal title={program ? 'Editar programa' : 'Agregar programa'} onClose={onClose}>
      <Field label="Nombre del programa *"><Input value={form.program_name} onChange={f('program_name')} placeholder="Ej: USIL Challenge: Climatech" /></Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Año"><Input type="number" value={form.program_year} onChange={f('program_year')} /></Field>
        <Field label="Cohorte"><Input value={form.cohort} onChange={f('cohort')} placeholder="Ej: C1-2024" /></Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Etapa de ingreso"><Input value={form.entry_stage} onChange={f('entry_stage')} placeholder="idea / mvp / tracción" /></Field>
        <Field label="Etapa de salida"><Input value={form.exit_stage} onChange={f('exit_stage')} placeholder="mvp / tracción / escala" /></Field>
      </div>
      <Field label="Resultado"><Input value={form.result} onChange={f('result')} placeholder="Ej: finalista / graduada" /></Field>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
        <Btn variant="secondary" onClick={onClose}>Cancelar</Btn>
        <Btn onClick={save}>{saving ? 'Guardando...' : 'Guardar'}</Btn>
      </div>
    </Modal>
  )
}

// ─── Main Detalle component ───────────────────────────────────────────────────
export default function Detalle({ startup: initialStartup, onBack, onDeleted }) {
  const [startup, setStartup]     = useState(initialStartup)
  const [programs, setPrograms]   = useState([])
  const [updates,  setUpdates]    = useState([])
  const [contacts, setContacts]   = useState([])
  const [tasks,    setTasks]      = useState([])
  const [loading,  setLoading]    = useState(true)

  const [modal, setModal] = useState(null)
  const [editingTask, setEditingTask]       = useState(null)
  const [editingProgram, setEditingProgram] = useState(null)
  const [confirm, setConfirm]     = useState(null)
  const { toast, showToast }      = useToast()

  const loadRelated = useCallback(async (id) => {
    const [p, u, c, t] = await Promise.all([
      fetchPrograms(id),
      fetchUpdates({ startupId: id }),
      fetchContacts(id),
      fetchTasks(id),
    ])
    setPrograms(p); setUpdates(u); setContacts(c); setTasks(t)
  }, [])

  useEffect(() => {
    setLoading(true)
    loadRelated(startup.id).finally(() => setLoading(false))
  }, [startup.id, loadRelated])

  const afterEdit = async () => {
    const fresh = await fetchStartupById(startup.id)
    setStartup(fresh)
    setModal(null)
    showToast('Startup actualizada correctamente')
  }

  const afterRelated = () => { loadRelated(startup.id); setModal(null); setEditingTask(null); setEditingProgram(null) }
  const afterUpdate  = () => { loadRelated(startup.id); setModal(null); showToast('Update registrado correctamente') }

  const confirmDelete = () => {
    setConfirm({
      message: `¿Eliminar "${startup.nombre}" y todos sus datos? Esta acción no se puede deshacer.`,
      onConfirm: async () => { await deleteStartup(startup.id); onDeleted() },
    })
  }

  const recency  = startup._recency || getRecency(startup.last_update_at)
  const primary  = contacts.find(c => c.is_primary) || contacts[0]
  const pendingTasks = tasks.filter(t => t.status !== 'completada')

  if (loading) return <div style={{ color: '#888', fontSize: 14, padding: '40px 0' }}>Cargando...</div>

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{startup.nombre}</h1>
            <StatusBadge status={startup.current_status || startup.estado} />
            {startup.portfolio_tier && (
              <span style={S.chip('#F0EFE9','#555')}>{startup.portfolio_tier}</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#888', flexWrap: 'wrap', alignItems: 'center' }}>
            {startup.sector  && <span>{startup.sector}</span>}
            {startup.pais    && <span>{startup.pais}{startup.city ? `, ${startup.city}` : ''}</span>}
            {startup.owner_uv && <span>Owner: <strong style={{ color: '#555' }}>{startup.owner_uv}</strong></span>}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <PrioDot prioridad={startup.priority || 'media'} />
              <span style={{ textTransform: 'capitalize' }}>{startup.priority || 'media'}</span>
            </span>
            <RecencyDot color={recency.color} label={recency.label === 'Sin update' ? 'Sin update' : `Últ. update: ${recency.label}`} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <Btn variant="secondary" onClick={() => setModal('addUpdate')}>+ Update</Btn>
          <Btn variant="secondary" onClick={() => setModal('editStartup')}>Editar</Btn>
          <Btn variant="danger" onClick={confirmDelete}>Eliminar</Btn>
        </div>
      </div>

      {/* ── 2-column layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, alignItems: 'start' }}>

        {/* LEFT COLUMN */}
        <div>

          {/* 1. Resumen general */}
          <Section title="Resumen general" action={
            startup.link_web && <a href={startup.link_web} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#1D4ED8' }}>Ver web →</a>
          }>
            {[
              ['Fundadores',  startup.fundadores],
              ['Contacto',    primary ? `${primary.name} · ${primary.role || ''}` : null],
              ['Email',       primary?.email],
              ['Año ingreso', startup.anio_ingreso],
              ['Programa',    startup.programa],
            ].filter(([,v]) => v).map(([l, v]) => (
              <div key={l} style={S.row}>
                <span style={S.label}>{l}</span>
                <span style={S.value}>{v}</span>
              </div>
            ))}
            {startup.notas && (
              <div style={{ marginTop: 10, padding: '10px 12px', background: '#F9FAFB', borderRadius: 7, fontSize: 12, color: '#555', lineHeight: 1.6 }}>
                {startup.notas}
              </div>
            )}
          </Section>

          {/* 2. Trayectoria UV */}
          <Section title="Trayectoria UV" action={
            <button style={S.btnEdit} onClick={() => { setEditingProgram(null); setModal('addProgram') }}>+ Programa</button>
          }>
            {programs.length === 0
              ? <EmptyState message="Sin programas registrados." />
              : programs.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid #F3F4F6' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{p.program_name}</div>
                    <div style={{ fontSize: 11, color: '#888', marginTop: 2, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {p.program_year && <span>{p.program_year}</span>}
                      {p.cohort       && <span>Cohorte: {p.cohort}</span>}
                      {p.entry_stage  && <span>{p.entry_stage} → {p.exit_stage || '?'}</span>}
                      {p.result       && <span style={S.chip('#D1FAE5','#065F46')}>{p.result}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button style={S.btnEdit}   onClick={() => { setEditingProgram(p); setModal('addProgram') }}>Editar</button>
                    <button style={S.btnDanger} onClick={() => setConfirm({ message: `¿Eliminar programa "${p.program_name}"?`, onConfirm: async () => { await deleteProgram(p.id); loadRelated(startup.id); showToast('Programa eliminado') } })}>×</button>
                  </div>
                </div>
              ))
            }
          </Section>

          {/* 3. Historial de updates */}
          <Section title={`Historial de updates (${updates.length})`} action={
            <button style={S.btnEdit} onClick={() => setModal('addUpdate')}>+ Registrar</button>
          }>
            {updates.length === 0
              ? <EmptyState message="Sin updates registrados." />
              : updates.map((u, i) => (
                <div key={u.id} style={{ padding: '12px 0', borderBottom: i < updates.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>{formatDate(u.update_date)}</span>
                      <StatusBadge status={u.current_status} small />
                      <RiskDot level={u.risk_level} />
                      {u.submitted_by && <span style={{ fontSize: 11, color: '#aaa' }}>{u.submitted_by}</span>}
                    </div>
                    <button style={S.btnDanger}
                      onClick={() => setConfirm({ message: '¿Eliminar este update?', onConfirm: async () => { await deleteUpdate(u.id); loadRelated(startup.id); showToast('Update eliminado') } })}>×</button>
                  </div>
                  {u.milestone && <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>🏁 {u.milestone}</div>}
                  {(u.revenue_current || u.funding_new) && (
                    <div style={{ fontSize: 12, color: '#555', marginBottom: 4, display: 'flex', gap: 12 }}>
                      {u.revenue_current && <span>Revenue: <strong>{formatCurrency(u.revenue_current)}</strong></span>}
                      {u.funding_new     && <span>Funding nuevo: <strong>{formatCurrency(u.funding_new)}</strong></span>}
                    </div>
                  )}
                  {u.support_needed && <div style={{ fontSize: 12, color: '#D97706' }}>Soporte: {u.support_needed}</div>}
                  {u.notes && <div style={{ fontSize: 12, color: '#888', marginTop: 4, lineHeight: 1.5 }}>{u.notes}</div>}
                </div>
              ))
            }
          </Section>
        </div>

        {/* RIGHT COLUMN */}
        <div>

          {/* 4. Tracción */}
          <Section title="Tracción">
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
              {startup.has_revenue     && <span style={S.chip('#D1FAE5','#065F46')}>Revenue</span>}
              {startup.has_funding     && <span style={S.chip('#FEF3C7','#92400E')}>Funding</span>}
              {(startup.has_softlanding || startup.softlanding) && <span style={S.chip('#EDE9FE','#5B21B6')}>Softlanding</span>}
            </div>
            {[
              ['Revenue',        startup.revenue_latest  ? formatCurrency(startup.revenue_latest, startup.revenue_currency)  : null],
              ['Funding total',  startup.funding_total   ? formatCurrency(startup.funding_total,  startup.funding_currency)  : null],
              ['Fondos (legado)', startup.fondos_obtenidos > 0 ? formatCurrency(startup.fondos_obtenidos) : null],
              ['Fuente',         startup.fuente_fondo],
            ].filter(([,v]) => v).map(([l, v]) => (
              <div key={l} style={{ ...S.row, marginBottom: 8 }}>
                <span style={{ ...S.label, minWidth: 110 }}>{l}</span>
                <span style={{ ...S.value, color: '#D97706' }}>{v}</span>
              </div>
            ))}
            {!startup.has_revenue && !startup.has_funding && !startup.fondos_obtenidos &&
              <div style={{ fontSize: 12, color: '#bbb', textAlign: 'center', padding: '10px 0' }}>Sin datos de tracción aún.</div>
            }
          </Section>

          {/* 5. Tareas / próximos pasos */}
          <Section title={`Tareas (${pendingTasks.length} pendientes)`} action={
            <button style={S.btnEdit} onClick={() => { setEditingTask(null); setModal('addTask') }}>+ Tarea</button>
          }>
            {tasks.length === 0
              ? <EmptyState message="Sin tareas registradas." />
              : tasks.map(t => (
                <div key={t.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid #F3F4F6' }}>
                  <button onClick={async () => {
                    const next = t.status === 'completada' ? 'pendiente' : 'completada'
                    await saveTask({ ...t, status: next }, t.id); loadRelated(startup.id)
                  }} style={{ marginTop: 2, flexShrink: 0, width: 15, height: 15, borderRadius: 3, border: `1.5px solid ${t.status === 'completada' ? '#059669' : '#D1D5DB'}`, background: t.status === 'completada' ? '#059669' : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {t.status === 'completada' && <span style={{ color: '#fff', fontSize: 9, lineHeight: 1 }}>✓</span>}
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: t.status === 'completada' ? '#aaa' : '#1a1a18', textDecoration: t.status === 'completada' ? 'line-through' : 'none' }}>{t.title}</div>
                    <div style={{ fontSize: 11, color: '#888', marginTop: 2, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {t.owner_uv && <span>{t.owner_uv}</span>}
                      {t.due_date && <CountdownChip fecha={t.due_date} />}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button style={S.btnEdit}   onClick={() => { setEditingTask(t); setModal('editTask') }}>Editar</button>
                    <button style={S.btnDanger} onClick={async () => { await deleteTask(t.id); loadRelated(startup.id) }}>×</button>
                  </div>
                </div>
              ))
            }
          </Section>

        </div>
      </div>

      {/* ── Modals ── */}
      {modal === 'editStartup' && (
        <StartupEditModal startup={startup} onSave={afterEdit} onClose={() => setModal(null)} />
      )}
      {modal === 'addUpdate' && (
        <UpdateModal startupId={startup.id} onSave={afterUpdate} onClose={() => setModal(null)} />
      )}
      {(modal === 'addTask' || modal === 'editTask') && (
        <TaskModal startupId={startup.id} task={editingTask} onSave={afterRelated} onClose={() => { setModal(null); setEditingTask(null) }} />
      )}
      {modal === 'addProgram' && (
        <ProgramModal startupId={startup.id} program={editingProgram} onSave={afterRelated} onClose={() => { setModal(null); setEditingProgram(null) }} />
      )}

      <ConfirmDialog
        message={confirm?.message}
        onConfirm={() => { confirm.onConfirm(); setConfirm(null) }}
        onCancel={() => setConfirm(null)}
      />
      <Toast message={toast} />
    </div>
  )
}
