import { useState } from 'react'
import Overview from './Overview'
import Detalle  from './Detalle'
import Updates  from './Updates'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'updates',  label: 'Updates' },
]

export default function PortafolioModule() {
  const [tab, setTab]                   = useState('overview')
  const [selectedStartup, setSelected]  = useState(null)

  const handleBack    = ()  => setSelected(null)
  const handleDeleted = ()  => { setSelected(null) }

  return (
    <div>
      {/* Sub-nav — solo cuando no hay detalle abierto */}
      {!selectedStartup && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '7px 14px', fontSize: 12, fontWeight: tab === t.id ? 600 : 400,
              color: tab === t.id ? '#1D4ED8' : '#555',
              background: tab === t.id ? '#EFF6FF' : '#F3F4F6',
              border: tab === t.id ? '1px solid #BFDBFE' : '1px solid #E5E7EB',
              borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.1s',
            }}>
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Botón volver desde detalle */}
      {selectedStartup && (
        <button onClick={handleBack} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 13, color: '#555', background: 'none', border: 'none',
          cursor: 'pointer', fontFamily: 'inherit', marginBottom: 20, padding: 0,
        }}>← Volver al portafolio</button>
      )}

      {/* Views */}
      {!selectedStartup && tab === 'overview' && (
        <Overview
          onSelectStartup={setSelected}
          onAddStartup={() => setSelected({ _new: true })}
        />
      )}

      {!selectedStartup && tab === 'updates' && (
        <Updates />
      )}

      {selectedStartup && !selectedStartup._new && (
        <Detalle
          startup={selectedStartup}
          onBack={handleBack}
          onDeleted={handleDeleted}
        />
      )}

      {/* Nueva startup — modal placeholder hasta que Fase 4 agregue el form completo */}
      {selectedStartup?._new && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: '28px 30px', width: 360, textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: '#555', marginTop: 0 }}>Usa el botón <strong>+ Nueva startup</strong> del Overview anterior, o crea directamente desde Supabase mientras llega Fase 4.</p>
            <button onClick={handleBack} style={{ fontSize: 13, padding: '9px 20px', borderRadius: 7, background: '#F3F4F6', border: '1px solid #D1D5DB', cursor: 'pointer', fontFamily: 'inherit' }}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  )
}
