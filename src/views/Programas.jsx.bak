import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Badge, PrioDot, PageHeader, formatDate, Modal, Field, Input, Select, Btn, ESTADOS, TRIMESTRES } from '../components/ui'

const empty = { nombre: '', responsable: '', trimestre: 'Q2', estado: 'por_iniciar', prioridad: 'media', fecha_inicio: '', fecha_fin: '' }
const BORDER = { en_ejecucion: '#10B981', por_iniciar: '#3B82F6', en_riesgo: '#F59E0B', retrasado: '#EF4444', cerrado: '#9CA3AF' }

export default function Programas() {
  const [items, setItems] = useState([])
  const [hitos, setHitos] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(empty)
  const [expanded, setExpanded] = useState(null)
  const [filterEstado, setFilterEstado] = useState('todos')
  const [filterQ, setFilterQ] = useState('todos')

  useEffect(() => { load() }, [])

  async function load() {
    const [{ data: p }, { data: h }] = await Promise.all([
      supabase.from('programas').select('*').order('created_at'),
      supabase.from('hitos').select('*').order('fecha'),
    ])
    setItems(p || [])
    setHitos(h || [])
  }

  const save = async () => {
    if (!form.nombre.trim()) return
    if (modal.mode === 'new') await supabase.from('programas').insert([form])
    else await supabase.from('programas').update(form).eq('id', modal.item.id)
    setModal(null)
    load()
  }

  const del = async (id) => {
    if (!confirm('¿Eliminar este programa?')) return
    await supabase.from('programas').delete().eq('id', id)
    load()
  }

  const filtered = items
    .filter(p => filterEstado === 'todos' || p.estado === filterEstado)
    .filter(p => filterQ === 'todos' || p.trimestre === filterQ)

  return (
    <div>
      <PageHeader title="Programas" subtitle={`${items.length} programas registrados`}
        action={<Btn onClick={() => { setForm({...empty}); setModal({ mode: 'new' }) }}>+ Nuevo programa</Btn>} />

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)} style={{ fontSize: 12, padding: '7px 10px', borderRadius: 7, border: '1px solid #D1D5DB', background: '#fff' }}>
          <option value="todos">Todos los estados</option>
          {Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filterQ} onChange={e => setFilterQ(e.target.value)} style={{ fontSize: 12, padding: '7px 10px', borderRadius: 7, border: '1px solid #D1D5DB', background: '#fff' }}>
          <option value="todos">Todos los trimestres</option>
          {TRIMESTRES.map(q => <option key={q} value={q}>{q}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(p => {
          const hitosP = hitos.filter(h => h.programa === p.nombre)
          const open = expanded === p.id
          return (
            <div key={p.id} style={{ background: '#fff', border: '1px solid #E8E7E2', borderLeft: `4px solid ${BORDER[p.estado] || '#9CA3AF'}`, borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', cursor: 'pointer' }} onClick={() => setExpanded(open ? null : p.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                      <PrioDot prioridad={p.prioridad} />
                      <span style={{ fontSize: 14, fontWeight: 700 }}>{p.nombre}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 5, background: '#F3F4F6', color: '#374151' }}>{p.trimestre}</span>
                      <Badge estado={p.estado} small />
                    </div>
                    <div style={{ fontSize: 12, color: '#888', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                      <span>Responsable: <strong style={{ color: '#555' }}>{p.responsable}</strong></span>
                      {p.fecha_inicio && <span>{formatDate(p.fecha_inicio)} → {formatDate(p.fecha_fin)}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginLeft: 12, flexShrink: 0, alignItems: 'center' }}>
                    <button onClick={e => { e.stopPropagation(); setForm({...p}); setModal({ mode: 'edit', item: p }) }} style={{ fontSize: 11, padding: '5px 10px', borderRadius: 6, border: '1px solid #D1D5DB', background: '#F9FAFB', cursor: 'pointer' }}>Editar</button>
                    <button onClick={e => { e.stopPropagation(); del(p.id) }} style={{ fontSize: 11, padding: '5px 10px', borderRadius: 6, border: '1px solid #FCA5A5', background: '#FEF2F2', cursor: 'pointer', color: '#991B1B' }}>Eliminar</button>
                    <span style={{ fontSize: 12, color: '#bbb' }}>{open ? '▲' : '▼'}</span>
                  </div>
                </div>
              </div>
              {open && (
                <div style={{ padding: '0 18px 16px', borderTop: '1px solid #F3F4F6' }}>
                  <div style={{ paddingTop: 12, fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Hitos del programa</div>
                  {hitosP.length === 0
                    ? <p style={{ fontSize: 13, color: '#bbb', margin: 0 }}>Sin hitos. Agrégalos en la sección Hitos.</p>
                    : hitosP.map(h => (
                      <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #F9FAFB', fontSize: 13 }}>
                        <span><strong>{h.nombre}</strong> <span style={{ color: '#888', fontSize: 12 }}>{h.etapa}</span></span>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <Badge estado={h.estado} small />
                          <span style={{ fontSize: 11, color: '#bbb' }}>{formatDate(h.fecha)}</span>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          )
        })}
      </div>

      {modal && (
        <Modal title={modal.mode === 'new' ? 'Nuevo programa' : 'Editar programa'} onClose={() => setModal(null)}>
          <Field label="Nombre *"><Input value={form.nombre} onChange={e => setForm(f => ({...f, nombre: e.target.value}))} /></Field>
          <Field label="Responsable"><Input value={form.responsable} onChange={e => setForm(f => ({...f, responsable: e.target.value}))} /></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Trimestre"><Select value={form.trimestre} onChange={e => setForm(f => ({...f, trimestre: e.target.value}))}>{TRIMESTRES.map(q => <option key={q} value={q}>{q}</option>)}</Select></Field>
            <Field label="Prioridad"><Select value={form.prioridad} onChange={e => setForm(f => ({...f, prioridad: e.target.value}))}><option value="alta">Alta</option><option value="media">Media</option><option value="baja">Baja</option></Select></Field>
          </div>
          <Field label="Estado"><Select value={form.estado} onChange={e => setForm(f => ({...f, estado: e.target.value}))}>{Object.entries(ESTADOS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}</Select></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Fecha inicio"><Input type="date" value={form.fecha_inicio || ''} onChange={e => setForm(f => ({...f, fecha_inicio: e.target.value}))} /></Field>
            <Field label="Fecha fin"><Input type="date" value={form.fecha_fin || ''} onChange={e => setForm(f => ({...f, fecha_fin: e.target.value}))} /></Field>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <Btn variant="secondary" onClick={() => setModal(null)}>Cancelar</Btn>
            <Btn onClick={save}>Guardar</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}
