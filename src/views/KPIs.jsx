import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Badge, KpiBar, PageHeader, Modal, Field, Input, Select, Btn, ESTADOS, Toast, useToast, ConfirmDialog, HelpButton, StatusSelect, GearBtn, ResponsableSelect } from '../components/ui'

const empty = { nombre: '', meta: '', actual: '0', responsable: '', estado: 'por_iniciar' }

export default function KPIs() {
  const [items, setItems] = useState([])
  const [modal, setModal] = useState(null)
  const [form,  setForm]  = useState(empty)
  const [errors, setErrors] = useState({})
  const [confirm, setConfirm] = useState(null)
  const { toast, showToast }  = useToast()

  useEffect(() => { load() }, [])

  async function load() {
    const cached = localStorage.getItem('usil_kpis')
    if (cached) try { setItems(JSON.parse(cached)) } catch {}

    const { data } = await supabase.from('kpis').select('*').order('created_at')
    setItems(data || [])
    if (data) localStorage.setItem('usil_kpis', JSON.stringify(data))
  }

  const validate = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'Este campo es obligatorio'
    if (!form.meta && form.meta !== 0) e.meta = 'Este campo es obligatorio'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const save = async () => {
    if (!validate()) return
    const parsed = { ...form, meta: parseFloat(form.meta) || 0, actual: parseFloat(form.actual) || 0 }
    if (modal.mode === 'new') await supabase.from('kpis').insert([parsed])
    else await supabase.from('kpis').update(parsed).eq('id', modal.item.id)
    setModal(null)
    showToast(`KPI ${modal.mode === 'new' ? 'creado' : 'actualizado'} correctamente`)
    load()
  }

  const saveEstado = async (id, estado) => {
    await supabase.from('kpis').update({ estado }).eq('id', id)
    showToast('Estado actualizado')
    load()
  }

  const del = (id, nombre) => {
    setConfirm({
      message: `¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        await supabase.from('kpis').delete().eq('id', id)
        showToast('KPI eliminado')
        load()
      },
    })
  }

  const pills = [
    { label: 'Retrasados',   count: items.filter(k => k.estado === 'retrasado').length,   bg: '#FEE2E2', color: '#991B1B' },
    { label: 'En riesgo',    count: items.filter(k => k.estado === 'en_riesgo').length,    bg: '#FEF3C7', color: '#92400E' },
    { label: 'En ejecución', count: items.filter(k => k.estado === 'en_ejecucion').length, bg: '#D1FAE5', color: '#065F46' },
    { label: 'Por iniciar',  count: items.filter(k => k.estado === 'por_iniciar').length,  bg: '#DBEAFE', color: '#1E40AF' },
  ]

  const EQUIPO_UV = ['Marcoantonio Pacheco', 'Leslie Ponce', 'Arturo Garro']
  const expandedItems = items.flatMap(k =>
    /todo|equipo/i.test(k.responsable || '') ? EQUIPO_UV.map(m => ({ ...k, responsable: m })) : [k]
  )
  const responsables = [...new Set(expandedItems.map(k => k.responsable))].filter(Boolean)

  return (
    <div>
      <PageHeader title="KPIs 2026" subtitle={`${items.length} indicadores totales`}
        action={<div style={{display:'flex',gap:8,alignItems:'center'}}>
          <HelpButton title="Métricas / KPIs">
            Cada KPI tiene una <b>meta anual</b> y un <b>valor actual</b>. La barra muestra el % de avance.<br/>
            Si el responsable es "Todo el equipo", el KPI aparece en la tabla de cada miembro del equipo UV.<br/>
            Estados: <b>En ejecución</b> (verde), <b>En riesgo</b> (amarillo), <b>Retrasado</b> (rojo), <b>Por iniciar</b> (azul).
          </HelpButton>
          <Btn onClick={() => { setForm({...empty}); setErrors({}); setModal({ mode: 'new' }) }}>+ Nuevo KPI</Btn>
        </div>} />

      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {pills.map((p, i) => p.count > 0 && (
          <div key={i} style={{ background: p.bg, borderRadius: 8, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: p.color }}>{p.count}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: p.color }}>{p.label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14, marginBottom: 28 }}>
        {items.map(k => (
          <div key={k.id} style={{ background: '#fff', border: '1px solid #E8E7E2', borderRadius: 10, padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <div style={{ fontSize: 14, fontWeight: 700, flex: 1, marginRight: 10, lineHeight: 1.3 }}>{k.nombre}</div>
              <div style={{ display: 'flex', gap: 5, flexShrink: 0, alignItems: 'center' }}>
                <StatusSelect estado={k.estado} onChange={e => saveEstado(k.id, e)} />
                <GearBtn onClick={() => { setForm({...k, meta: String(k.meta), actual: String(k.actual)}); setErrors({}); setModal({ mode: 'edit', item: k }) }} />
                <button onClick={() => del(k.id, k.nombre)} style={{ fontSize: 11, padding: '3px 7px', borderRadius: 5, border: '1px solid #FCA5A5', background: '#FEF2F2', cursor: 'pointer', color: '#991B1B' }}>×</button>
              </div>
            </div>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 10 }}>{k.responsable}</div>
            <KpiBar actual={k.actual} meta={k.meta} estado={k.estado} />
          </div>
        ))}
      </div>


      {modal && (
        <Modal title={modal.mode === 'new' ? 'Nuevo KPI' : 'Editar KPI'} onClose={() => setModal(null)}>
          <Field label="Nombre *" error={errors.nombre}>
            <Input value={form.nombre}
              onChange={e => { setForm(f => ({...f, nombre: e.target.value})); setErrors(er => ({...er, nombre: null})) }}
              style={errors.nombre ? { borderColor: '#EF4444' } : {}} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Meta anual *" error={errors.meta}>
              <Input type="number" value={form.meta}
                onChange={e => { setForm(f => ({...f, meta: e.target.value})); setErrors(er => ({...er, meta: null})) }}
                style={errors.meta ? { borderColor: '#EF4444' } : {}} />
            </Field>
            <Field label="Valor actual">
              <Input type="number" value={form.actual} onChange={e => setForm(f => ({...f, actual: e.target.value}))} />
            </Field>
          </div>
          <Field label="Responsable">
            <ResponsableSelect value={form.responsable || ''} onChange={v => setForm(f => ({...f, responsable: v}))} />
          </Field>
          <Field label="Estado">
            <Select value={form.estado} onChange={e => setForm(f => ({...f, estado: e.target.value}))}>
              {Object.entries(ESTADOS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </Select>
          </Field>
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
