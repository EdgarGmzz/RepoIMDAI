import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import WizardManual from '../components/WizardManual'
import WizardOrganizacion from '../components/WizardOrganizacion'

export default function MisManuales() {
  const [manuales, setManuales] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [wizardOrgOpen, setWizardOrgOpen] = useState(false)
  const [manualEditar, setManualEditar] = useState(null)
  const [enviando, setEnviando] = useState(null)
  const navigate = useNavigate()
  const usuario = JSON.parse(localStorage.getItem('usuario'))
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    if (usuario?.rol === 'administrador') { navigate('/dashboard'); return }
    fetchManuales()
  }, [])

  const fetchManuales = async () => {
    try {
      const res = await axios.get('http://localhost:3000/manuales', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setManuales(res.data)
    } catch {
      navigate('/login')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    navigate('/login')
  }

  const abrirEdicion = (m) => {
    setManualEditar(m)
    if (m.tipo_manual === 'organizacion') {
      setWizardOrgOpen(true)
    } else {
      setWizardOpen(true)
    }
  }

  const cerrarWizard = () => {
    setWizardOpen(false)
    setWizardOrgOpen(false)
    setManualEditar(null)
  }

  const onGuardado = () => {
    cerrarWizard()
    fetchManuales()
  }

  const enviarARevision = async (id_manual) => {
    setEnviando(id_manual)
    try {
      await axios.patch(
        `http://localhost:3000/manuales/${id_manual}/estado`,
        { estado: 'en_revision' },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchManuales()
    } catch {
      alert('No se pudo enviar a revisión. Intenta de nuevo.')
    } finally {
      setEnviando(null)
    }
  }

  const estadoBadge = (estado) => {
    const map = {
      borrador:      { label: 'Borrador',      clase: 'borrador' },
      en_revision:   { label: 'En Revisión',   clase: 'revision' },
      observaciones: { label: 'Observaciones', clase: 'observaciones' },
      validado:      { label: 'Validado',      clase: 'validado' },
      autorizado:    { label: 'Autorizado',    clase: 'validado' },
    }
    return map[estado] || { label: estado, clase: 'borrador' }
  }

  const totalManuales    = manuales.length
  const enBorrador       = manuales.filter(m => m.estado === 'borrador').length
  const enRevision       = manuales.filter(m => m.estado === 'en_revision').length
  const conObservaciones = manuales.filter(m => m.estado === 'observaciones').length
  const validados        = manuales.filter(m => ['validado','autorizado'].includes(m.estado)).length

  const btnStyle = (color, bg, border) => ({
    width: '32px', height: '32px', borderRadius: '7px',
    border: `1.5px solid ${border}`, background: bg, color,
    cursor: 'pointer', display: 'inline-flex',
    alignItems: 'center', justifyContent: 'center', transition: 'all .2s'
  })

  const accionesPorEstado = (m) => {
    switch (m.estado) {
      case 'borrador':
      case 'observaciones':
        return (
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
            {/* Editar */}
            <button title="Continuar editando" onClick={() => abrirEdicion(m)} style={btnStyle('#2563eb', '#eff6ff', '#bfdbfe')}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            {/* Enviar a revisión */}
            <button
              title="Enviar a revisión IMDAI"
              disabled={enviando === m.id_manual}
              onClick={() => enviarARevision(m.id_manual)}
              style={btnStyle('#059669', '#f0fdf4', '#bbf7d0')}
            >
              {enviando === m.id_manual ? (
                <div style={{ width: '13px', height: '13px', border: '2px solid #bbf7d0', borderTopColor: '#059669', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              )}
            </button>
          </div>
        )
      case 'en_revision':
        return <div style={{ textAlign: 'center' }}><span style={{ fontSize: '.7rem', color: '#3b82f6', fontWeight: '600' }}>Con IMDAI</span></div>
      case 'validado':
      case 'autorizado':
        return <div style={{ textAlign: 'center' }}><span style={{ fontSize: '.7rem', color: '#059669', fontWeight: '600' }}>✓ Aprobado</span></div>
      default:
        return null
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#faf4f5' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {/* Navbar */}
      <nav className="topnav">
        <div className="nav-brand">
          <div className="nav-escudo-sm">
            <svg width="26" height="26" viewBox="0 0 200 200">
              <defs>
                <clipPath id="c2"><circle cx="100" cy="100" r="96"/></clipPath>
                <clipPath id="t2"><rect x="0" y="0" width="200" height="105"/></clipPath>
              </defs>
              <circle cx="100" cy="100" r="96" fill="#d42b2b"/>
              <g clipPath="url(#t2)">
                <path d="M100 100 L72 4 A96 96 0 0 1 128 4 Z" fill="#1a1a1a"/>
                <path d="M100 100 L178 40 A96 96 0 0 1 196 90 Z" fill="#1a1a1a"/>
                <path d="M100 100 L4 90 A96 96 0 0 1 22 40 Z" fill="#1a1a1a"/>
              </g>
              <rect x="4" y="96" width="192" height="16" fill="#f0c030" clipPath="url(#c2)"/>
              <rect x="4" y="112" width="192" height="84" fill="#1976d2" clipPath="url(#c2)"/>
              <g clipPath="url(#c2)">
                <path d="M4 128 Q34 118 64 128 Q94 138 124 128 Q154 118 196 128 L196 144 Q154 134 124 144 Q94 154 64 144 Q34 134 4 144 Z" fill="#1565c0"/>
                <path d="M4 148 Q34 138 64 148 Q94 158 124 148 Q154 138 196 148 L196 164 Q154 154 124 164 Q94 174 64 164 Q34 154 4 164 Z" fill="#0d47a1"/>
              </g>
              <circle cx="100" cy="100" r="18" fill="#111111"/>
              <circle cx="100" cy="100" r="96" fill="none" stroke="white" strokeWidth="5"/>
            </svg>
          </div>
          IMDAI — Manuales Digitales
        </div>
        <div className="nav-right">
          <div className="nav-user">
            <div className="user-avatar">
              {usuario?.nombre?.charAt(0)}{usuario?.nombre?.split(' ')[1]?.charAt(0)}
            </div>
            <div>
              <div className="user-name">{usuario?.nombre}</div>
              <div className="user-role" style={{ color: '#059669' }}>Sujeto Obligado</div>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </nav>

      {/* Contenido */}
      <div className="main-content">

        <div className="welcome-bar">
          <h2>Buen día, {usuario?.nombre?.split(' ')[0]}</h2>
          <p>Municipio de Benito Juárez — Quintana Roo · {usuario?.dependencia}</p>
        </div>

        {/* Alerta observaciones */}
        {conObservaciones > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderRadius: '12px', background: '#fff7ed', border: '1.5px solid #fed7aa', marginBottom: '20px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '.84rem', fontWeight: '700', color: '#9a3412' }}>
                Tienes {conObservaciones} manual{conObservaciones > 1 ? 'es' : ''} con observaciones del IMDAI
              </div>
              <div style={{ fontSize: '.75rem', color: '#c2410c', marginTop: '2px' }}>
                Haz clic en el botón ✏ para corregirlo y volver a enviarlo.
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card total">
            <div className="stat-icon"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>
            <div className="stat-label">Mis Manuales</div>
            <div className="stat-number">{totalManuales}</div>
            <div className="stat-sub">En total</div>
          </div>
          <div className="stat-card borrador">
            <div className="stat-icon"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>
            <div className="stat-label">En Borrador</div>
            <div className="stat-number">{enBorrador}</div>
            <div className="stat-sub">Sin enviar</div>
          </div>
          <div className="stat-card revision">
            <div className="stat-icon"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
            <div className="stat-label">En Revisión</div>
            <div className="stat-number">{enRevision}</div>
            <div className="stat-sub">Con IMDAI</div>
          </div>
          <div className="stat-card validado">
            <div className="stat-icon"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg></div>
            <div className="stat-label">Validados</div>
            <div className="stat-number">{validados}</div>
            <div className="stat-sub">Aprobados</div>
          </div>
        </div>

        {/* Tabla */}
        <div className="section-header">
          <h2 className="section-title">Mis Manuales</h2>
          <button className="btn-new" onClick={() => setModalOpen(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nuevo Manual
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Manual</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {manuales.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '50px', color: '#a78a8f' }}>
                    <div style={{ marginBottom: '8px', fontSize: '1.5rem' }}>📄</div>
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>Sin manuales todavía</div>
                    <div style={{ fontSize: '.78rem' }}>Crea tu primer manual haciendo clic en "Nuevo Manual"</div>
                  </td>
                </tr>
              ) : (
                manuales.map(m => {
                  const badge = estadoBadge(m.estado)
                  return (
                    <tr key={m.id_manual}>
                      <td>
                        <div className="manual-name">{m.codigo || 'Sin código'}</div>
                        <div className="manual-dep">{m.dependencia}</div>
                      </td>
                      <td>
                        <span className={`type-badge ${m.tipo_manual === 'organizacion' ? 'org' : 'proc'}`}>
                          {m.tipo_manual === 'organizacion' ? 'Organización' : 'Procedimientos'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${badge.clase}`}>
                          <span className="status-dot"></span>
                          {badge.label}
                        </span>
                        {m.estado === 'observaciones' && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px', padding: '2px 8px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '5px', fontSize: '.65rem', color: '#c2410c', fontWeight: '600' }}>
                            ⚠ Requiere correcciones
                          </div>
                        )}
                      </td>
                      <td>
                        {new Date(m.fecha_creacion).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td>{accionesPorEstado(m)}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Guía de estados */}
        <div style={{ marginTop: '24px', padding: '16px 20px', background: 'white', borderRadius: '12px', border: '1px solid #faf0f2' }}>
          <div style={{ fontSize: '.68rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', color: '#c9a0a8', marginBottom: '12px' }}>Flujo de tu manual</div>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
            {[
              { estado: 'Borrador',      color: '#f59e0b', desc: 'Lo estás editando' },
              { estado: 'En Revisión',   color: '#3b82f6', desc: 'IMDAI lo revisa' },
              { estado: 'Observaciones', color: '#f97316', desc: 'Requiere correcciones' },
              { estado: 'Validado',      color: '#10b981', desc: 'Aprobado por IMDAI' },
            ].map((item, i, arr) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color, margin: '0 auto 4px' }} />
                  <div style={{ fontSize: '.68rem', fontWeight: '600', color: '#2d1520' }}>{item.estado}</div>
                  <div style={{ fontSize: '.62rem', color: '#a78a8f' }}>{item.desc}</div>
                </div>
                {i < arr.length - 1 && (
                  <div style={{ width: '40px', height: '1.5px', background: '#fecdd3', margin: '0 8px', marginBottom: '12px' }} />
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Modal selección tipo */}
      {modalOpen && (
        <div className="modal-overlay open" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Nuevo Manual</h2>
            <p>Selecciona el tipo de manual que deseas crear</p>
            <div className="modal-options">
              <div className="modal-option" onClick={() => { setModalOpen(false); setManualEditar(null); setWizardOrgOpen(true) }}>
                <div className="modal-option-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <h3>Organización</h3>
                <span>Estructura y puestos</span>
              </div>
              <div className="modal-option" onClick={() => { setModalOpen(false); setManualEditar(null); setWizardOpen(true) }}>
                <div className="modal-option-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                </div>
                <h3>Procedimientos</h3>
                <span>Procesos y actividades</span>
              </div>
            </div>
            <button className="modal-cancel" onClick={() => setModalOpen(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Wizards */}
      {wizardOpen && (
        <WizardManual manualEditar={manualEditar} onCancelar={cerrarWizard} onGuardado={onGuardado} />
      )}
      {wizardOrgOpen && (
        <WizardOrganizacion manualEditar={manualEditar} onCancelar={cerrarWizard} onGuardado={onGuardado} />
      )}

    </div>
  )
}