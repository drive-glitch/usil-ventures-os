import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Badge, PrioDot, PageHeader, formatDate, Modal, Field, Input, Select, Btn, ESTADOS, TRIMESTRES, Toast, useToast, ConfirmDialog, HelpButton } from '../components/ui'

const empty = { nombre: '', responsable: '', trimestre: 'Q2', estado: 'por_iniciar', prioridad: 'media', fecha_inicio: '', fecha_fin: '' }

const BORDER_COLOR = { en_ejecucion: '#10B981', por_iniciar: '#3B82F6', en_riesgo: '#F59E0B', retrasado: '#EF4444', cerrado: '#9CA3AF' }

const EQUIPO_UV = ['Marcoantonio Pacheco', 'Leslie Ponce', 'Arturo Garro']

function ResponsableChip({ responsable }) {
  const [open, setOpen] = useState(false)
  const isTeam = !responsable || /todo|equipo/i.test(responsable)
  if (!isTeam) return <span style={{ fontWeight: 500, color: '#555', fontSize: 12 }}>{responsable}</span>
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
        style={{ fontSize: 12, fontWeight: 500, color: '#555', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 5, padding: '2px 8px', cursor: 'pointer', fontFamily: 'inherit' }}>
        Todo el equipo {open ? '▲' : '▼'}
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: '#fff', border: '1px solid #E8E7E2', borderRadius: 7, padding: '8px 12px', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', minWidth: 200 }}>
          {EQUIPO_UV.map(m => (
            <div key={m} style={{ fontSize: 12, color: '#374151', padding: '4px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#EFF6FF', color: '#1D4ED8', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {m.split(' ').map(w => w[0]).join('').slice(0,2)}
              </span>
              {m}
            </div>
          ))}
        </div>
      )}
    </span>
  )
}

