import { useState, useEffect, useCallback } from 'react'
import { PageHeader, StatusBadge, RecencyDot, PrioDot, EmptyState, Btn } from '../../components/ui'
import {
  fetchStartups, computeOverviewKPIs,
  STATUS_OPTIONS, SECTOR_OPTIONS, TIER_OPTIONS, PRIORITY_OPTIONS,
} from '../../lib/portafolio'

const sel = { fontSize: 12, padding: '7px 10px', borderRadius: 7, border: '1px solid #D1D5DB', background: '#fff' }

const KPI_DEFS = kpis => [
  { label: 'Total startups',  value: kpis.total,       color: '#374151' },
  { label: 'Activas',         value: kpis.activas,     color: '#059669' },
  { label: 'En seguimiento',  value: kpis.seguimiento, color: '#1D4ED8' },
  { label: 'Sin update +90d', value: kpis.sinUpdate90, color: '#EF4444' },
  { label: 'Con revenue',     value: kpis.conRevenue,  color: '#059669' },
  { label: 'Con funding',     value: kpis.conFunding,  color: '#D97706' },
  { label: 'Softlanding',     value: kpis.conSoft,     color: '#7C3AED' },
  { label: 'Top tier',        value: kpis.topTier,     color: '#1D4ED8' },
]

export default function Overview({ onSelectStartup, onAddStartup }) {
  const [startups, setStartups] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

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

  const filtered = startups
    .filter(s => !fStatus   || s.current_status === fStatus)
    .filter(s => !fSector   || s.sector         === fSector)
    .filter(s => !fTier     || s.portfolio_tier  === fTier)
    .filter(s => !fPriority || s.priority        === fPriority)
    .filter(s => fFunding === '' || (fFunding === 'si' ? s.has_funding  : !s.has_funding))
    .filter(s => fRevenue === '' || (fRevenue === 'si' ? s.has_revenue  : !s.has_revenue))

  const kpis       = computeOverviewKPIs(startups)
  const hasFilters = fStatus || fSector || fTier || fPriority || fFunding || fRevenue
  const clearFn    = () => { setFStatus(''); setFSector(''); setFTier(''); setFPriority(''); setFFunding(''); setFRevenue('') }

  if (loading) return <div style={{ color: '#888', fontSize: 14, padding: '40px 0' }}>Cargando...</div>
  if (error)   return <div style={{ color: '#EF4444', fontSize: 14, padding: '40px 0' }}>{error}</div>

  return (
    <div>
      <PageHeader
        title="Portafolio de Startups"
        subtitle={`${startups.length} startups registradas`}
        action={<Btn onClick={onAddStartup}>+ Nueva startup</Btn>}
      />

      {/* KPI cards — mismo patrón que Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {KPI_DEFS(kpis).map(k => (
          <div key={k.label} style={{ background: '#fff', border: '1px solid #E8E7E2', borderRadius: 10, padding: '16px 18px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#888', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
              <span style={{ fontSize: 32, fontWeight: 700, color: k.color, lineHeight: 1 }}>{k.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros — mismo patrón que Programas / Hitos */}
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
          <option value="">Con/sin funding</option>
          <option value="si">Con funding</option>
          <option value="no">Sin funding</option>
        </select>
        <select value={fRevenue}  onChange={e => setFRevenue(e.target.value)}  style={sel}>
          <option value="">Con/sin revenue</option>
          <option value="si">Con revenue</option>
          <option value="no">Sin revenue</option>
        </select>
        {hasFilters && (
          <button onClick={clearFn} style={{ fontSize: 12, color: '#888', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Tabla — mismo patrón que Hitos */}
      {filtered.length === 0
        ? <EmptyState message={hasFilters ? 'Sin resultados con estos filtros.' : 'Sin startups. Agrega la primera.'} />
        : (
          <div style={{ background: '#fff', border: '1px solid #E8E7E2', borderRadius: 10, overflow: 'hidden' }}>
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
                  <tr key={s.id}
                    onClick={() => onSelectStartup(s)}
                    style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : '#FAFAFA', cursor: 'pointer' }}
                  >
                    <td style={{ padding: '11px 14px', fontWeight: 600 }}>
                      <div style={{ marginBottom: 2 }}>{s.nombre}</div>
                      {s.sector && <span style={{ fontSize: 11, background: '#F3F4F6', borderRadius: 5, padding: '2px 7px', fontWeight: 400 }}>{s.sector}</span>}
                    </td>
                    <td style={{ padding: '11px 14px', color: '#555', fontSize: 12 }}>{s.fundadores || '—'}</td>
                    <td style={{ padding: '11px 14px', color: '#555', whiteSpace: 'nowrap' }}>{s.pais || '—'}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <StatusBadge status={s.current_status || s.estado} small />
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {s.has_revenue                          && <span style={chip('#D1FAE5', '#065F46')}>R</span>}
                        {s.has_funding                          && <span style={chip('#FEF3C7', '#92400E')}>F</span>}
                        {(s.has_softlanding || s.softlanding)  && <span style={chip('#EDE9FE', '#5B21B6')}>S</span>}
                      </div>
                    </td>
                    <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' }}>
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
                      <button
                        onClick={e => { e.stopPropagation(); onSelectStartup(s) }}
                        style={{ fontSize: 11, padding: '4px 8px', borderRadius: 5, border: '1px solid #D1D5DB', background: '#F9FAFB', cursor: 'pointer' }}
                      >
                        Ver →
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} style={{ padding: 32, textAlign: 'center', color: '#bbb', fontSize: 13 }}>Sin resultados.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )
      }

      <div style={{ marginTop: 10, fontSize: 12, color: '#bbb', textAlign: 'right' }}>
        {filtered.length} de {startups.length} startups
      </div>
    </div>
  )
}

const chip = (bg, color) => ({
  fontSize: 10, fontWeight: 700, padding: '2px 6px',
  borderRadius: 4, background: bg, color, display: 'inline-block',
})
