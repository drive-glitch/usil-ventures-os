import { useState, useEffect } from 'react'
import Dashboard from './views/Dashboard'
import Programas from './views/Programas'
import Hitos from './views/Hitos'
import KPIs from './views/KPIs'
import Calendario from './views/Calendario'
import Portafolio from './views/Portafolio'

const NAV = [
  { id: 'dashboard',  label: 'Inicio',     icon: '🏠' },
  { id: 'programas',  label: 'Programas',  icon: '📋' },
  { id: 'hitos',      label: 'Hitos',      icon: '🎯' },
  { id: 'kpis',       label: 'Métricas',   icon: '📊' },
  { id: 'calendario', label: 'Calendario', icon: '📅' },
  { id: 'portafolio', label: 'Portafolio', icon: '🚀' },
]

function GlobalSearch({ onNavigate, onClose }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])

  useEffect(() => {
    if (!q.trim()) { setResults([]); return }
    const lq = q.toLowerCase()
    const r = []
    try {
      const progs = JSON.parse(localStorage.getItem('usil_programas') || '[]')
      progs.filter(p => p.nombre?.toLowerCase().includes(lq) || p.responsable?.toLowerCase().includes(lq))
        .slice(0,3).forEach(p => r.push({ label: p.nombre, sub: 'Programa', view: 'programas', icon: '📋' }))
      const hitos = JSON.parse(localStorage.getItem('usil_hitos') || '[]')
      hitos.filter(h => h.nombre?.toLowerCase().includes(lq) || h.programa?.toLowerCase().includes(lq))
        .slice(0,3).forEach(h => r.push({ label: h.nombre, sub: h.programa || 'Hito', view: 'hitos', icon: '🎯' }))
      const kpis = JSON.parse(localStorage.getItem('usil_kpis') || '[]')
      kpis.filter(k => k.nombre?.toLowerCase().includes(lq) || k.responsable?.toLowerCase().includes(lq))
        .slice(0,3).forEach(k => r.push({ label: k.nombre, sub: k.responsable || 'KPI', view: 'kpis', icon: '📊' }))
      const acts = JSON.parse(localStorage.getItem('usil_actividades') || '[]')
      acts.filter(a => a.nombre?.toLowerCase().includes(lq) || a.programa?.toLowerCase().includes(lq))
        .slice(0,3).forEach(a => r.push({ label: a.nombre, sub: a.fecha || 'Actividad', view: 'calendario', icon: '📅' }))
    } catch {}
    setResults(r.slice(0, 8))
  }, [q])

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:2000, display:'flex', alignItems:'flex-start', justifyContent:'center', paddingTop:80 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background:'#fff', borderRadius:12, width:'100%', maxWidth:520, boxShadow:'0 20px 60px rgba(0,0,0,0.25)', overflow:'hidden' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 16px', borderBottom:'1px solid #F3F4F6' }}>
          <span style={{ fontSize:16, color:'#888' }}>🔍</span>
          <input autoFocus value={q} onChange={e=>setQ(e.target.value)}
            placeholder="Buscar programas, hitos, KPIs, actividades..."
            style={{ flex:1, border:'none', outline:'none', fontSize:14, fontFamily:'inherit', color:'#1a1a18' }} />
          <span style={{ fontSize:11, color:'#bbb', background:'#F3F4F6', borderRadius:4, padding:'2px 6px' }}>Esc</span>
        </div>
        {results.length > 0 ? (
          <div style={{ maxHeight:320, overflowY:'auto' }}>
            {results.map((r, i) => (
              <div key={i} onClick={() => { onNavigate(r.view); onClose() }}
                style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', cursor:'pointer', borderBottom:'1px solid #F9FAFB' }}
                onMouseEnter={e=>e.currentTarget.style.background='#F9FAFB'}
                onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
                <span style={{ fontSize:16 }}>{r.icon}</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:600 }}>{r.label}</div>
                  <div style={{ fontSize:11, color:'#888' }}>{r.sub}</div>
                </div>
              </div>
            ))}
          </div>
        ) : q ? (
          <div style={{ padding:'24px 16px', textAlign:'center', color:'#bbb', fontSize:13 }}>Sin resultados para "{q}"</div>
        ) : (
          <div style={{ padding:'16px', color:'#bbb', fontSize:12 }}>Empieza a escribir para buscar...</div>
        )}
      </div>
    </div>
  )
}

