export default function GaugeCard({ kaloriHariIni = 0, targetKalori }) {
  const target    = targetKalori ? parseInt(targetKalori, 10) : 0
  const hasTarget = target > 0
  const persen    = hasTarget ? Math.min(kaloriHariIni / target, 1) : 0
  const sisa      = hasTarget ? Math.max(target - kaloriHariIni, 0) : 0
  const lebih     = hasTarget && kaloriHariIni > target
  const warnaArc  = lebih ? '#ef4444' : '#7c3aed'

  // Setengah lingkaran: cx=100, cy=100, r=70
  // Start = (30, 100), End = (170, 100)
  // arcLen = π * 70 ≈ 219.91
  const arcLen = Math.PI * 70
  const offset = arcLen - persen * arcLen

  const fmt = (n) => (n || 0).toLocaleString('id-ID')

  return (
    <div className="card gauge-card">
      <div className="card-title">Kalori Hari Ini</div>

      <div style={{ position: 'relative', width: 200, height: 115 }}>
        <svg viewBox="0 0 200 115" width="200" height="115">
          {/* Track abu-abu */}
          <path d="M 30 100 A 70 70 0 0 1 170 100"
            fill="none" stroke="#f0f0f0" strokeWidth="14" strokeLinecap="round" />
          {/* Arc progress */}
          <path d="M 30 100 A 70 70 0 0 1 170 100"
            fill="none" stroke={warnaArc} strokeWidth="14" strokeLinecap="round"
            strokeDasharray={arcLen} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>

        <div style={{
          position: 'absolute', bottom: 10,
          left: 0, right: 0, textAlign: 'center'
        }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: lebih ? '#ef4444' : '#222', lineHeight: 1 }}>
            {fmt(kaloriHariIni)}
          </div>
          <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>kcal</div>
        </div>
      </div>

      <div className="gauge-note">
        {!hasTarget
          ? <span style={{ color: '#a78bfa' }}>Atur target di <strong>Kalkulator</strong> 🎯</span>
          : lebih
            ? <span style={{ color: '#ef4444' }}>⚠️ Melebihi {fmt(kaloriHariIni - target)} kcal</span>
            : <>Sisa <span>{fmt(sisa)} kcal</span> dari {fmt(target)}</>
        }
      </div>
    </div>
  )
}