import { useState, useEffect, useCallback } from 'react'
import { PageHeader, StatusBadge, RecencyDot, PrioDot, EmptyState, Btn } from '../../components/ui'
import {
  fetchStartups, computeOverviewKPIs,
  STATUS_OPTIONS, SECTOR_OPTIONS, TIER_OPTIONS, PRIORITY_OPTIONS,
} from '../../lib/portafolio'

const sel = { fontSize: 12, padding: '7px 10px', borderRadius: 7, border: '1px solid #D1D5DB', background: '#fff' }

const KPI_DEFS = kpis => [
  { label: 'Total startups',      value: kpis.total,       color: '#374151', icon: '🚀' },
  { label: 'Activas',             value: kpis.activas,     color: '#059669', icon: '✅' },
  { label: 'En seguimiento',      value: kpis.seguimiento, color: '#1D4ED8', icon: '👁️' },
  { label: 'Necesitan atención',  value: kpis.sinUpdate90, color: '#EF4444', icon: '⚠️' },
  { label: 'Generando ventas',    value: kpis.conRevenue,  color: '#059669', icon: '💰' },
  { label: 'Con inversión',       value: kpis.conFunding,  color: '#D97706', icon: '📈' },
  { label: 'En el exterior',      value: kpis.conSoft,     color: '#7C3AED', icon: '🌍' },
  { label: 'Top portafolio',      value: kpis.topTier,     color: '#1D4ED8', icon: '⭐' },
]

function DonutChart({ segments, size = 100 }) {
  const total = segments.reduce((s, d) => s + d.value, 0)
  if (total === 0) return <div style={{ width: size, height: size, borderRadius: '50%', background: '#F3F4F6', flexShrink: 0 }} />
  let cum = 0
  const parts = segments.map(d => {
    const start = (cum / total) * 100; cum += d.value; const end = (cum / total) * 100
    return `${d.color} ${start.toFixed(1)}% ${end.toFixed(1)}%`
  })
  const inner = Math.round(size * 0.54)
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `conic-gradient(${parts.join(',')})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <div style={{ width: inner, height: inner, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <span style={{ fontSize: Math.round(size * 0.19), fontWeight: 700, lineHeight: 1 }}>{total}</span>
        <span style={{ fontSize: 9, color: '#aaa' }}>total</span>
      </div>
    </div>
  )
}

function HBar({ label, value, max, color }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
        <span style={{ color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{label}</span>
        <span style={{ fontWeight: 600, color, flexShrink: 0, marginLeft: 6 }}>{value}</span>
      </div>
      <div style={{ height: 6, background: '#F0EFE9', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${max > 0 ? (value / max) * 100 : 0}%`, background: color, borderRadius: 3 }} />
      </div>
    </div>
  )
}

// Tooltip wrapper
function Tip({ label, children }) {
  const [show, setShow] = useState(false)
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <span style={{
          position: 'absolute', bottom: '130%', left: '50%', transform: 'translateX(-50%)',
          background: '#1a1a18', color: '#fff', fontSize: 11, fontWeight: 500,
          padding: '5px 9px', borderRadius: 6, whiteSpace: 'nowrap', zIndex: 100,
          pointerEvents: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}>{label}</span>
      )}
    </span>
  )
}

