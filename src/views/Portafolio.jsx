export default function Portafolio() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16, textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: 56 }}>⛏️</div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a18', margin: 0 }}>Próximamente</h2>
      <p style={{ fontSize: 14, color: '#888', maxWidth: 320, margin: 0, lineHeight: 1.6 }}>
        Estamos trabajando en el módulo de Portafolio. Pronto podrás gestionar todas tus startups desde aquí.
      </p>
      <div style={{ marginTop: 8, background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 8, padding: '10px 18px', fontSize: 13, color: '#92400E', fontWeight: 600 }}>
        🚧 En construcción
      </div>
    </div>
  )
}
