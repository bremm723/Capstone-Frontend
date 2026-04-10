import { useState, useEffect } from "react"

const TARGET = { karbo: 240, protein: 100, lemak: 80 }

function formatTanggal(date) {
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function MacroCard({ karbo = 0, protein = 0, lemak = 0 }) {
  const [waktuSekarang, setWaktuSekarang] = useState(new Date())

  // 🔥 update tiap 1 MENIT (bukan tiap detik)
  useEffect(() => {
    const interval = setInterval(() => setWaktuSekarang(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  // 🔥 pastikan angka valid
  const safeKarbo = Number(karbo) || 0
  const safeProtein = Number(protein) || 0
  const safeLemak = Number(lemak) || 0

  const makro = [
    { label: 'Karbohidrat', nilai: safeKarbo, target: TARGET.karbo, warna: '#f59e0b' },
    { label: 'Protein', nilai: safeProtein, target: TARGET.protein, warna: '#7c3aed' },
    { label: 'Lemak', nilai: safeLemak, target: TARGET.lemak, warna: '#ec4899' },
  ]

  return (
    <div className="card">
      <div className="card-title">
        Makronutrisi — {formatTanggal(waktuSekarang)}
      </div>

      <div className="macro-row">
        {makro.map((m) => {
          const persen = m.target > 0
            ? Math.min((m.nilai / m.target) * 100, 100)
            : 0

          const lebih = m.nilai > m.target

          return (
            <div className="macro-item" key={m.label}>
              <div className="label">{m.label}</div>

              <div
                className="value"
                style={{ color: lebih ? '#ef4444' : m.warna }}
              >
                {m.nilai}
                <small style={{ fontSize: 12, color: '#aaa' }}>g</small>
              </div>

              <div className="bar-bg">
                <div
                  className="bar-fill"
                  style={{
                    width: `${persen}%`,
                    background: lebih ? '#ef4444' : m.warna,
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