export default function Overview({ onSelectStartup, onAddStartup }) {
  const [startups, setStartups] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [search,   setSearch]   = useState('')

  const [fStatus,   setFStatus]   = useState('')
  const [fSector,   setFSector]   = useState('')
  const [fTier,     setFTier]     = useState('')
  const [fPriority, setFPriority] = useState('')
  const [fFunding,  setFFunding]  = useState('')
  const [fRevenue,  setFRevenue]  = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try   { setStartups(await fetchStartups()) }
    catch { setError('Error cargando startups.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const q = search.toLowerCase()
  const filtered = startups
    .filter(s => !q ||
      s.nombre?.toLowerCase().includes(q) ||
      s.sector?.toLowerCase().includes(q) ||
      s.fundadores?.toLowerCase().includes(q) ||
      s.pais?.toLowerCase().includes(q)
    )
    .filter(s => !fStatus   || s.current_status === fStatus)
    .filter(s => !fSector   || s.sector         === fSector)
    .filter(s => !fTier     || s.portfolio_tier  === fTier)
    .filter(s => !fPriority || s.priority        === fPriority)
    .filter(s => fFunding === '' || (fFunding === 'si' ? s.has_funding  : !s.has_funding))
    .filter(s => fRevenue === '' || (fRevenue === 'si' ? s.has_revenue  : !s.has_revenue))

  const kpis       = computeOverviewKPIs(startups)
  const hasFilters = fStatus || fSector || fTier || fPriority || fFunding || fRevenue || search
  const clearFn    = () => { setFStatus(''); setFSector(''); setFTier(''); setFPriority(''); setFFunding(''); setFRevenue(''); setSearch('') }

  if (loading) return <div style={{ color: '#888', fontSize: 14, padding: '40px 0' }}>Cargando...</div>
  if (error)   return <div style={{ color: '#EF4444', fontSize: 14, padding: '40px 0' }}>{error}</div>

  return (
    <div>
      <PageHeader
        title="Portafolio de Startups"
        subtitle={`${startups.length} startups registradas`}
        action={<Btn onClick={onAddStartup}>+ Nueva startup</Btn>}
      />

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
        {KPI_DEFS(kpis).map(k => (
          <div key={k.label} style={{ background: '#fff', border: '1px solid #E8E7E2', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.4 }}>{k.label}</div>
              <span style={{ fontSize: 16 }}>{k.icon}</span>
            </div>
            <span style={{ fontSize: 30, fontWeight: 700, color: k.color, lineHeight: 1 }}>{k.value}</span>
          </div>
        ))}
      </div>

      {/* Charts row */}
      {filtered.length > 0 && (() => {
        const statusSegs = [
          { label: 'Activas',        value: filtered.filter(s => s.current_status === 'activa').length,         color: '#059669' },
          { label: 'En seguimiento', value: filtered.filter(s => s.current_status === 'en_seguimiento').length,  color: '#3B82F6' },
          { label: 'Adquiridas',     value: filtered.filter(s => s.current_status === 'adquirida').length,      color: '#8B5CF6' },
          { label: 'Cerradas',       value: filtered.filter(s => s.current_status === 'cerrada').length,        color: '#9CA3AF' },
        ].filter(d => d.value > 0)
        const sectorCount = {}
        filtered.forEach(s => { if (s.sector) sectorCount[s.sector] = (sectorCount[s.sector] || 0) + 1 })
        const topSectors   = Object.entries(sectorCount).sort((a,b) => b[1]-a[1]).slice(0,5)
        const maxSector    = topSectors[0]?.[1] || 1
        const sectorColors = ['#1D4ED8','#059669','#D97706','#7C3AED','#EF4444']
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 20 }}>
            <div style={{ background: '#fff', border: '1px solid #E8E7E2', borderRadius: 10, padding: '16px 18px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>Estado del portafolio</div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <DonutChart segments={statusSegs} size={88} />
                <div style={{ flex: 1 }}>
                  {statusSegs.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: '#555', flex: 1 }}>{d.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: d.color }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ background: '#fff', border: '1px solid #E8E7E2', borderRadius: 10, padding: '16px 18px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>Top sectores</div>
              {topSectors.map(([sector, count], i) => (
                <HBar key={sector} label={sector} value={count} max={maxSector} color={sectorColors[i] || '#9CA3AF'} />
              ))}
            </div>
          </div>
        )
      })()}

      {/* Buscador */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <input
          type="search" value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar startup por nombre, sector, fundador o país..."
          style={{ width: '100%', padding: '10px 36px 10px 14px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13, background: '#fff', color: '#1a1a18', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }}
        />
        {search && (
          <button onClick={() => setSearch('')}
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#9CA3AF', lineHeight: 1 }}>×</button>
        )}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={fStatus}   onChange={e => setFStatus(e.target.value)}   style={sel}>
          <option value="">Todos los estados</option>
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={fSector}   onChange={e => setFSector(e.target.value)}   style={sel}>
          <option value="">Todos los sectores</option>
          {SECTOR_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <select value={fTier}     onChange={e => setFTier(e.target.value)}     style={sel}>
          <option value="">Todos los tiers</option>
          {TIER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={fPriority} onChange={e => setFPriority(e.target.value)} style={sel}>
          <option value="">Toda prioridad</option>
          {PRIORITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={fFunding}  onChange={e => setFFunding(e.target.value)}  style={sel}>
          <option value="">Con/sin inversión</option>
          <option value="si">Con inversión</option>
          <option value="no">Sin inversión</option>
        </select>
        <select value={fRevenue}  onChange={e => setFRevenue(e.target.value)}  style={sel}>
          <option value="">Con/sin ventas</option>
          <option value="si">Con ventas</option>
          <option value="no">Sin ventas</option>
        </select>
        {hasFilters && (
          <button onClick={clearFn} style={{ fontSize: 12, color: '#888', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Tabla */}
      {filtered.length === 0
        ? <EmptyState message={hasFilters ? `Sin resultados para "${search || 'estos filtros'}"` : 'Sin startups. Agrega la primera.'} />
        : (
          <div style={{ background: '#fff', border: '1px solid #E8E7E2', borderRadius: 10, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E8E7E2' }}>
                  {['Startup', 'Fundador/a', 'País', 'Status', 'Indicadores', 'Último update', 'Owner UV', 'Prioridad', ''].map(h => (
                    <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id} onClick={() => onSelectStartup(s)}
                    style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : '#FAFAFA', cursor: 'pointer' }}>
                    <td style={{ padding: '11px 14px', fontWeight: 600 }}>
                      <div style={{ marginBottom: 2 }}>{s.nombre}</div>
                      {s.sector && <span style={{ fontSize: 11, background: '#F3F4F6', borderRadius: 5, padding: '2px 7px', fontWeight: 400 }}>{s.sector}</span>}
                    </td>
                    <td style={{ padding: '11px 14px', color: s.fundadores ? '#555' : '#9CA3AF', fontSize: 12 }}>
                      {s.fundadores || 'Sin registrar'}
                    </td>
                    <td style={{ padding: '11px 14px', color: '#555', whiteSpace: 'nowrap' }}>{s.pais || '—'}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <StatusBadge status={s.current_status || s.estado} small />
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {s.has_revenue && (
                          <Tip label="Revenue: Genera ventas">
                            <span style={chip('#D1FAE5', '#065F46')}>R</span>
                          </Tip>
                        )}
                        {s.has_funding && (
                          <Tip label="Funding: Tiene inversión">
                            <span style={chip('#FEF3C7', '#92400E')}>F</span>
                          </Tip>
                        )}
                        {(s.has_softlanding || s.softlanding) && (
                          <Tip label="Softlanding: Operando en el exterior">
                            <span style={chip('#EDE9FE', '#5B21B6')}>S</span>
                          </Tip>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '11px 14px', whiteSpace: 'nowrap', minWidth: 130 }}>
                      <RecencyDot color={s._recency.color} label={s._recency.label} />
                    </td>
                    <td style={{ padding: '11px 14px', color: '#555', whiteSpace: 'nowrap', fontSize: 12 }}>{s.owner_uv || '—'}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <PrioDot prioridad={s.priority || 'media'} />
                        <span style={{ fontSize: 12, color: '#888', textTransform: 'capitalize' }}>{s.priority || 'media'}</span>
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <button onClick={e => { e.stopPropagation(); onSelectStartup(s) }}
                        style={{ fontSize: 11, padding: '4px 8px', borderRadius: 5, border: '1px solid #D1D5DB', background: '#F9FAFB', cursor: 'pointer' }}>
                        Ver →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }

      <div style={{ marginTop: 10, fontSize: 12, color: '#bbb', textAlign: 'right' }}>
        {filtered.length} de {startups.length} startups
        {search && ` · búsqueda: "${search}"`}
      </div>
    </div>
  )
}

const chip = (bg, color) => ({
  fontSize: 10, fontWeight: 700, padding: '2px 6px',
  borderRadius: 4, background: bg, color, display: 'inline-block', cursor: 'default',
})
