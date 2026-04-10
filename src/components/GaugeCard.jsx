export default function GaugeCard({ kaloriHariIni = 0, targetKalori }) {
  const target   = targetKalori || 0
  const hasTarget = target > 0

  // Jika belum ada target, tampilkan arc penuh sebagai "display only"
  const persen   = hasTarget ? Math.min(kaloriHariIni / target, 1) : 1
  const sisa     = hasTarget ? Math.max(target - kaloriHariIni, 0) : 0
  const lebih    = hasTarget && kaloriHariIni > target
  const warnaArc = !hasTarget ? '#d8b4fe' : lebih ? '#ef4444' : '#7c3aed'

  const totalArc = 173
  const offset   = totalArc - persen * totalArc

  const formatNum = (n) => (n || 0).toLocaleString('id-ID')

  return (
    <div className="card gauge-card">
      <div className="card-title">Kalori Hari Ini</div>
      <div className="gauge-wrap">
        <svg viewBox="0 0 130 75" overflow="visible">
          <path d="M 10 65 A 55 55 0 0 1 120 65"
            fill="none" stroke="#f0f0f0" strokeWidth="10" strokeLinecap="round" />
          <path d="M 10 65 A 55 55 0 0 1 120 65"
            fill="none" stroke={warnaArc} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={totalArc} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.4s ease' }}
          />
        </svg>
        <div className="gauge-center">
          <div className="big" style={{ color: lebih ? '#ef4444' : '#222' }}>
            {formatNum(kaloriHariIni)}
          </div>
          <div className="small">kcal</div>
        </div>
      </div>

      {!hasTarget
        ? <div className="gauge-note" style={{ color: '#a78bfa', fontSize: 12, textAlign: 'center' }}>
            Atur target di <strong>Kalkulator</strong> 🎯
          </div>
        : lebih
          ? <div className="gauge-note" style={{ color: '#ef4444' }}>
              ⚠️ Melebihi <span style={{ color: '#ef4444' }}>{formatNum(kaloriHariIni - target)} kcal</span>
            </div>
          : <div className="gauge-note">
              Sisa <span>{formatNum(sisa)} kcal</span> dari {formatNum(target)}
            </div>
      }
    </div>
  )
}