export default function Programas({ initialFilter = {} }) {
  const [items,    setItems]    = useState([])
  const [hitos,    setHitos]    = useState([])
  const [modal,    setModal]    = useState(null)
  const [form,     setForm]     = useState(empty)
  const [errors,   setErrors]   = useState({})
  const [expanded, setExpanded] = useState(null)
  const [filterEstado, setFilterEstado] = useState(initialFilter.estado || 'todos')
  const [filterQs, setFilterQs] = useState([])
  const [confirm, setConfirm]   = useState(null)
  const { toast, showToast }    = useToast()

  useEffect(() => { load() }, [])

  async function load() {
    const cached = localStorage.getItem('usil_programas')
    if (cached) try { setItems(JSON.parse(cached)) } catch {}
    const [{ data: p }, { data: h }] = await Promise.all([
      supabase.from('programas').select('*').order('created_at'),
      supabase.from('hitos').select('*').order('fecha'),
    ])
    setItems(p || [])
    setHitos(h || [])
    if (p) localStorage.setItem('usil_programas', JSON.stringify(p))
    if (h) localStorage.setItem('usil_hitos', JSON.stringify(h))
  }

  const toggleQ = q => setFilterQs(qs => qs.includes(q) ? qs.filter(x => x !== q) : [...qs, q])

  const validate = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'Este campo es obligatorio'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const save = async () => {
    if (!validate()) return
    if (modal.mode === 'new') await supabase.from('programas').insert([form])
    else await supabase.from('programas').update(form).eq('id', modal.item.id)
    setModal(null)
    showToast(`Programa ${modal.mode === 'new' ? 'creado' : 'actualizado'} correctamente`)
    load()
  }

  const del = (id, nombre) => {
    setConfirm({
      message: `¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`,
      onConfirm: async () => { await supabase.from('programas').delete().eq('id', id); showToast('Programa eliminado'); load() },
    })
  }

  // Filtrado por Q primero, luego por estado
  const filteredByQ = items.filter(p => filterQs.length === 0 || filterQs.includes(p.trimestre))
  const filtered    = filteredByQ.filter(p => filterEstado === 'todos' || p.estado === filterEstado)

  // Contadores reactivos al filtro Q activo
  const counts = Object.keys(ESTADOS).reduce((acc, k) => {
    acc[k] = filteredByQ.filter(i => i.estado === k).length
    return acc
  }, {})

  return (
    <div>
      <PageHeader title="Programas" subtitle={`${items.length} programas registrados`}
        action={<div style={{display:'flex',gap:8,alignItems:'center'}}>
          <HelpButton title="Programas">
            <b>Programas</b> son los ciclos de aceleración o incubación activos.<br/>
            Filtra por trimestre con los chips Q1–Q4. Los contadores se actualizan según el filtro.<br/>
            El campo <b>Responsable</b> puede ser una persona o "Todo el equipo".
          </HelpButton>
          <Btn onClick={() => { setForm({...empty}); setErrors({}); setModal({ mode: 'new' }) }}>+ Nuevo programa</Btn>
        </div>} />

      {/* Multi-Q chips */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#888', fontWeight: 600, marginRight: 2 }}>Trimestre:</span>
        {TRIMESTRES.map(q => (
          <button key={q} onClick={() => toggleQ(q)}
            style={{
              fontSize: 12, padding: '5px 12px', borderRadius: 20, fontFamily: 'inherit', cursor: 'pointer', fontWeight: filterQs.includes(q) ? 700 : 400,
              border: `1px solid ${filterQs.includes(q) ? '#1D4ED8' : '#D1D5DB'}`,
              background: filterQs.includes(q) ? '#1D4ED8' : '#fff',
              color: filterQs.includes(q) ? '#fff' : '#555',
            }}>
            {q}
          </button>
        ))}
        {filterQs.length > 0 && (
          <button onClick={() => setFilterQs([])} style={{ fontSize: 11, color: '#888', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
            Limpiar
          </button>
        )}
      </div>

      {/* Estado chips — contadores reactivos al Q activo */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {Object.entries(ESTADOS).map(([k, v]) => counts[k] > 0 && (
          <button key={k} onClick={() => setFilterEstado(filterEstado === k ? 'todos' : k)}
            style={{ fontSize: 12, padding: '5px 12px', borderRadius: 20, border: `1px solid ${filterEstado === k ? v.border : '#E5E7EB'}`, background: filterEstado === k ? v.bg : '#fff', color: filterEstado === k ? v.text : '#555', cursor: 'pointer', fontFamily: 'inherit', fontWeight: filterEstado === k ? 600 : 400 }}>
            {v.label} <strong>{counts[k]}</strong>
          </button>
        ))}
      </div>

      {/* Card grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
        {filtered.map(p => {
          const hitosP      = hitos.filter(h => h.programa === p.nombre)
          const completados = hitosP.filter(h => h.estado === 'cerrado').length
          const total       = hitosP.length
          const pct         = total > 0 ? Math.round((completados / total) * 100) : 0
          const barColor    = BORDER_COLOR[p.estado] || '#9CA3AF'
          const open        = expanded === p.id

          return (
            <div key={p.id} style={{ background: '#fff', border: '1px solid #E8E7E2', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: 4, background: barColor }} />
              <div style={{ padding: '14px 16px', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ flex: 1, paddingRight: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                      <PrioDot prioridad={p.prioridad} />
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a18' }}>{p.nombre}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Badge estado={p.estado} small />
                      <span style={{ fontSize: 11, background: '#F3F4F6', borderRadius: 5, padding: '2px 7px', color: '#555', fontWeight: 500 }}>{p.trimestre}</span>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: 12, color: '#888', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <ResponsableChip responsable={p.responsable} />
                  {p.fecha_inicio && <span style={{ color: '#aaa' }}>· {formatDate(p.fecha_inicio)} → {formatDate(p.fecha_fin)}</span>}
                </div>

                {total > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888', marginBottom: 4 }}>
                      <span>Hitos completados</span>
                      <span style={{ fontWeight: 600, color: barColor }}>{completados} / {total} ({pct}%)</span>
                    </div>
                    <div style={{ height: 6, background: '#F0EFE9', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 4, transition: 'width 0.4s' }} />
                    </div>
                  </div>
                )}
                {total === 0 && <div style={{ fontSize: 11, color: '#bbb', marginBottom: 12 }}>Sin hitos registrados</div>}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {total > 0 ? (
                    <button onClick={() => setExpanded(open ? null : p.id)}
                      style={{ fontSize: 11, color: '#1D4ED8', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
                      {open ? '▲ Ocultar hitos' : `▼ Ver ${total} hito${total > 1 ? 's' : ''}`}
                    </button>
                  ) : <span />}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => { setForm({...p}); setErrors({}); setModal({ mode: 'edit', item: p }) }}
                      style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: '1px solid #D1D5DB', background: '#F9FAFB', cursor: 'pointer' }}>Editar</button>
                    <button onClick={() => del(p.id, p.nombre)}
                      style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: '1px solid #FCA5A5', background: '#FEF2F2', cursor: 'pointer', color: '#991B1B' }}>×</button>
                  </div>
                </div>
              </div>

              {open && (
                <div style={{ borderTop: '1px solid #F3F4F6', padding: '10px 16px 14px', background: '#FAFAFA' }}>
                  {hitosP.map(h => (
                    <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F0EFE9', fontSize: 12 }}>
                      <span><strong>{h.nombre}</strong> {h.etapa && <span style={{ color: '#888' }}>· {h.etapa}</span>}</span>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <Badge estado={h.estado} small />
                        <span style={{ fontSize: 11, color: '#bbb' }}>{formatDate(h.fecha)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#bbb', fontSize: 13 }}>
          Sin programas con estos filtros.
        </div>
      )}

      {modal && (
        <Modal title={modal.mode === 'new' ? 'Nuevo programa' : 'Editar programa'} onClose={() => setModal(null)}>
          <Field label="Nombre *" error={errors.nombre}>
            <Input value={form.nombre}
              onChange={e => { setForm(f => ({...f, nombre: e.target.value})); setErrors(er => ({...er, nombre: null})) }}
              style={errors.nombre ? { borderColor: '#EF4444' } : {}} />
          </Field>
          <Field label="Responsable">
            <Input value={form.responsable} onChange={e => setForm(f => ({...f, responsable: e.target.value}))} placeholder="Ej: Leslie Ponce, Todo el equipo" />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Trimestre">
              <Select value={form.trimestre} onChange={e => setForm(f => ({...f, trimestre: e.target.value}))}>
                {TRIMESTRES.map(q => <option key={q} value={q}>{q}</option>)}
              </Select>
            </Field>
            <Field label="Prioridad">
              <Select value={form.prioridad} onChange={e => setForm(f => ({...f, prioridad: e.target.value}))}>
                <option value="alta">Alta</option><option value="media">Media</option><option value="baja">Baja</option>
              </Select>
            </Field>
          </div>
          <Field label="Estado">
            <Select value={form.estado} onChange={e => setForm(f => ({...f, estado: e.target.value}))}>
              {Object.entries(ESTADOS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </Select>
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Fecha inicio">
              <Input type="date" value={form.fecha_inicio || ''} onChange={e => setForm(f => ({...f, fecha_inicio: e.target.value}))} />
            </Field>
            <Field label="Fecha fin">
              <Input type="date" value={form.fecha_fin || ''} onChange={e => setForm(f => ({...f, fecha_fin: e.target.value}))} />
            </Field>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <Btn variant="secondary" onClick={() => setModal(null)}>Cancelar</Btn>
            <Btn onClick={save}>Guardar</Btn>
          </div>
        </Modal>
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
