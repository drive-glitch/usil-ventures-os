import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { PageHeader, Modal, Field, Input, Select, Btn, TIPO_ACTIVIDAD, localDate, Toast, useToast, ConfirmDialog } from '../components/ui'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DIAS  = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']
const BINDER_ESTADOS = {
  sin_binder: { label: 'Sin binder', bg: '#F3F4F6', color: '#6B7280' },
  en_proceso:  { label: 'En proceso', bg: '#FEF3C7', color: '#92400E' },
  completado:  { label: 'Completado', bg: '#D1FAE5', color: '#065F46' },
}

const PLANTILLA_BINDER_URL = 'https://docs.google.com/document/d/1jchHjSmF_7AOVglbcfmcsvEo2E8JnzNh/copy'

const empty = () => ({ nombre: '', tipo: 'Evento', fecha: localDate(), programa: '', lugar: '', modalidad: 'Presencial', binder_link: '', binder_estado: 'sin_binder', inscritos: '', participantes: '', url_carpeta: '' })

export default function Calendario({ initialFilter = {} }) {
  const [actividades, setActividades] = useState([])
  const [hitos, setHitos]             = useState([])
  const [programas, setProgramas]     = useState([])
  const [modal, setModal]             = useState(null)
  const [detalle, setDetalle]         = useState(null)
  const [form, setForm]               = useState(empty())
  const [errors, setErrors]           = useState({})
  const [mes, setMes]     = useState(new Date().getMonth())
  const [anio, setAnio]   = useState(new Date().getFullYear())
  const [vistaEventos, setVistaEventos] = useState(initialFilter.vistaEventos || false)
  const [confirm, setConfirm]         = useState(null)
  const { toast, showToast }          = useToast()

  useEffect(() => { load() }, [])

  async function load() {
    const [{ data: a }, { data: h }, { data: p }] = await Promise.all([
      supabase.from('actividades').select('*'),
      supabase.from('hitos').select('*'),
      supabase.from('programas').select('nombre').order('nombre'),
    ])
    setActividades(a || [])
    setHitos(h || [])
    setProgramas(p || [])
    if (a) localStorage.setItem('usil_actividades', JSON.stringify(a))
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
    if (modal.mode === 'new') await supabase.from('actividades').insert([form])
    else await supabase.from('actividades').update(form).eq('id', modal.item.id)
    setModal(null)
    showToast(`Actividad ${modal.mode === 'new' ? 'creada' : 'actualizada'} correctamente`)
    load()
  }

  const del = (id, nombre) => {
    setConfirm({
      message: `¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        await supabase.from('actividades').delete().eq('id', id)
        setDetalle(null)
        showToast('Actividad eliminada')
        load()
      },
    })
  }

  const firstDay   = new Date(anio, mes, 1)
  const lastDay    = new Date(anio, mes + 1, 0)
  const startDow   = (firstDay.getDay() + 6) % 7
  const totalCells = Math.ceil((startDow + lastDay.getDate()) / 7) * 7
  const cells      = Array.from({ length: totalCells }, (_, i) => { const d = i - startDow + 1; return d >= 1 && d <= lastDay.getDate() ? d : null })

  const today   = new Date()
  const isToday = d => d === today.getDate() && mes === today.getMonth() && anio === today.getFullYear()

  const getItems = d => {
    const ds = `${anio}-${String(mes+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    return [
      ...actividades.filter(a => a.fecha === ds).map(a => ({ ...a, _t: 'actividad' })),
      ...hitos.filter(h => h.fecha === ds).map(h => ({ ...h, _t: 'hito' })),
    ]
  }

  const navMes = dir => { let m=mes+dir,y=anio; if(m<0){m=11;y--} if(m>11){m=0;y++} setMes(m);setAnio(y) }
  const todosEventos = [...actividades].sort((a,b) => new Date(a.fecha)-new Date(b.fecha))

  return (
    <div>
      <PageHeader title="Calendario 2026" subtitle="Actividades e hitos del año"
        action={
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={()=>setVistaEventos(!vistaEventos)} style={{ padding:'9px 16px', borderRadius:7, fontSize:13, fontWeight:600, cursor:'pointer', background: vistaEventos?'#1D4ED8':'#F3F4F6', color:vistaEventos?'#fff':'#374151', border:'none' }}>
              {vistaEventos ? 'Vista calendario' : 'Vista eventos'}
            </button>
            <Btn onClick={() => { setForm(empty()); setErrors({}); setModal({ mode:'new' }) }}>+ Nueva actividad</Btn>
          </div>
        } />

      {vistaEventos ? (
        <div>
          <div style={{ fontSize:12, color:'#888', marginBottom:16 }}>Todos los eventos del año · estado del binder por evento</div>
          <div style={{ background:'#fff', border:'1px solid #E8E7E2', borderRadius:10, overflowX:'auto', WebkitOverflowScrolling:'touch' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr style={{ background:'#F9FAFB', borderBottom:'1px solid #E8E7E2' }}>
                  {['Evento','Tipo','Programa','Fecha','Inscritos','Participantes','Carpeta','Binder',''].map(h=>(
                    <th key={h} style={{ padding:'11px 14px', textAlign:'left', fontSize:11, fontWeight:700, color:'#6B7280', textTransform:'uppercase', letterSpacing:'0.05em', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {todosEventos.map((a,i) => {
                  const bs = BINDER_ESTADOS[a.binder_estado] || BINDER_ESTADOS.sin_binder
                  return (
                    <tr key={a.id} style={{ borderBottom:'1px solid #F3F4F6', background:i%2===0?'#fff':'#FAFAFA' }}>
                      <td style={{ padding:'10px 14px', fontWeight:600 }}>{a.nombre}</td>
                      <td style={{ padding:'10px 14px' }}>
                        <span style={{ fontSize:11, fontWeight:700, padding:'2px 7px', borderRadius:4, background:(TIPO_ACTIVIDAD[a.tipo]||'#6B7280')+'20', color:(TIPO_ACTIVIDAD[a.tipo]||'#6B7280') }}>{a.tipo}</span>
                      </td>
                      <td style={{ padding:'10px 14px', color:'#555', fontSize:12 }}>{a.programa||'—'}</td>
                      <td style={{ padding:'10px 14px', fontWeight:600, whiteSpace:'nowrap' }}>{a.fecha}</td>
                      <td style={{ padding:'10px 14px', color:'#555', fontSize:12, textAlign:'center' }}>{a.inscritos||'—'}</td>
                      <td style={{ padding:'10px 14px', color:'#555', fontSize:12, textAlign:'center' }}>{a.participantes||'—'}</td>
                      <td style={{ padding:'10px 14px', fontSize:12 }}>{a.url_carpeta ? <a href={a.url_carpeta} target="_blank" rel="noreferrer" style={{color:'#1D4ED8',fontWeight:600}}>📂 Abrir</a> : '—'}</td>
                      <td style={{ padding:'10px 14px' }}>
                        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                          <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:5, background:bs.bg, color:bs.color }}>{bs.label}</span>
                          {a.binder_link && <a href={a.binder_link} target="_blank" rel="noreferrer" style={{ fontSize:11, color:'#1D4ED8', fontWeight:600 }}>📁 Abrir</a>}
                        </div>
                      </td>
                      <td style={{ padding:'10px 14px' }}>
                        <button onClick={()=>{ setForm({...a}); setErrors({}); setModal({mode:'edit',item:a}) }} style={{ fontSize:11, padding:'4px 8px', borderRadius:5, border:'1px solid #D1D5DB', background:'#F9FAFB', cursor:'pointer' }}>Editar</button>
                      </td>
                    </tr>
                  )
                })}
                {todosEventos.length===0 && <tr><td colSpan={8} style={{ padding:32, textAlign:'center', color:'#bbb', fontSize:13 }}>Sin actividades registradas.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:16 }}>
            <button onClick={()=>navMes(-1)} style={{ background:'none', border:'1px solid #D1D5DB', borderRadius:6, padding:'6px 12px', cursor:'pointer', fontSize:14 }}>←</button>
            <span style={{ fontSize:16, fontWeight:700, minWidth:160, textAlign:'center' }}>{MESES[mes]} {anio}</span>
            <button onClick={()=>navMes(1)} style={{ background:'none', border:'1px solid #D1D5DB', borderRadius:6, padding:'6px 12px', cursor:'pointer', fontSize:14 }}>→</button>
          </div>
          <div style={{ display:'flex', gap:12, marginBottom:14, flexWrap:'wrap' }}>
            {Object.entries(TIPO_ACTIVIDAD).map(([tipo,color]) => (
              <div key={tipo} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'#555' }}>
                <div style={{ width:10, height:10, borderRadius:3, background:color }} />{tipo}
              </div>
            ))}
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'#555' }}>
              <div style={{ width:10, height:10, borderRadius:3, background:'#374151' }} />Hito
            </div>
          </div>
          <div style={{ background:'#fff', border:'1px solid #E8E7E2', borderRadius:10, overflow:'hidden' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', borderBottom:'1px solid #E8E7E2' }}>
              {DIAS.map(d => <div key={d} style={{ padding:'10px 8px', textAlign:'center', fontSize:11, fontWeight:700, color:'#6B7280', textTransform:'uppercase', letterSpacing:'0.05em' }}>{d}</div>)}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)' }}>
              {cells.map((day, i) => {
                const items = day ? getItems(day) : []
                return (
                  <div key={i} style={{ minHeight:80, padding:'4px 5px', borderRight:(i+1)%7===0?'none':'1px solid #F3F4F6', borderBottom:i<cells.length-7?'1px solid #F3F4F6':'none', background:day&&isToday(day)?'#EFF6FF':'#fff', overflow:'hidden' }}>
                    {day && (
                      <>
                        <div style={{ fontSize:11, fontWeight:isToday(day)?700:400, color:isToday(day)?'#1D4ED8':'#374151', marginBottom:3 }}>{day}</div>
                        <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                          {items.slice(0,2).map((item,j) => {
                            const color = item._t==='hito' ? '#374151' : (TIPO_ACTIVIDAD[item.tipo]||'#6B7280')
                            return (
                              <div key={j} onClick={()=>setDetalle(item)} style={{ background:color+'20', color, border:`1px solid ${color}40`, borderRadius:3, padding:'1px 4px', fontSize:9, fontWeight:600, cursor:'pointer', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', lineHeight:1.5 }}>
                                {item._t==='hito'?'●':''}{item.nombre}
                              </div>
                            )
                          })}
                          {items.length > 2 && (
                            <div style={{ fontSize:9, color:'#888', fontWeight:600, paddingLeft:2 }}>+{items.length-2} más</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {detalle && (
        <Modal title={detalle._t==='hito'?'Hito':detalle.tipo} onClose={()=>setDetalle(null)}>
          <div style={{ fontSize:16, fontWeight:700, marginBottom:12 }}>{detalle.nombre}</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8, fontSize:13, marginBottom:18 }}>
            {[['Programa',detalle.programa],['Etapa',detalle.etapa],['Responsable',detalle.responsable],['Lugar',detalle.lugar],['Modalidad',detalle.modalidad],['Fecha',detalle.fecha]].map(([l,v])=>v?(<div key={l} style={{ display:'flex', gap:8 }}><span style={{ color:'#888', minWidth:100, flexShrink:0 }}>{l}:</span><span style={{ fontWeight:500 }}>{v}</span></div>):null)}
            {detalle.binder_link && (
              <div style={{ display:'flex', gap:8 }}>
                <span style={{ color:'#888', minWidth:100, flexShrink:0 }}>Binder:</span>
                <a href={detalle.binder_link} target="_blank" rel="noreferrer" style={{ color:'#1D4ED8', fontWeight:600 }}>📁 Abrir binder</a>
              </div>
            )}
          </div>
          {detalle._t==='actividad' && (
            <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
              <Btn variant="danger" onClick={()=>del(detalle.id, detalle.nombre)}>Eliminar</Btn>
              <Btn onClick={()=>{ setForm({...detalle}); setErrors({}); setModal({mode:'edit',item:detalle}); setDetalle(null) }}>Editar</Btn>
            </div>
          )}
        </Modal>
      )}

      {modal && (
        <Modal title={modal.mode==='new'?'Nueva actividad':'Editar actividad'} onClose={()=>setModal(null)}>
          <Field label="Nombre *" error={errors.nombre}>
            <Input value={form.nombre}
              onChange={e=>{ setForm(f=>({...f,nombre:e.target.value})); setErrors(er=>({...er,nombre:null})) }}
              style={errors.nombre ? { borderColor:'#EF4444' } : {}} />
          </Field>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <Field label="Tipo">
              <Select value={form.tipo} onChange={e=>setForm(f=>({...f,tipo:e.target.value}))}>
                {Object.keys(TIPO_ACTIVIDAD).map(t=><option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Fecha *" error={errors.fecha}>
              <Input type="date" value={form.fecha||''}
                onChange={e=>{ setForm(f=>({...f,fecha:e.target.value})); setErrors(er=>({...er,fecha:null})) }}
                style={errors.fecha ? { borderColor:'#EF4444' } : {}} />
            </Field>
          </div>
          <Field label="Programa">
            <Select value={form.programa} onChange={e=>setForm(f=>({...f,programa:e.target.value}))}>
              <option value="">Sin programa</option>
              {programas.map(p=><option key={p.nombre} value={p.nombre}>{p.nombre}</option>)}
            </Select>
          </Field>
          <Field label="Lugar">
            <Input value={form.lugar} onChange={e=>setForm(f=>({...f,lugar:e.target.value}))} placeholder="Campus USIL, Zoom, Por definir..." />
          </Field>
          <Field label="Modalidad">
            <Select value={form.modalidad} onChange={e=>setForm(f=>({...f,modalidad:e.target.value}))}>
              <option>Presencial</option><option>Virtual</option><option>Híbrido</option>
            </Select>
          </Field>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <Field label="Inscritos">
              <Input type="number" value={form.inscritos||''} onChange={e=>setForm(f=>({...f,inscritos:e.target.value}))} placeholder="0" />
            </Field>
            <Field label="Participantes">
              <Input type="number" value={form.participantes||''} onChange={e=>setForm(f=>({...f,participantes:e.target.value}))} placeholder="0" />
            </Field>
          </div>
          <Field label="URL Carpeta (Drive)">
            <Input value={form.url_carpeta||''} onChange={e=>setForm(f=>({...f,url_carpeta:e.target.value}))} placeholder="https://drive.google.com/..." />
          </Field>

          {/* Binder section */}
          <div style={{ borderTop:'1px solid #F3F4F6', paddingTop:14, marginTop:4 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#888', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:10 }}>Binder del evento</div>
            <Field label="Link al binder (Google Drive)">
              <Input value={form.binder_link||''} onChange={e=>setForm(f=>({...f,binder_link:e.target.value}))} placeholder="https://drive.google.com/..." />
            </Field>
            <div style={{ marginBottom:12 }}>
              {form.binder_link ? (
                <a href={form.binder_link} target="_blank" rel="noreferrer"
                  style={{ fontSize:12, color:'#1D4ED8', fontWeight:600, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:5 }}>
                  📁 Abrir Binder
                </a>
              ) : (
                <div>
                  <button type="button" onClick={() => window.open(PLANTILLA_BINDER_URL, '_blank')}
                    style={{ fontSize:12, color:'#1D4ED8', fontWeight:600, background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:6, padding:'7px 12px', cursor:'pointer', fontFamily:'inherit' }}>
                    📄 Crear plantilla Binder
                  </button>
                  <div style={{ fontSize:11, color:'#888', marginTop:5, lineHeight:1.5 }}>
                    Se abrirá una copia editable en Google Docs. Pega el link del documento aquí.
                  </div>
                </div>
              )}
            </div>
            <Field label="Estado del binder">
              <Select value={form.binder_estado||'sin_binder'} onChange={e=>setForm(f=>({...f,binder_estado:e.target.value}))}>
                {Object.entries(BINDER_ESTADOS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
              </Select>
            </Field>
          </div>

          <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:8 }}>
            <Btn variant="secondary" onClick={()=>setModal(null)}>Cancelar</Btn>
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
