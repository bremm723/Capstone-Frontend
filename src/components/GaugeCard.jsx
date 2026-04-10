export default function GaugeCard({ kaloriHariIni = 0, targetKalori }) {
  const target    = targetKalori ? parseInt(targetKalori, 10) : 0
  const hasTarget = target > 0

  const persen    = hasTarget ? Math.min(kaloriHariIni / target, 1) : 0
  const sisa      = hasTarget ? Math.max(target - kaloriHariIni, 0) : 0
  const lebih     = hasTarget && kaloriHariIni > target
  const warnaArc  = lebih ? '#ef4444' : '#7c3aed'

  // Arc: setengah lingkaran dari kiri ke kanan, cx=100 cy=100 r=80
  // Panjang setengah lingkaran = π * r ≈ 251.2
  const R        = 80
  const arcLen   = Math.PI * R          // ~251.2
  const offset   = arcLen - persen * arcLen

  const formatNum = (n) => (n || 0).toLocaleString('id-ID')

  return (
    <div className="card gauge-card">
      <div className="card-title">Kalori Hari Ini</div>

      <div className="gauge-wrap" style={{ width: 200, height: 110, position: 'relative' }}>
        <svg viewBox="0 0 200 110" width="200" height="110" style={{ display: 'block' }}>
          {/* Track abu-abu */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#f0f0f0"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* Arc progress */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={hasTarget ? warnaArc : '#e9d5ff'}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={arcLen}
            strokeDashoffset={hasTarget ? offset : arcLen * 0.15}
            style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease' }}
          />
        </svg>

        {/* Angka di tengah */}
        <div style={{
          position: 'absolute', bottom: 8, left: 0, right: 0,
          textAlign: 'center', lineHeight: 1
        }}>
          <div style={{
            fontSize: 26, fontWeight: 700,
            color: lebih ? '#ef4444' : '#222'
          }}>
            {formatNum(kaloriHariIni)}
          </div>
          <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>kcal</div>
        </div>
      </div>

      <div className="gauge-note">
        {!hasTarget
          ? <span style={{ color: '#a78bfa' }}>Atur target di <strong>Kalkulator</strong> 🎯</span>
          : lebih
            ? <span style={{ color: '#ef4444' }}>⚠️ Melebihi {formatNum(kaloriHariIni - target)} kcal</span>
            : <>Sisa <span>{formatNum(sisa)} kcal</span> dari {formatNum(target)}</>
        }
      </div>
    </div>
  )
}