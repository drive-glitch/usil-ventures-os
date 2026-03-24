import { useState } from 'react'
import Dashboard from './views/Dashboard'
import Programas from './views/Programas'
import Hitos from './views/Hitos'
import KPIs from './views/KPIs'
import Calendario from './views/Calendario'
import Portafolio from './views/Portafolio'

const NAV = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'programas', label: 'Programas' },
  { id: 'hitos', label: 'Hitos' },
  { id: 'kpis', label: 'KPIs' },
  { id: 'calendario', label: 'Calendario' },
  { id: 'portafolio', label: 'Portafolio' },
]

export default function App() {
  const [view, setView] = useState('dashboard')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', 'Helvetica Neue', sans-serif", background: '#F7F6F2', color: '#1a1a18' }}>
      <aside style={{ width: 220, flexShrink: 0, background: '#fff', borderRight: '1px solid #E8E7E2', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflow: 'auto' }}>
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #F0EFE9' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#999', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>USIL Ventures</div>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/USIL_logo.svg/320px-USIL_logo.svg.png" alt="USIL" style={{ width: '100%', maxWidth: 160, height: 'auto', display: 'block' }} onError={e => { e.target.style.display = 'none' }} />
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a18', marginTop: 8 }}>Startup Journey OS</div>
          <div style={{ fontSize: 11, color: '#888' }}>Operación 2026</div>
        </div>
        <nav style={{ flex: 1, padding: '8px 0' }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setView(n.id)} style={{
              display: 'block', width: '100%', textAlign: 'left', padding: '10px 20px', fontSize: 13,
              fontWeight: view === n.id ? 600 : 400, color: view === n.id ? '#1D4ED8' : '#555',
              background: view === n.id ? '#EFF6FF' : 'transparent',
              border: 'none', borderLeft: view === n.id ? '2px solid #1D4ED8' : '2px solid transparent',
              cursor: 'pointer', transition: 'all 0.12s', fontFamily: 'inherit'
            }}>{n.label}</button>
          ))}
        </nav>
        <div style={{ padding: '12px 20px 20px', borderTop: '1px solid #F0EFE9' }}>
          <div style={{ fontSize: 10, color: '#aaa' }}>Hoy</div>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#555' }}>{new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
        </div>
      </aside>
      <main style={{ flex: 1, padding: '36px 40px', maxWidth: 1100, overflowX: 'hidden' }}>
        {view === 'dashboard'  && <Dashboard setView={setView} />}
        {view === 'programas'  && <Programas />}
        {view === 'hitos'      && <Hitos />}
        {view === 'kpis'       && <KPIs />}
        {view === 'calendario' && <Calendario />}
        {view === 'portafolio' && <Portafolio />}
      </main>
    </div>
  )
}
