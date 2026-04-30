import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Login() {
  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const navigate = useNavigate()
  const [verPassword, setVerPassword] = useState(false)

  const handleLogin = async () => {
    if (!usuario || !contrasena) {
      setError('Ingresa tu usuario y contraseña')
      return
    }
    setCargando(true)
    setError('')
    try {
      const res = await axios.post('http://localhost:3000/auth/login', {
        usuario,
        contrasena
      })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('usuario', JSON.stringify(res.data.usuario))

      // ── Redirigir según rol ──────────────────────────────────────────────
      const rol = res.data.usuario.rol
      if (rol === 'administrador') {
        navigate('/dashboard')
      } else {
        navigate('/mis-manuales')
      }

    } catch (err) {
      setError('Usuario o contraseña incorrectos')
    } finally {
      setCargando(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* Panel izquierdo */}
      <div className="login-left">
        <div className="login-left-bg"></div>
        <div className="login-left-pattern"></div>
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        <div className="login-left-content">
          <img src="/Logoprueba.png" alt="Logo IMDAI" className="escudo-hero" style={{ width: '220px', height: '220px', objectFit: 'contain' }} />
          <h1>Manuales Digitales</h1>
          <p className="inst">Municipio de Benito Juárez</p>
          <p className="sub">Instituto Municipal de Desarrollo<br/>Administrativo e Innovación</p>
          <div className="deco">
            <span></span><span></span><span></span>
          </div>
        </div>
        <div className="login-footer">
          <span>Cancún · Quintana Roo · México</span>
        </div>
      </div>

      {/* Panel derecho */}
      <div className="login-right">
        <div className="login-form-wrap">
          <h2 className="login-greeting">Bienvenido</h2>
          <p className="login-sub">Ingresa tus credenciales para continuar</p>

          <div className="form-group">
            <label>Usuario</label>
            <div className="input-wrap">
              <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <input
                type="text"
                placeholder="Nombre de usuario"
                value={usuario}
                onChange={e => setUsuario(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </div>
          </div>

         <div className="form-group">
  <label>Contraseña</label>
  <div className="input-wrap">
    <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
    <input
      type={verPassword ? 'text' : 'password'}
      placeholder="••••••••"
      value={contrasena}
      onChange={e => setContrasena(e.target.value)}
      onKeyDown={handleKeyDown}
    />
    <span
      onClick={() => setVerPassword(!verPassword)}
      style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#fda4af' }}
    >
      {verPassword ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      )}
    </span>
  </div>
</div>
          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: '8px',
              background: '#fff1f2', border: '1px solid #fecdd3',
              color: '#be123c', fontSize: '.8rem', fontWeight: '500',
              marginTop: '4px'
            }}>
              {error}
            </div>
          )}

          <button
            className="btn-login"
            onClick={handleLogin}
            disabled={cargando}
            style={{ opacity: cargando ? .7 : 1 }}
          >
            {cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </div>
      </div>

    </div>
  )
}
