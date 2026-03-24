import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { PageHeader, Modal, Field, Input, Select, Btn } from '../components/ui'

const empty = {
  nombre: '', fundadores: '', sector: '', estado: 'activa', origen: 'USIL',
  programa: '', pais: 'Perú', softlanding: false, fondos_obtenidos: '',
  fuente_fondo: '', anio_ingreso: new Date().getFullYear(), link_web: '', notas: ''
}
const SECTORES = ['Agritech','Cleantech','Edtech','Fintech','Healthtech','Logtech','Retailtech','Socialtech','Otro']

export default function Portafolio() {
  const [items, setItems] = useState([])
  const [programas, setProgramas] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(empty)
  const [detalle, setDetalle] = useState(null)
  const [filterEstado, setFilterEstado] = useState('todos')
  const [filterOrigen, setFilterOrigen] = useState('todos')
  const [filterSoft, setFilterSoft] = useState('todos')

  useEffect(() => { load() }, [])

  async function load() {
    const [{ data: s }, { data: p }] = await Promise.all([
      supabase.from('startups').select('*').order('anio_ingreso', { ascending: false }),
      supabase.from('programas').select('nombre').order('nombre'),
    ])
    setItems(s || [])
    setProgramas(p || [])
  }

  const save = async () => {
    if (!form.nombre.trim()) return
    const parsed = { ...form, fondos_obtenidos: parseFloat(form.fondos_obtenidos)||0, anio_ingreso: parseInt(form.anio_ingreso)||2026 }
    if (modal.mode === 'new') await supabase.from('startups').insert([parsed])
    else await supabase.from('startups').update(parsed).eq('id', modal.item.id)
    setModal(null); load()
  }

  const del = async (id) => {
    if (!confirm('Eliminar esta startup?')) return
    await supabase.from('startups').delete().eq('id', id)
    setDetalle(null); load()
  }

  const filtered = items
    .filter(s => filterEstado === 'todos' || s.estado === filterEstado)
    .filter(s => filterOrigen === 'todos' || s.origen === filterOrigen)
    .filter(s => filterSoft === 'todos' || (filterSoft === 'si' ? s.softlanding : !s.softlanding))

  const stats = [
    { label: 'Total', value: items.length, color: '#374151' },
    { label: 'Activas', value: items.filter(s=>s.estado==='activa').length, color: '#059669' },
    { label: 'USIL', value: items.filter(s=>s.origen==='USIL').length, color: '#1D4ED8' },
    { label: 'Softlanding', value: items.filter(s=>s.softlanding).length, color: '#7C3AED' },
    { label: 'Con fondos', value: items.filter(s=>s.fondos_obtenidos>0).length, color: '#D97706' },
  ]

  const sel = (k, v) => ({ fontSize:12, padding:'7px 10px', borderRadius:7, border:'1px solid #D1D5DB', background:'#fff' })

  return (
    <div>
      <PageHeader title="Portafolio de Startups" subtitle={`${items.length} startups registradas`}
        action={<Btn onClick={() => { setForm({...empty}); setModal({ mode:'new' }) }}>+ Nueva startup</Btn>} />

      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
        {stats.map((s,i) => (
          <div key={i} style={{ background:'#fff', border:'1px solid #E8E7E2', borderRadius:8, padding:'10px 16px', display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:22, fontWeight:700, color:s.color }}>{s.value}</span>
            <span style={{ fontSize:12, color:'#888' }}>{s.label}</span>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
        <select value={filterEstado} onChange={e=>setFilterEstado(e.target.value)} style={sel()}>
          <option value="todos">Todos los estados</option>
          <option value="activa">Activas</option>
          <option value="inactiva">Inactivas</option>
        </select>
        <select value={filterOrigen} onChange={e=>setFilterOrigen(e.target.value)} style={sel()}>
          <option value="todos">USIL + Externas</option>
          <option value="USIL">Solo USIL</option>
          <option value="externa">Solo externas</option>
        </select>
        <select value={filterSoft} onChange={e=>setFilterSoft(e.target.value)} style={sel()}>
          <option value="todos">Con y sin softlanding</option>
          <option value="si">Con softlanding</option>
          <option value="no">Sin softlanding</option>
        </select>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:14 }}>
        {filtered.map(s => (
          <div key={s.id} onClick={()=>setDetalle(s)} style={{ background:'#fff', border:'1px solid #E8E7E2', borderRadius:10, padding:'16px 18px', cursor:'pointer', borderTop:`3px solid ${s.estado==='activa'?'#10B981':'#9CA3AF'}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
              <div style={{ fontSize:14, fontWeight:700, flex:1, lineHeight:1.3 }}>{s.nombre}</div>
              <div style={{ display:'flex', gap:4, flexShrink:0, marginLeft:8, flexDirection:'column', alignItems:'flex-end' }}>
                <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:4, background:s.estado==='activa'?'#D1FAE5':'#F3F4F6', color:s.estado==='activa'?'#065F46':'#374151' }}>{s.estado}</span>
                <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:4, background:s.origen==='USIL'?'#DBEAFE':'#F3F4F6', color:s.origen==='USIL'?'#1E40AF':'#374151' }}>{s.origen}</span>
              </div>
            </div>
            <div style={{ fontSize:12, color:'#888', marginBottom:6 }}>{s.fundadores}</div>
            <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:8 }}>
              {s.sector && <span style={{ fontSize:10, background:'#F3F4F6', color:'#374151', borderRadius:4, padding:'2px 6px' }}>{s.sector}</span>}
              {s.pais && <span style={{ fontSize:10, background:'#F3F4F6', color:'#374151', borderRadius:4, padding:'2px 6px' }}>{s.pais}</span>}
              {s.softlanding && <span style={{ fontSize:10, background:'#EDE9FE', color:'#5B21B6', borderRadius:4, padding:'2px 6px' }}>Softlanding</span>}
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#bbb', borderTop:'1px solid #F3F4F6', paddingTop:8 }}>
              <span>{s.programa||'—'}</span><span>{s.anio_ingreso}</span>
            </div>
            {s.fondos_obtenidos>0 && <div style={{ marginTop:6, fontSize:12, fontWeight:600, color:'#D97706' }}>S/ {Number(s.fondos_obtenidos).toLocaleString()} · {s.fuente_fondo}</div>}
          </div>
        ))}
        {filtered.length===0 && <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'48px 0', color:'#bbb', fontSize:13 }}>{items.length===0?'Sin startups. Agrega la primera.':'Sin resultados con estos filtros.'}</div>}
      </div>

      {detalle && (
        <Modal title={detalle.nombre} onClose={()=>setDetalle(null)}>
          <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap' }}>
            <span style={{ fontSize:11, fontWeight:700, padding:'3px 9px', borderRadius:5, background:detalle.estado==='activa'?'#D1FAE5':'#F3F4F6', color:detalle.estado==='activa'?'#065F46':'#374151' }}>{detalle.estado}</span>
            <span style={{ fontSize:11, fontWeight:700, padding:'3px 9px', borderRadius:5, background:detalle.origen==='USIL'?'#DBEAFE':'#F3F4F6', color:detalle.origen==='USIL'?'#1E40AF':'#374151' }}>{detalle.origen}</span>
            {detalle.softlanding && <span style={{ fontSize:11, fontWeight:700, padding:'3px 9px', borderRadius:5, background:'#EDE9FE', color:'#5B21B6' }}>Softlanding</span>}
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8, fontSize:13, marginBottom:18 }}>
            {[['Fundadores',detalle.fundadores],['Sector',detalle.sector],['Programa',detalle.programa],['País',detalle.pais],['Año de ingreso',detalle.anio_ingreso],['Fondos',detalle.fondos_obtenidos>0?`S/ ${Number(detalle.fondos_obtenidos).toLocaleString()}`:'—'],['Fuente',detalle.fuente_fondo]].map(([l,v])=>v?(
              <div key={l} style={{ display:'flex', gap:8 }}><span style={{ color:'#888', minWidth:130, flexShrink:0 }}>{l}:</span><span style={{ fontWeight:500 }}>{v}</span></div>
            ):null)}
            {detalle.link_web && <div style={{ display:'flex', gap:8 }}><span style={{ color:'#888', minWidth:130, flexShrink:0 }}>Web/Pitch:</span><a href={detalle.link_web} target="_blank" rel="noreferrer" style={{ color:'#1D4ED8', fontWeight:500 }}>{detalle.link_web}</a></div>}
            {detalle.notas && <div style={{ marginTop:4, padding:'10px 12px', background:'#F9FAFB', borderRadius:7, fontSize:12, color:'#555', lineHeight:1.5 }}>{detalle.notas}</div>}
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
            <Btn variant="danger" onClick={()=>del(detalle.id)}>Eliminar</Btn>
            <Btn onClick={()=>{ setForm({...detalle, fondos_obtenidos:String(detalle.fondos_obtenidos), anio_ingreso:String(detalle.anio_ingreso)}); setModal({mode:'edit',item:detalle}); setDetalle(null) }}>Editar</Btn>
          </div>
        </Modal>
      )}

      {modal && (
        <Modal title={modal.mode==='new'?'Nueva startup':'Editar startup'} onClose={()=>setModal(null)}>
          <Field label="Nombre *"><Input value={form.nombre} onChange={e=>setForm(f=>({...f,nombre:e.target.value}))} placeholder="Nombre de la startup" /></Field>
          <Field label="Fundadores"><Input value={form.fundadores} onChange={e=>setForm(f=>({...f,fundadores:e.target.value}))} placeholder="Nombre(s) del/los fundadores" /></Field>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <Field label="Sector"><Select value={form.sector} onChange={e=>setForm(f=>({...f,sector:e.target.value}))}><option value="">Seleccionar</option>{SECTORES.map(s=><option key={s} value={s}>{s}</option>)}</Select></Field>
            <Field label="Año de ingreso"><Input type="number" value={form.anio_ingreso} onChange={e=>setForm(f=>({...f,anio_ingreso:e.target.value}))} /></Field>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <Field label="Estado"><Select value={form.estado} onChange={e=>setForm(f=>({...f,estado:e.target.value}))}><option value="activa">Activa</option><option value="inactiva">Inactiva</option></Select></Field>
            <Field label="Origen"><Select value={form.origen} onChange={e=>setForm(f=>({...f,origen:e.target.value}))}><option value="USIL">USIL</option><option value="externa">Externa</option></Select></Field>
          </div>
          <Field label="Programa"><Select value={form.programa} onChange={e=>setForm(f=>({...f,programa:e.target.value}))}><option value="">Sin programa</option>{programas.map(p=><option key={p.nombre} value={p.nombre}>{p.nombre}</option>)}</Select></Field>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <Field label="País"><Input value={form.pais} onChange={e=>setForm(f=>({...f,pais:e.target.value}))} /></Field>
            <Field label="Softlanding"><Select value={form.softlanding?'si':'no'} onChange={e=>setForm(f=>({...f,softlanding:e.target.value==='si'}))}><option value="no">No</option><option value="si">Sí</option></Select></Field>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <Field label="Fondos (S/)"><Input type="number" value={form.fondos_obtenidos} onChange={e=>setForm(f=>({...f,fondos_obtenidos:e.target.value}))} placeholder="0" /></Field>
            <Field label="Fuente del fondo"><Input value={form.fuente_fondo} onChange={e=>setForm(f=>({...f,fuente_fondo:e.target.value}))} placeholder="ProInnóvate, ángel..." /></Field>
          </div>
          <Field label="Link web / pitch deck"><Input value={form.link_web} onChange={e=>setForm(f=>({...f,link_web:e.target.value}))} placeholder="https://..." /></Field>
          <Field label="Notas"><textarea value={form.notas} onChange={e=>setForm(f=>({...f,notas:e.target.value}))} placeholder="Observaciones..." style={{ width:'100%', padding:'9px 12px', borderRadius:7, border:'1px solid #D1D5DB', fontSize:13, fontFamily:'inherit', resize:'vertical', minHeight:72, boxSizing:'border-box' }} /></Field>
          <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:8 }}>
            <Btn variant="secondary" onClick={()=>setModal(null)}>Cancelar</Btn>
            <Btn onClick={save}>Guardar</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}
