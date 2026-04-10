import { useEffect, useState } from 'react'
import api from '../api.js'

export default function AirTracker() {
  const [terisi,  setTerisi]  = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/tracking/air')
      .then(res => setTerisi(res.data.jumlah ?? 0))
      .catch(() => {})
  }, [])

  const toggle = async (i) => {
    // Hitung nilai baru: klik gelas yang sudah terisi → kurangi, belum terisi → tambah
    const jumlahBaru = i < terisi ? i : i + 1
    const jumlahSebelum = terisi

    // Optimistic update
    setTerisi(jumlahBaru)
    setLoading(true)
    try {
      await api.put('/tracking/air', { jumlah: jumlahBaru })
    } catch (err) {
      // Rollback jika gagal
      console.error('Gagal menyimpan asupan air:', err)
      setTerisi(jumlahSebelum)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card air-tracker-card">
      <div className="wtitle-row">
        <div className="card-title">Asupan Air</div>
        <div className="wcount">
          <span style={{ color: '#3b82f6', fontSize: 16 }}>{terisi}</span>/8 gelas
        </div>
      </div>
      <div className="cups-row">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className={i < terisi ? 'cup filled' : 'cup'}
            onClick={() => !loading && toggle(i)}
            style={{ cursor: loading ? 'wait' : 'pointer' }}
          />
        ))}
      </div>
      <div className="air-progress-bar">
        <div className="air-progress-fill" style={{ width: `${(terisi / 8) * 100}%` }} />
      </div>
      <div className="air-progress-label">{Math.round((terisi / 8) * 100)}% target harian</div>
    </div>
  )
}