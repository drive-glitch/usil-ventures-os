import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Card, Badge, CountdownChip, KpiBar, formatDate } from '../components/ui'

function DonutChart({ segments, size = 110 }) {
  const total = segments.reduce((s, d) => s + d.value, 0)
  if (total === 0) return <div style={{ width: size, height: size, borderRadius: '50%', background: '#F3F4F6', flexShrink: 0 }} />
  let cum = 0
  const parts = segments.map(d => {
    const start = (cum / total) * 100
    cum += d.value
    const end = (cum / total) * 100
    return `${d.color} ${start.toFixed(1)}% ${end.toFixed(1)}%`
  })
  const inner = Math.round(size * 0.52)
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `conic-gradient(${parts.join(',')})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <div style={{ width: inner, height: inner, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <span style={{ fontSize: Math.round(size * 0.2), fontWeight: 700, color: '#1a1a18', lineHeight: 1 }}>{total}</span>
        <span style={{ fontSize: 9, color: '#aaa' }}>startups</span>
      </div>
    </div>
  )
}

function MiniBar({ label, value, total, color }) {
  const pct = total > 0 ? (value / total) * 100 : 0
  return (
    <div style={{ marginBottom: 7 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
        <span style={{ color: '#555' }}>{label}</span>
        <span style={{ fontWeight: 600, color }}>{value}</span>
      </div>
      <div style={{ height: 5, background: '#F0EFE9', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3 }} />
      </div>
    </div>
  )
}

export default function Dashboard({ navigate }) {
  const [programas, setProgramas] = useState([])
  const [hitos, setHitos]         = useState([])
  const [kpis, setKpis]           = useState([])
  const [startups, setStartups]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [hoverCard, setHoverCard] = useState(null)

  useEffect(() => {
    async function load() {
      const [{ data: p }, { data: h }, { data: k }, { data: s }] = await Promise.all([
        supabase.from('programas').select('*'),
        supabase.from('hitos').select('*').order('fecha'),
        supabase.from('kpis').select('*'),
        supabase.from('startups').select('*'),
      ])
      setProgramas(p || [])
      setHitos(h || [])
      setKpis(k || [])
      setStartups(s || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div style={{ color: '#888', fontSize: 14, padding: '40px 0' }}>Cargando...</div>

  const today    = new Date(); today.setHours(0,0,0,0)
  const daysFrom = d => Math.ceil((new Date(d + 'T00:00:00') - today) / 86400000)
  const alertas  = programas.filter(p => p.estado === 'retrasado' || p.estado === 'en_riesgo')
  const proximos = hitos.filter(h => daysFrom(h.fecha) >= 0).slice(0, 6)
  const eventosKpi = kpis.find(k => k.nombre === 'Eventos del ecosistema')

  const stats = [
    {
      label: 'Programas activos', value: programas.filter(p => p.estado === 'en_ejecucion').length,
      total: programas.length, color: '#059669', icon: '📋',
      onClick: () => navigate('programas', { estado: 'en_ejecucion' }),
    },
    {
      label: 'Necesitan atención', value: alertas.length,
      total: programas.length, color: '#DC2626', icon: '⚠️',
      onClick: () => navigate('programas', { estado: 'retrasado' }),
    },
    {
      label: 'Hitos próximos 30d',
      value: hitos.filter(h => { const d = daysFrom(h.fecha); return d >= 0 && d <= 30 }).length,
      color: '#1D4ED8', icon: '🎯',
      onClick: () => navigate('hitos', {}),
    },
    {
      label: 'Eventos ejecutados', value: eventosKpi?.actual ?? 0,
      total: eventosKpi?.meta, color: '#D97706', icon: '🎪',
      onClick: () => navigate('calendario', { vistaEventos: true }),
    },
  ]

  const portActivas     = startups.filter(s => s.current_status === 'activa' || s.estado === 'activa').length
  const portSeguimiento = startups.filter(s => s.current_status === 'en_seguimiento').length
  const portAlumni      = startups.filter(s => s.current_status === 'adquirida' || s.current_status === 'cerrada' || s.portfolio_tier === 'alumni').length
  const portOtros       = Math.max(0, startups.length - portActivas - portSeguimiento - portAlumni)

  const donutData = [
    { label: 'Activas',          value: portActivas,     color: '#059669' },
    { label: 'En seguimiento',   value: portSeguimiento, color: '#3B82F6' },
    { label: 'Alumni / salidas', value: portAlumni,      color: '#8B5CF6' },
    { label: 'Otros',            value: portOtros,       color: '#E5E7EB' },
  ].filter(d => d.value > 0)

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Dashboard ejecutivo</h1>
        <p style={{ fontSize: 13, color: '#888', marginTop: 4, marginBottom: 0 }}>Operación 2026 · Q1 en cierre · Foco en Q2</p>
      </div>

      {/* KPI cards — clickeables */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 18 }}>
        {stats.map((s, i) => (
          <div key={i} onClick={s.onClick}
            onMouseEnter={() => setHoverCard(i)}
            onMouseLeave={() => setHoverCard(null)}
            style={{
              background: '#fff', border: '1px solid #E8E7E2', borderRadius: 10, padding: '16px 18px',
              cursor: 'pointer',
              boxShadow: hoverCard === i ? '0 2px 10px rgba(0,0,0,0.08)' : 'none',
              transform: hoverCard === i ? 'translateY(-2px)' : 'none',
              transition: 'all 0.15s ease',
            }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.4 }}>{s.label}</div>
              <span style={{ fontSize: 18 }}>{s.icon}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
              <span style={{ fontSize: 32, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</span>
              {s.total !== undefined && <span style={{ fontSize: 13, color: '#bbb' }}>/ {s.total}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Portfolio donut */}
      <div style={{ background: '#fff', border: '1px solid #E8E7E2', borderRadius: 10, padding: '18px 20px', marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🚀 Portafolio de startups</span>
          <button onClick={() => navigate('portafolio')} style={{ fontSize: 12, color: '#1D4ED8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Ver todas →</button>
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <DonutChart segments={donutData} size={110} />
          <div style={{ flex: 1, minWidth: 160 }}>
            {donutData.map((d, i) => (
              <MiniBar key={i} label={d.label} value={d.value} total={startups.length} color={d.color} />
            ))}
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #F3F4F6', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: '#555' }}>💰 <strong style={{ color: '#059669' }}>{startups.filter(s => s.has_revenue).length}</strong> generando ventas</span>
              <span style={{ fontSize: 11, color: '#555' }}>📈 <strong style={{ color: '#D97706' }}>{startups.filter(s => s.has_funding).length}</strong> con inversión</span>
              <span style={{ fontSize: 11, color: '#555' }}>🌍 <strong style={{ color: '#7C3AED' }}>{startups.filter(s => s.has_softlanding || s.softlanding).length}</strong> en el exterior</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas + Hitos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, marginBottom: 18 }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 14 }}>⚠️</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#991B1B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Alertas · acción requerida</span>
          </div>
          {alertas.length === 0
            ? <p style={{ fontSize: 13, color: '#999', margin: 0 }}>Sin alertas activas.</p>
            : alertas.map(p => (
              <div key={p.id} onClick={() => navigate('programas', { estado: p.estado })}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #F3F4F6', cursor: 'pointer', borderRadius: 4 }}
                onMouseEnter={e => e.currentTarget.style.background = '#FFF5F5'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{p.nombre}</div>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{p.responsable} · {p.trimestre}</div>
                </div>
                <Badge estado={p.estado} small />
              </div>
            ))
          }
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 14 }}>🎯</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Próximos hitos</span>
          </div>
          {proximos.length === 0
            ? <p style={{ fontSize: 13, color: '#999', margin: 0 }}>No hay hitos próximos.</p>
            : proximos.map(h => (
              <div key={h.id} onClick={() => navigate('hitos', {})}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #F3F4F6', cursor: 'pointer', borderRadius: 4 }}
                onMouseEnter={e => e.currentTarget.style.background = '#F0F9FF'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{h.nombre}</div>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{h.programa?.split(' ').slice(0,3).join(' ')}...</div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-end' }}>
                  <CountdownChip fecha={h.fecha} />
                  <span style={{ fontSize: 11, color: '#bbb' }}>{formatDate(h.fecha)}</span>
                </div>
              </div>
            ))
          }
        </Card>
      </div>

      {/* KPI bars */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>📊 Métricas anuales 2026</span>
          <button onClick={() => navigate('kpis')} style={{ fontSize: 12, color: '#1D4ED8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Ver todas →</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {kpis.map(k => (
            <div key={k.id}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: '#333' }}>{k.nombre}</div>
              <KpiBar actual={k.actual} meta={k.meta} estado={k.estado} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
