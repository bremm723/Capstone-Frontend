import { useState } from 'react'
import { AiFillGoogleCircle } from "react-icons/ai"
import api from '../api.js'

export default function HalamanLogin({ onLogin, onKeRegister }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const submit = async () => {
    if (!email || !password) { setError('Email dan password harus diisi.'); return }
    setLoading(true); setError('')
    try {
      // Step 1: Login → dapat token
      const res = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', res.data.token)

      // Step 2: Ambil profil lengkap
      const meRes = await api.get('/user/me')

      // BUG FIX: Backend return flat object {id, name, email, ...}
      // field adalah "name" bukan "nama" — normalisasi di sini
      const u = meRes.data?.user ?? meRes.data

      onLogin({
        id:       u.id,
        nama:     u.name     || u.nama  || '',  // support kedua field
        email:    u.email    || '',
        birthday: u.birthday || '',
        gender:   u.gender   || '',
        height:   u.height   ?? 0,
        weight:   u.weight   ?? 0,
      })
    } catch (err) {
      localStorage.removeItem('token')
      setError(err.response?.data?.message || 'Email atau password salah.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">N</div>
        <h2 className="auth-title">Masuk ke NutriTrack</h2>
        <p className="auth-sub">Masukkan detail akun kamu untuk melanjutkan</p>
        <div className="auth-form">
          <div className="auth-field">
            <input type="email" placeholder="Masukkan Email" value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()} />
          </div>
          <div className="auth-field auth-field-pass">
            <input type={showPass ? 'text' : 'password'} placeholder="Password" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()} />
            <button className="toggle-pass" onClick={() => setShowPass(v => !v)}>
              {showPass ? 'Sembunyikan' : 'Tampilkan'}
            </button>
          </div>
          <div className="auth-trouble">Lupa password?</div>
          {error && <div className="auth-error">{error}</div>}
          <button className="auth-btn-primary" onClick={submit} disabled={loading}>
            {loading ? 'Memuat...' : 'Masuk'}
          </button>
          <div className="auth-divider"><span>— Atau masuk dengan —</span></div>
          <div className="auth-social-row">
            <button className="auth-social-btn"
              onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/auth/google`}>
              <AiFillGoogleCircle /> Google
            </button>
          </div>
          <div className="auth-switch">
            Belum punya akun?{' '}
            <span onClick={onKeRegister}>Daftar Sekarang</span>
          </div>
        </div>
      </div>
    </div>
  )
}