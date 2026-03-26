import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Badge, PageHeader, formatDate, CountdownChip, Modal, Field, Input, Select, Btn, ESTADOS, ETAPAS_HITO, localDate, Toast, useToast, ConfirmDialog } from '../components/ui'

const empty = () => ({ nombre: '', programa: '', fecha: localDate(), responsable: '', estado: 'por_iniciar', etapa: '' })

export default function Hitos({ initialFilter = {} }) {
  const [items, setItems]       = useState([])
  const [programas, setProgramas] = useState([])
  const [modal, setModal]       = useState(null)
  const [form, setForm]         = useState(empty())
  const [errors, setErrors]     = useState({})
  const [filterEstado, setFilterEstado] = useState('todos')
  const [confirm, setConfirm]   = useState(null)
  const { toast, showToast }    = useToast()

  useEffect(() => { load() }, [])

  async function load() {
    const cached = localStorage.getItem('usil_hitos')
    if (cached) try { setItems(JSON.parse(cached)) } catch {}

    const [{ data: h }, { data: p }] = await Promise.all([
      supabase.from('hitos').select('*').order('fecha'),
      supabase.from('programas').select('nombre').order('nombre'),
    ])
    setItems(h || [])
    setProgramas(p || [])
    if (h) localStorage.setItem('usil_hitos', JSON.stringify(h))
  }

  const validate = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'Este campo es obligatorio'
    if (!form.fecha) e.fecha = 'Este campo es obligatorio'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const save = async () => {
    if (!validate()) return
    if (modal.mode === 'new') await supabase.from('hitos').insert([form])
    else await supabase.from('hitos').update(form).eq('id', modal.item.id)
    setModal(null)
    showToast(`Hito ${modal.mode === 'new' ? 'creado' : 'actualizado'} correctamente`)
    load()
  }

  const del = (id, nombre) => {
    setConfirm({
      message: `¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        await supabase.from('hitos').delete().eq('id', id)
        showToast('Hito eliminado')
        load()
      },
    })
  }

  const filtered = items.filter(h => filterEstado === 'todos' || h.estado === filterEstado)

  return (
    <div>
      <PageHeader title="Hitos" subtitle={`${items.length} hitos registrados`}
        action={<Btn onClick={() => { setForm(empty()); setErrors({}); setModal({ mode: 'new' }) }}>+ Nuevo hito</Btn>} />

      <div style={{ marginBottom: 20 }}>
        <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)} style={{ fontSize: 12, padding: '7px 10px', borderRadius: 7, border: '1px solid #D1D5DB', background: '#fff' }}>
          <option value="todos">Todos los estados</option>
          {Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div style={{ background: '#fff', border: '1px solid #E8E7E2', borderRadius: 10, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E8E7E2' }}>
              {['Hito','Programa','Etapa','Responsable','Fecha','Días','Estado',''].map(h => (
                <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((h, i) => (
              <tr key={h.id} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                <td style={{ padding: '11px 14px', fontWeight: 600 }}>{h.nombre}</td>
                <td style={{ padding: '11px 14px', color: '#555', fontSize: 12, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.programa}</td>
                <td style={{ padding: '11px 14px' }}><span style={{ fontSize: 11, background: '#F3F4F6', borderRadius: 5, padding: '2px 7px' }}>{h.etapa || '—'}</span></td>
                <td style={{ padding: '11px 14px', color: '#555', whiteSpace: 'nowrap' }}>{h.responsable}</td>
                <td style={{ padding: '11px 14px', fontWeight: 600, whiteSpace: 'nowrap', minWidth: 110 }}>{formatDate(h.fecha)}</td>
                <td style={{ padding: '11px 14px' }}>{h.fecha && <CountdownChip fecha={h.fecha} />}</td>
                <td style={{ padding: '11px 14px' }}><Badge estado={h.estado} small /></td>
                <td style={{ padding: '11px 14px' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => { setForm({...h}); setErrors({}); setModal({ mode: 'edit', item: h }) }} style={{ fontSize: 11, padding: '4px 8px', borderRadius: 5, border: '1px solid #D1D5DB', background: '#F9FAFB', cursor: 'pointer' }}>Editar</button>
                    <button onClick={() => del(h.id, h.nombre)} style={{ fontSize: 11, padding: '4px 8px', borderRadius: 5, border: '1px solid #FCA5A5', background: '#FEF2F2', cursor: 'pointer', color: '#991B1B' }}>×</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={8} style={{ padding: 32, textAlign: 'center', color: '#bbb', fontSize: 13 }}>Sin hitos.</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal.mode === 'new' ? 'Nuevo hito' : 'Editar hito'} onClose={() => setModal(null)}>
          <Field label="Nombre *" error={errors.nombre}>
            <Input value={form.nombre}
              onChange={e => { setForm(f => ({...f, nombre: e.target.value})); setErrors(er => ({...er, nombre: null})) }}
              style={errors.nombre ? { borderColor: '#EF4444' } : {}} />
          </Field>
          <Field label="Programa">
            <Select value={form.programa} onChange={e => setForm(f => ({...f, programa: e.target.value}))}>
              <option value="">Selecciona un programa</option>
              {programas.map(p => <option key={p.nombre} value={p.nombre}>{p.nombre}</option>)}
            </Select>
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Fecha *" error={errors.fecha}>
              <Input type="date" value={form.fecha || ''}
                onChange={e => { setForm(f => ({...f, fecha: e.target.value})); setErrors(er => ({...er, fecha: null})) }}
                style={errors.fecha ? { borderColor: '#EF4444' } : {}} />
            </Field>
            <Field label="Etapa">
              <Select value={form.etapa || ''} onChange={e => setForm(f => ({...f, etapa: e.target.value}))}>
                <option value="">— Seleccionar —</option>
                {ETAPAS_HITO.map(e => <option key={e} value={e}>{e}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Responsable">
            <Input value={form.responsable} onChange={e => setForm(f => ({...f, responsable: e.target.value}))} />
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
