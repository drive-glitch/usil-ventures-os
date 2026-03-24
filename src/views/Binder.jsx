import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { PageHeader, Modal, Field, Input, Select, Btn, formatDate } from '../components/ui'

const ESTADO_BINDER = {
  sin_binder:  { label: 'Sin binder',  bg: '#F3F4F6', color: '#374151' },
  en_proceso:  { label: 'En proceso',  bg: '#FEF3C7', color: '#92400E' },
  completado:  { label: 'Completado',  bg: '#D1FAE5', color: '#065F46' },
}

export default function Binder() {
  const [actividades, setActividades] = useState([])
  const [hitos, setHitos] = useState([])
  const [editModal, setEditModal] = useState(null)
  const [form, setForm] = useState({ link_binder: '', estado_binder: 'sin_binder' })
  const [filterEstado, setFilterEstado] = useState('todos')
  const [filterBinder, setFilterBinder] = useState('todos')

  useEffect(() => { load() }, [])

  async function load() {
    const [{ data: a }, { data: h }] = await Promise.all([
      supabase.from('actividades').select('*').order('fecha'),
      supabase.from('hitos').select('*').order('fecha'),
    ])
    setActividades(a || [])
    setHitos(h || [])
  }

  const saveLink = async () => {
    await supabase.from('actividades').update({ link_binder: form.link_binder, estado_binder: form.estado_binder }).eq('id', editModal.id)
    setEditModal(null)
    load()
  }

  // Merge actividades + hitos para la vista de binder
  const allItems = [
    ...actividades.map(a => ({ ...a, _source: 'actividad' })),
    ...hitos.map(h => ({ ...h, tipo: 'Hito', _source: 'hito', estado_binder: 'sin_binder' })),
  ].sort((a, b) => new Date(a.fecha) - new Date(b.fecha))

  const filtered = allItems
    .filter(i => filterEstado === 'todos' || i.tipo === filterEstado)
    .filter(i => filterBinder === 'todos' || (i.estado_binder || 'sin_binder') === filterBinder)

  const stats = {
    total: actividades.length,
    completados: actividades.filter(a => a.estado_binder === 'completado').length,
    en_proceso: actividades.filter(a => a.estado_binder === 'en_proceso').length,
    sin_binder: actividades.filter(a => !a.estado_binder || a.estado_binder === 'sin_binder').length,
  }

  const TIPO_COLORS = { Evento: '#3B82F6', Comité: '#8B5CF6', Taller: '#F59E0B', Mentoría: '#10B981', Hito: '#374151' }
  const sel = { fontSize: 12, padding: '7px 10px', borderRadius: 7, border: '1px solid #D1D5DB', background: '#fff', color: '#333' }

  return (
    <div>
      <PageHeader
        title="Binder de Eventos"
        subtitle="Registro y seguimiento de documentación por evento"
      />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total actividades', value: stats.total, color: '#1D4ED8' },
          { label: 'Binders completos', value: stats.completados, color: '#059669' },
          { label: 'En proceso', value: stats.en_proceso, color: '#D97706' },
          { label: 'Sin binder', value: stats.sin_binder, color: '#9CA3AF' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #E8E7E2', borderRadius: 10, padding: '14px 18px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#888', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <select style={sel} value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
          <option value="todos">Todos los tipos</option>
          {['Evento','Comité','Taller','Mentoría','Hito'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select style={sel} value={filterBinder} onChange={e => setFilterBinder(e.target.value)}>
          <option value="todos">Todos los binders</option>
          {Object.entries(ESTADO_BINDER).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #E8E7E2', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E8E7E2' }}>
              {['Tipo', 'Nombre', 'Programa', 'Fecha', 'Estado binder', 'Link binder', ''].map(h => (
                <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, i) => {
              const binderEstado = item.estado_binder || 'sin_binder'
              const be = ESTADO_BINDER[binderEstado]
              const tc = TIPO_COLORS[item.tipo] || '#6B7280'
              return (
                <tr key={`${item._source}-${item.id}`} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: tc + '20', color: tc }}>{item.tipo || 'Hito'}</span>
                  </td>
                  <td style={{ padding: '11px 14px', fontWeight: 600, maxWidth: 200 }}>{item.nombre}</td>
                  <td style={{ padding: '11px 14px', color: '#555', fontSize: 12, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.programa || '—'}</td>
                  <td style={{ padding: '11px 14px', whiteSpace: 'nowrap', fontWeight: 500 }}>{formatDate(item.fecha)}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 5, background: be.bg, color: be.color }}>{be.label}</span>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    {item.link_binder
                      ? <a href={item.link_binder} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#1D4ED8', fontWeight: 600, textDecoration: 'none' }}>Abrir binder ↗</a>
                      : <span style={{ fontSize: 12, color: '#bbb' }}>Sin link</span>
                    }
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    {item._source === 'actividad' && (
                      <button onClick={() => { setForm({ link_binder: item.link_binder || '', estado_binder: binderEstado }); setEditModal(item) }}
                        style={{ fontSize: 11, padding: '4px 9px', borderRadius: 5, border: '1px solid #D1D5DB', background: '#F9FAFB', cursor: 'pointer' }}>
                        {item.link_binder ? 'Editar' : '+ Agregar link'}
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: '#bbb', fontSize: 13 }}>Sin resultados.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Edit binder link modal */}
      {editModal && (
        <Modal title={`Binder · ${editModal.nombre}`} onClose={() => setEditModal(null)}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 16, padding: '10px 12px', background: '#F9FAFB', borderRadius: 7, lineHeight: 1.5 }}>
            Pega el link de Google Docs o Google Drive donde está el binder de este evento. Si aún no existe, crea el documento y copia el link aquí.
          </div>
          <Field label="Link del binder (Google Docs / Drive)">
            <Input value={form.link_binder} onChange={e => setForm(f => ({ ...f, link_binder: e.target.value }))} placeholder="https://docs.google.com/..." />
          </Field>
          <Field label="Estado del binder">
            <Select value={form.estado_binder} onChange={e => setForm(f => ({ ...f, estado_binder: e.target.value }))}>
              {Object.entries(ESTADO_BINDER).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </Select>
          </Field>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <Btn variant="secondary" onClick={() => setEditModal(null)}>Cancelar</Btn>
            <Btn onClick={saveLink}>Guardar</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}
