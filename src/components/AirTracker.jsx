import { useEffect, useState } from 'react'
import api from '../api.js'

export default function AirTracker() {
  const [terisi, setTerisi] = useState(0)
  const [loading, setLoading] = useState(false)

  // 🔥 Load awal
  useEffect(() => {
    api.get('/tracking/air')
      .then(res => {
        const jumlah = Number(res.data?.jumlah) || 0
        setTerisi(Math.min(jumlah, 8)) // batas max 8
      })
      .catch(err => {
        console.error('Gagal load air:', err)
        setTerisi(0)
      })
  }, [])

  const toggle = async (i) => {
    if (loading) return

    // 🔥 Hitung aman
    let jumlahBaru
    if (i < terisi) {
      jumlahBaru = i
    } else {
      jumlahBaru = i + 1
    }

    // 🔥 Clamp 0 - 8
    jumlahBaru = Math.max(0, Math.min(jumlahBaru, 8))

    const jumlahSebelum = terisi

    // Optimistic update
    setTerisi(jumlahBaru)
    setLoading(true)

    try {
      await api.put('/tracking/air', { jumlah: jumlahBaru })
    } catch (err) {
      console.error('Gagal menyimpan asupan air:', err)
      setTerisi(jumlahSebelum) // rollback
    } finally {
      setLoading(false)
    }
  }

  const persen = Math.round((terisi / 8) * 100)

  return (
    <div className="card air-tracker-card">
      <div className="wtitle-row">
        <div className="card-title">Asupan Air</div>
        <div className="wcount">
          <span style={{ color: '#3b82f6', fontSize: 16 }}>
            {terisi}
          </span>/8 gelas
        </div>
      </div>

      <div className="cups-row">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className={i < terisi ? 'cup filled' : 'cup'}
            onClick={() => toggle(i)}
            style={{
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          />
        ))}
      </div>

      <div className="air-progress-bar">
        <div
          className="air-progress-fill"
          style={{ width: `${persen}%` }}
        />
      </div>

      <div className="air-progress-label">
        {persen}% target harian
      </div>
    </div>
  )
}