export default function App() {
  const [view, setView]         = useState('dashboard')
  const [viewParams, setViewParams] = useState({})
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handle)
    return () => window.removeEventListener('resize', handle)
  }, [])

  useEffect(() => {
    const h = e => { if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(s => !s) } }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  const navigate = (id, params = {}) => {
    setView(id)
    setViewParams(params)
    setMenuOpen(false)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter','Helvetica Neue',sans-serif", background: '#F7F6F2', color: '#1a1a18' }}>

      {searchOpen && <GlobalSearch onNavigate={navigate} onClose={() => setSearchOpen(false)} />}

      {/* Mobile backdrop */}
      {isMobile && menuOpen && (
        <div onClick={() => setMenuOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 998 }} />
      )}

      {/* Sidebar */}
      <aside style={{
        width: 220, flexShrink: 0, background: '#fff', borderRight: '1px solid #E8E7E2',
        display: 'flex', flexDirection: 'column',
        position: isMobile ? 'fixed' : 'sticky',
        top: 0, height: '100vh', overflow: 'auto', zIndex: 999,
        transform: isMobile ? (menuOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
        transition: 'transform 0.22s ease',
      }}>
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #F0EFE9' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#999', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>USIL Ventures</div>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/USIL_logo.svg/320px-USIL_logo.svg.png" alt="USIL"
            style={{ width: '100%', maxWidth: 160, height: 'auto', display: 'block' }}
            onError={e => { e.target.style.display = 'none' }} />
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a18', marginTop: 8 }}>Startup Journey OS</div>
          <div style={{ fontSize: 11, color: '#888' }}>Operación 2026</div>
        </div>

        <nav style={{ flex: 1, padding: '8px 0' }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => navigate(n.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', textAlign: 'left', padding: '11px 20px', fontSize: 13,
              fontWeight: view === n.id ? 600 : 400,
              color: view === n.id ? '#1D4ED8' : '#555',
              background: view === n.id ? '#EFF6FF' : 'transparent',
              border: 'none', borderLeft: view === n.id ? '2px solid #1D4ED8' : '2px solid transparent',
              cursor: 'pointer', transition: 'all 0.12s', fontFamily: 'inherit',
            }}>
              <span style={{ fontSize: 15 }}>{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '8px 12px', borderTop: '1px solid #F0EFE9' }}>
          <button onClick={() => setSearchOpen(true)}
            style={{ width:'100%', display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:8, border:'1px solid #E8E7E2', background:'#F9FAFB', cursor:'pointer', fontFamily:'inherit', fontSize:12, color:'#888' }}>
            <span>🔍</span>
            <span style={{ flex:1, textAlign:'left' }}>Buscar...</span>
            <span style={{ fontSize:10, background:'#E8E7E2', borderRadius:3, padding:'1px 5px' }}>⌘K</span>
          </button>
        </div>
        <div style={{ padding: '8px 20px 20px' }}>
          <div style={{ fontSize: 10, color: '#aaa' }}>Hoy</div>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#555' }}>
            {new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      {isMobile && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: 52,
          background: '#fff', borderBottom: '1px solid #E8E7E2',
          display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10, zIndex: 997,
        }}>
          <button onClick={() => setMenuOpen(true)}
            style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#374151', padding: 4, lineHeight: 1 }}>
            ☰
          </button>
          <span style={{ fontSize: 14, fontWeight: 700 }}>
            {NAV.find(n => n.id === view)?.icon} {NAV.find(n => n.id === view)?.label}
          </span>
        </div>
      )}

      {/* Main content */}
      <main style={{
        flex: 1,
        padding: isMobile ? '68px 16px 32px' : '36px 40px',
        maxWidth: 1100, overflowX: 'hidden', width: '100%',
      }}>
        {view === 'dashboard'  && <Dashboard navigate={navigate} />}
        {view === 'programas'  && <Programas initialFilter={viewParams} />}
        {view === 'hitos'      && <Hitos initialFilter={viewParams} />}
        {view === 'kpis'       && <KPIs />}
        {view === 'calendario' && <Calendario initialFilter={viewParams} />}
        {view === 'portafolio' && <Portafolio />}
      </main>
    </div>
  )
}
