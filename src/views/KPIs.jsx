import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Badge, KpiBar, PageHeader, Modal, Field, Input, Select, Btn, ESTADOS } from '../components/ui'

const empty = { nombre: '', meta: '', actual: '0', responsable: '', estado: 'por_iniciar' }

export default function KPIs() {
  const [items, setItems] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(empty)

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('kpis').select('*').order('created_at')
    setItems(data || [])
  }

  const save = async () => {
    if (!form.nombre.trim()) return
    const parsed = { ...form, meta: parseFloat(form.meta) || 0, actual: parseFloat(form.actual) || 0 }
    if (modal.mode === 'new') await supabase.from('kpis').insert([parsed])
    else await supabase.from('kpis').update(parsed).eq('id', modal.item.id)
    setModal(null)
    load()
  }

  const del = async (id) => {
    if (!confirm('¿Eliminar este KPI?')) return
    await supabase.from('kpis').delete().eq('id', id)
    load()
  }

  const pills = [
    { label: 'Retrasados', count: items.filter(k => k.estado === 'retrasado').length, bg: '#FEE2E2', color: '#991B1B' },
    { label: 'En riesgo', count: items.filter(k => k.estado === 'en_riesgo').length, bg: '#FEF3C7', color: '#92400E' },
    { label: 'En ejecución', count: items.filter(k => k.estado === 'en_ejecucion').length, bg: '#D1FAE5', color: '#065F46' },
  ]

  const responsables = [...new Set(items.map(k => k.responsable))].filter(Boolean)

  return (
    <div>
      <PageHeader title="KPIs 2026" subtitle={`${items.length} indicadores totales`}
        action={<Btn onClick={() => { setForm({...empty}); setModal({ mode: 'new' }) }}>+ Nuevo KPI</Btn>} />

      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        {pills.map((p, i) => (
          <div key={i} style={{ background: p.bg, borderRadius: 8, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: p.color }}>{p.count}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: p.color }}>{p.label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
        {items.map(k => (
          <div key={k.id} style={{ background: '#fff', border: '1px solid #E8E7E2', borderRadius: 10, padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <div style={{ fontSize: 14, fontWeight: 700, flex: 1, marginRight: 10, lineHeight: 1.3 }}>{k.nombre}</div>
              <div style={{ display: 'flex', gap: 5, flexShrink: 0, alignItems: 'center' }}>
                <Badge estado={k.estado} small />
                <button onClick={() => { setForm({...k, meta: String(k.meta), actual: String(k.actual)}); setModal({ mode: 'edit', item: k }) }} style={{ fontSize: 11, padding: '3px 7px', borderRadius: 5, border: '1px solid #D1D5DB', background: '#F9FAFB', cursor: 'pointer' }}>Editar</button>
                <button onClick={() => del(k.id)} style={{ fontSize: 11, padding: '3px 7px', borderRadius: 5, border: '1px solid #FCA5A5', background: '#FEF2F2', cursor: 'pointer', color: '#991B1B' }}>×</button>
              </div>
            </div>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 10 }}>{k.responsable}</div>
            <KpiBar actual={k.actual} meta={k.meta} estado={k.estado} />
          </div>
        ))}
      </div>

      {responsables.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #E8E7E2', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '12px 18px', borderBottom: '1px solid #F3F4F6', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Avance por responsable</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr style={{ background: '#F9FAFB' }}>{['Responsable','KPIs','Avance promedio'].map(h => <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>)}</tr></thead>
            <tbody>
              {responsables.map((r, i) => {
                const rk = items.filter(k => k.responsable === r)
                const avg = Math.round(rk.reduce((a, k) => a + Math.min(100, k.meta > 0 ? (k.actual/k.meta)*100 : 0), 0) / rk.length)
                return (
                  <tr key={r} style={{ borderBottom: '1px solid #F3F4F6', background: i%2===0?'#fff':'#FAFAFA' }}>
                    <td style={{ padding: '11px 16px', fontWeight: 600 }}>{r}</td>
                    <td style={{ padding: '11px 16px', color: '#555' }}>{rk.length}</td>
                    <td style={{ padding: '11px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1, height: 6, background: '#F0EFE9', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${avg}%`, background: avg<20?'#EF4444':avg<50?'#F59E0B':'#10B981', borderRadius: 4 }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#555', minWidth: 32 }}>{avg}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title={modal.mode === 'new' ? 'Nuevo KPI' : 'Editar KPI'} onClose={() => setModal(null)}>
          <Field label="Nombre *"><Input value={form.nombre} onChange={e => setForm(f => ({...f, nombre: e.target.value}))} /></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Meta anual *"><Input type="number" value={form.meta} onChange={e => setForm(f => ({...f, meta: e.target.value}))} /></Field>
            <Field label="Valor actual"><Input type="number" value={form.actual} onChange={e => setForm(f => ({...f, actual: e.target.value}))} /></Field>
          </div>
          <Field label="Responsable"><Input value={form.responsable} onChange={e => setForm(f => ({...f, responsable: e.target.value}))} /></Field>
          <Field label="Estado"><Select value={form.estado} onChange={e => setForm(f => ({...f, estado: e.target.value}))}>{Object.entries(ESTADOS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}</Select></Field>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <Btn variant="secondary" onClick={() => setModal(null)}>Cancelar</Btn>
            <Btn onClick={save}>Guardar</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}
