import { useState, useRef, useEffect } from 'react'
import HalamanLogin      from './components/HalamanLogin.jsx'
import HalamanRegister   from './components/HalamanRegister.jsx'
import Sidebar           from './components/Sidebar.jsx'
import Topbar            from './components/Topbar.jsx'
import GaugeCard         from './components/GaugeCard.jsx'
import MacroCard         from './components/MacroCard.jsx'
import CatatanMakanan    from './components/CatatanMakanan.jsx'
import RiwayatKalori     from './components/RiwayatKalori.jsx'
import Rekomendasi       from './components/Rekomendasi.jsx'
import AirTracker        from './components/AirTracker.jsx'
import HalamanProfil     from './components/HalamanProfil.jsx'
import KalkulatorKalori  from './components/KalkulatorKalori.jsx'
import HalamanSetelan    from './components/HalamanSetelan.jsx'
import JendelaNotifikasi from './components/JendelaNotifikasi.jsx'
import api from './api.js'

const HARI_MAP = { Senin:0, Selasa:1, Rabu:2, Kamis:3, Jumat:4, Sabtu:5, Minggu:6 }

export default function App() {
  const [authPage, setAuthPage]       = useState('login')
  const [loadingAuth, setLoadingAuth] = useState(true)
  const [user,     setUser]           = useState(null)
  const [halaman,  setHalaman]        = useState('dashboard')
  const [tema,     setTema]           = useState('light')
  const [showNotif,setShowNotif]      = useState(false)

  const [catatanItems, setCatatanItems] = useState([])
  const nextId = useRef(1)

  const [targetHarian,   setTargetHarian]   = useState(null)
  const [targetMingguan, setTargetMingguan] = useState(Array(7).fill(null))

  // ─── Auth handlers ────────────────────────────────────────────────────────
  const handleLogin = (u) => {
    setUser(u)
    setAuthPage(null)
  }

  const handleRegister = (u) => {
    setUser(u)
    setAuthPage(null)
  }

  const handleUpdateUser = (data) => setUser(prev => ({ ...prev, ...data }))

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setAuthPage('login')
    setHalaman('dashboard')
    setCatatanItems([])
    setTargetHarian(null)
    setTargetMingguan(Array(7).fill(null))
  }

  const toggleTema = () => {
    setTema(t => t === 'light' ? 'dark' : 'light')
    document.body.classList.toggle('dark-mode')
  }

  // ─── CRUD handlers for CatatanMakanan (with backend sync) ─────────────────
  const tambahMakanan = async (data) => {
    const tempId = `temp-${nextId.current++}`
    setCatatanItems(prev => [...prev, { id: tempId, ...data }])

    try {
      const res = await api.post('/tracking', {
        nama:    data.nama,
        porsi:   data.porsi,
        waktu:   data.waktu,
        kalori:  data.kalori,
        karbo:   data.karbo,
        protein: data.protein,
        lemak:   data.lemak,
        quantity: 1,
      })
      setCatatanItems(prev =>
        prev.map(it => it.id === tempId
          ? { ...it, id: res.data.id, _backendId: res.data.id }
          : it
        )
      )
    } catch (err) {
      console.error('Gagal menyimpan makanan:', err)
      setCatatanItems(prev => prev.filter(it => it.id !== tempId))
    }
  }

  const updateItem = async (id, data) => {
    setCatatanItems(prev => prev.map(it => it.id === id ? { ...it, ...data } : it))
    try {
      await api.put(`/tracking/${id}`, {
        nama:    data.nama,
        porsi:   data.porsi,
        waktu:   data.waktu,
        kalori:  data.kalori,
        karbo:   data.karbo,
        protein: data.protein,
        lemak:   data.lemak,
      })
    } catch (err) {
      console.error('Gagal mengupdate makanan:', err)
    }
  }

  const hapusItem = async (id) => {
    setCatatanItems(prev => prev.filter(it => it.id !== id))
    try {
      await api.delete(`/tracking/${id}`)
    } catch (err) {
      console.error('Gagal menghapus makanan:', err)
    }
  }

  // ─── BUG FIX #1: useEffect diperbaiki — dependency array [] ada di posisi benar ──
  useEffect(() => {
    const params         = new URLSearchParams(window.location.search)
    const tokenFromUrl   = params.get('token')
    const tokenFromStore = localStorage.getItem('token')
    const token          = tokenFromUrl || tokenFromStore

    if (!token) {
      // Tidak ada token → langsung ke login, hentikan loading
      setLoadingAuth(false)
      return
    }

    localStorage.setItem('token', token)
    if (tokenFromUrl) {
      window.history.replaceState({}, document.title, '/')
    }

    api.get('/user/me')
      .then((res) => {
        console.log('USER /me response:', res.data)

        // BUG FIX #3: Backend return flat object {id, name, email, ...}
        // Normalisasi agar aman apapun bentuk responsenya
        const u = res.data?.user ?? res.data

        if (!u || !u.id) {
          console.error('Response /user/me tidak valid:', res.data)
          localStorage.removeItem('token')
          return
        }

        setUser({
          id:       u.id,
          nama:     u.name  || u.nama  || '',
          email:    u.email || '',
          birthday: u.birthday || '',
          gender:   u.gender   || '',
          height:   u.height   ?? 0,
          weight:   u.weight   ?? 0,
        })
      })
      .catch((err) => {
        console.error('Gagal memuat sesi:', err)
        localStorage.removeItem('token')
      })
      .finally(() => {
        // BUG FIX #1: finally dipanggil → loading berhenti, tidak blank screen
        setLoadingAuth(false)
      })
  }, []) // dependency array di posisi yang benar

  // ─── Load tracking items dari backend setelah login ───────────────────────
  // BUG FIX #1: useEffect ini di level top, bukan nested di dalam useEffect lain
  useEffect(() => {
    if (!user) return

    api.get('/tracking')
      .then(res => {
        const raw = Array.isArray(res.data) ? res.data : []

        const items = raw
          // BUG FIX #2: filter tracking yang relasi food-nya null/undefined → tidak crash
          .filter(t => t && t.food != null)
          .map(t => ({
            id:      t.id,
            nama:    t.food.name    || 'Makanan tidak diketahui',
            porsi:   t.food.portion || '1 porsi',
            waktu:   t.mealTime     || 'Sarapan',
            kalori:  Math.round((t.food.calories ?? 0) * (t.quantity ?? 1)),
            karbo:   Math.round((t.food.carbs    ?? 0) * (t.quantity ?? 1)),
            protein: Math.round((t.food.protein  ?? 0) * (t.quantity ?? 1)),
            lemak:   Math.round((t.food.fat      ?? 0) * (t.quantity ?? 1)),
          }))

        setCatatanItems(items)

        if (items.length > 0) {
          const maxId = Math.max(...items.map(i => typeof i.id === 'number' ? i.id : 0))
          nextId.current = maxId + 1
        }
      })
      .catch((err) => {
        console.error('Gagal memuat tracking:', err)
        // Tidak crash — state tetap array kosong
      })
  }, [user])

  // ─── Load weekly targets setelah login ────────────────────────────────────
  useEffect(() => {
    if (!user) return

    api.get('/user/target')
      .then(res => {
        if (Array.isArray(res.data.targetMingguan)) {
          setTargetMingguan(res.data.targetMingguan)
        }
        if (res.data.targetHarian != null) {
          setTargetHarian(res.data.targetHarian)
        }
      })
      .catch(() => {
        // Gagal ambil target → pakai default, tidak crash
      })
  }, [user])

  // ─── Apply calorie target dari kalkulator ─────────────────────────────────
  const terapkanTarget = async (hari, kalori) => {
    const idx = HARI_MAP[hari]
    if (idx === undefined) return

    const newTargetMingguan = [...targetMingguan]
    newTargetMingguan[idx] = kalori
    setTargetMingguan(newTargetMingguan)
    setTargetHarian(kalori)

    try {
      await api.put('/user/target', {
        targetMingguan: newTargetMingguan,
        targetHarian:   kalori,
      })
    } catch (err) {
      console.error('Gagal menyimpan target:', err)
    }
  }

  // ─── Daily totals ─────────────────────────────────────────────────────────
  const totalHariIni = catatanItems.reduce((acc, it) => ({
    kalori:  acc.kalori  + (it.kalori  || 0),
    karbo:   acc.karbo   + (it.karbo   || 0),
    protein: acc.protein + (it.protein || 0),
    lemak:   acc.lemak   + (it.lemak   || 0),
  }), { kalori:0, karbo:0, protein:0, lemak:0 })

  // ─── Render ───────────────────────────────────────────────────────────────
  if (loadingAuth) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontFamily:'Poppins,sans-serif', color:'#7c3aed' }}>
        <div>Memuat sesi...</div>
      </div>
    )
  }

  if (!user) {
    if (authPage === 'login') {
      return <HalamanLogin onLogin={handleLogin} onKeRegister={() => setAuthPage('register')} />
    }
    return <HalamanRegister onRegister={handleRegister} onKeLogin={() => setAuthPage('login')} />
  }

  return (
    <>
      <Sidebar halaman={halaman} setHalaman={setHalaman} />
      <div className="main">
        <Topbar user={user} setHalaman={setHalaman} onToggleNotif={() => setShowNotif(v => !v)} />

        {halaman === 'dashboard' && (
          <div className="content">
            <div className="left">
              <div className="top-row top-row-3">
                <GaugeCard
                  kaloriHariIni={totalHariIni.kalori}
                  targetKalori={targetHarian}
                />
                <MacroCard
                  karbo={totalHariIni.karbo}
                  protein={totalHariIni.protein}
                  lemak={totalHariIni.lemak}
                />
                <AirTracker />
              </div>
              <CatatanMakanan
                items={catatanItems}
                onTambah={tambahMakanan}
                onUpdate={updateItem}
                onHapus={hapusItem}
                nextId={nextId}
              />
              <RiwayatKalori targetMingguan={targetMingguan} kaloriHariIni={totalHariIni.kalori} />
            </div>
            <div className="right">
              <Rekomendasi onTambah={tambahMakanan} />
            </div>
          </div>
        )}

        {halaman === 'profil'     && <HalamanProfil     user={user} onUpdateUser={handleUpdateUser} />}
        {halaman === 'kalkulator' && <KalkulatorKalori  onTerapkan={terapkanTarget} />}
        {halaman === 'setelan'    && <HalamanSetelan    user={user} onUpdateUser={handleUpdateUser} tema={tema} onToggleTema={toggleTema} onLogout={handleLogout} />}
      </div>
      {showNotif && <JendelaNotifikasi onTutup={() => setShowNotif(false)} />}
    </>
  )
}