import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Login() {
  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:3000/auth/login', {
        usuario,
        contrasena
      })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('usuario', JSON.stringify(res.data.usuario))
      navigate('/dashboard')
    } catch (err) {
      setError('Usuario o contraseña incorrectos')
    }
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
          <svg className="escudo-hero" width="148" height="148" viewBox="0 0 200 200">
            <defs>
              <clipPath id="c1"><circle cx="100" cy="100" r="96"/></clipPath>
              <clipPath id="top"><rect x="0" y="0" width="200" height="105"/></clipPath>
              <clipPath id="bot"><rect x="0" y="105" width="200" height="95"/></clipPath>
            </defs>
            <circle cx="100" cy="100" r="96" fill="#d42b2b"/>
            <g clipPath="url(#top)">
              <path d="M100 100 L72 4  A96 96 0 0 1 128 4  Z" fill="#1a1a1a"/>
              <path d="M100 100 L128 4  A96 96 0 0 1 178 40 Z" fill="#d42b2b"/>
              <path d="M100 100 L178 40 A96 96 0 0 1 196 90 Z" fill="#1a1a1a"/>
              <path d="M100 100 L196 90 A96 96 0 0 1 196 105 Z" fill="#d42b2b"/>
              <path d="M100 100 L4  90 A96 96 0 0 0 4  105 Z" fill="#d42b2b"/>
              <path d="M100 100 L22 40 A96 96 0 0 1 72 4  Z" fill="#d42b2b"/>
              <path d="M100 100 L4  90 A96 96 0 0 1 22 40 Z" fill="#1a1a1a"/>
            </g>
            <rect x="4" y="96" width="192" height="16" fill="#f0c030" clipPath="url(#c1)"/>
            <rect x="4" y="112" width="192" height="84" fill="#1976d2" clipPath="url(#c1)"/>
            <g clipPath="url(#c1)">
              <path d="M4 128 Q34 118 64 128 Q94 138 124 128 Q154 118 196 128 L196 144 Q154 134 124 144 Q94 154 64 144 Q34 134 4 144 Z" fill="#1565c0"/>
              <path d="M4 148 Q34 138 64 148 Q94 158 124 148 Q154 138 196 148 L196 164 Q154 154 124 164 Q94 174 64 164 Q34 154 4 164 Z" fill="#0d47a1"/>
              <rect x="4" y="162" width="192" height="34" fill="#1976d2"/>
            </g>
            <circle cx="100" cy="100" r="18" fill="#111111"/>
            <circle cx="100" cy="100" r="96" fill="none" stroke="white" strokeWidth="5"/>
          </svg>
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
          <p className="login-sub">Ingresa tus credenciales para acceder al sistema</p>

          <div className="form-group">
            <label>Usuario</label>
            <div className="input-wrap">
              <span className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
              <input
                type="text"
                placeholder="nombre.apellido"
                value={usuario}
                onChange={e => setUsuario(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <div className="input-wrap">
              <span className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                type="password"
                placeholder="••••••••••"
                value={contrasena}
                onChange={e => setContrasena(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>
          </div>

          {error && <p style={{ color: '#e11d48', fontSize: '0.8rem', marginTop: '8px' }}>{error}</p>}

          <button className="btn-login" onClick={handleLogin}>
            Iniciar Sesión
          </button>
        </div>
      </div>
    </div>
  )
}