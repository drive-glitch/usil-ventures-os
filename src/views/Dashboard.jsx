import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Card, Badge, CountdownChip, KpiBar, formatDate } from '../components/ui'

export default function Dashboard({ setView }) {
  const [programas, setProgramas] = useState([])
  const [hitos, setHitos] = useState([])
  const [kpis, setKpis] = useState([])
  const [startups, setStartups] = useState([])
  const [loading, setLoading] = useState(true)

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

  const today = new Date(); today.setHours(0,0,0,0)
  const daysFrom = d => Math.ceil((new Date(d + 'T00:00:00') - today) / 86400000)
  const alertas = programas.filter(p => p.estado === 'retrasado' || p.estado === 'en_riesgo')
  const proximos = hitos.filter(h => daysFrom(h.fecha) >= 0).slice(0, 6)
  const eventosKpi = kpis.find(k => k.nombre === 'Eventos del ecosistema')

  const stats = [
    { label: 'Programas activos', value: programas.filter(p => p.estado === 'en_ejecucion').length, total: programas.length, color: '#059669' },
    { label: 'En riesgo o retrasados', value: alertas.length, total: programas.length, color: '#DC2626' },
    { label: 'Hitos próximos 30d', value: hitos.filter(h => { const d = daysFrom(h.fecha); return d >= 0 && d <= 30 }).length, color: '#1D4ED8' },
    { label: 'Eventos ejecutados', value: eventosKpi?.actual ?? 0, total: eventosKpi?.meta, color: '#D97706' },
  ]

  const portfolioStats = [
    { label: 'Startups activas', value: startups.filter(s => s.estado === 'activa').length, total: startups.length, color: '#059669' },
    { label: 'Startups USIL', value: startups.filter(s => s.origen === 'USIL').length, total: startups.length, color: '#1D4ED8' },
    { label: 'Con softlanding', value: startups.filter(s => s.softlanding).length, total: startups.length, color: '#7C3AED' },
  ]

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Dashboard ejecutivo</h1>
        <p style={{ fontSize: 13, color: '#888', marginTop: 4, marginBottom: 0 }}>Operación 2026 · Q1 en cierre · Foco en Q2</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #E8E7E2', borderRadius: 10, padding: '16px 18px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
              <span style={{ fontSize: 32, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</span>
              {s.total !== undefined && <span style={{ fontSize: 13, color: '#bbb' }}>/ {s.total}</span>}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Portafolio de startups</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          {portfolioStats.map((s, i) => (
            <div key={i} onClick={() => setView('portafolio')} style={{ background: '#fff', border: '1px solid #E8E7E2', borderRadius: 10, padding: '13px 18px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'border-color 0.15s' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                  <span style={{ fontSize: 26, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</span>
                  {s.total !== undefined && <span style={{ fontSize: 12, color: '#bbb' }}>/ {s.total}</span>}
                </div>
              </div>
              <span style={{ fontSize: 18, color: '#ddd' }}>→</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#991B1B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Alertas · acción requerida</span>
          </div>
          {alertas.length === 0
            ? <p style={{ fontSize: 13, color: '#999', margin: 0 }}>Sin alertas activas.</p>
            : alertas.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #F3F4F6' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{p.nombre}</div>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{p.responsable} · {p.trimestre}</div>
                </div>
                <Badge estado={p.estado} small />
              </div>
            ))}
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3B82F6' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Próximos hitos</span>
          </div>
          {proximos.length === 0
            ? <p style={{ fontSize: 13, color: '#999', margin: 0 }}>No hay hitos próximos.</p>
            : proximos.map(h => (
              <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #F3F4F6' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{h.nombre}</div>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{h.programa?.split(' ').slice(0,3).join(' ')}...</div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-end' }}>
                  <CountdownChip fecha={h.fecha} />
                  <span style={{ fontSize: 11, color: '#bbb' }}>{formatDate(h.fecha)}</span>
                </div>
              </div>
            ))}
        </Card>
      </div>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>KPIs anuales 2026</span>
          <button onClick={() => setView('kpis')} style={{ fontSize: 12, color: '#1D4ED8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Ver todos →</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
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
