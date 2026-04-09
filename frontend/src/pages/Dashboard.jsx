import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import WizardManual from '../components/WizardManual'
import VisorManual from '../components/VisorManual'
import WizardOrganizacion from '../components/WizardOrganizacion'

export default function Dashboard() {
  const [manuales, setManuales] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [manualVisor, setManualVisor] = useState(null)
  const [wizardOrgOpen, setWizardOrgOpen] = useState(false)
  const [modalObsOpen, setModalObsOpen]     = useState(false)
  const [manualObs, setManualObs]           = useState(null)
  const [textoObs, setTextoObs]             = useState('')
  const [seccionObs, setSeccionObs]         = useState('General')
  const [enviandoObs, setEnviandoObs]       = useState(false)

  const [modalCodigoOpen, setModalCodigoOpen] = useState(false)
  const [manualCodigo, setManualCodigo]       = useState(null)
  const [inputCodigo, setInputCodigo]         = useState('')
  const [inputVersion, setInputVersion]       = useState('')
  const [guardandoCodigo, setGuardandoCodigo] = useState(false)
  const navigate = useNavigate()
  const usuario = JSON.parse(localStorage.getItem('usuario'))
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    fetchManuales()
  }, [])

  const fetchManuales = async () => {
    try {
      const res = await axios.get('http://localhost:3000/manuales', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setManuales(res.data)
    } catch (err) {
      navigate('/login')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    navigate('/login')
  }

  const estadoBadge = (estado) => {
    const map = {
      borrador:      { label: 'Borrador',      clase: 'borrador' },
      en_revision:   { label: 'En Revision',   clase: 'revision' },
      observaciones: { label: 'Observaciones', clase: 'observaciones' },
      validado:      { label: 'Validado',      clase: 'validado' },
      autorizado:    { label: 'Autorizado',    clase: 'validado' }
    }
    return map[estado] || { label: estado, clase: 'borrador' }
  }

  const cambiarEstado = async (id_manual, nuevoEstado, comentario = null, seccion = null) => {
    try {
      await axios.patch(
        `http://localhost:3000/manuales/${id_manual}/estado`,
        { estado: nuevoEstado, comentario, seccion },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchManuales()
    } catch (err) {
      alert(err.response?.data?.error || 'Error al cambiar el estado')
    }
  }

  const abrirModalCodigo = (manual) => {
    setManualCodigo(manual)
    setInputCodigo(manual.codigo || '')
    setInputVersion(manual.version ? String(manual.version).padStart(2, '0') : '01')
    setModalCodigoOpen(true)
  }

  const guardarCodigo = async () => {
    if (!inputCodigo.trim()) return
    setGuardandoCodigo(true)
    try {
      await axios.patch(
        `http://localhost:3000/manuales/${manualCodigo.id_manual}/codigo`,
        { codigo: inputCodigo.trim(), version: inputVersion },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setModalCodigoOpen(false)
      fetchManuales()
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar')
    } finally {
      setGuardandoCodigo(false)
    }
  }

  const abrirModalObs = (manual) => {
    setManualObs(manual)
    setTextoObs('')
    setSeccionObs('General')
    setModalObsOpen(true)
  }

  const enviarObservaciones = async () => {
    if (!textoObs.trim()) return
    setEnviandoObs(true)
    await cambiarEstado(manualObs.id_manual, 'observaciones', textoObs.trim(), seccionObs)
    setEnviandoObs(false)
    setModalObsOpen(false)
  }

  const totalManuales = manuales.length
  const enBorrador    = manuales.filter(m => m.estado === 'borrador').length
  const enRevision    = manuales.filter(m => m.estado === 'en_revision').length
  const validados     = manuales.filter(m => m.estado === 'validado').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#faf4f5' }}>

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
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
              <div className="user-role">{usuario?.rol}</div>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>Cerrar sesion</button>
        </div>
      </nav>

      {/* ── Contenido ──────────────────────────────────────────────────────── */}
      <div className="main-content">

        <div className="welcome-bar">
          <h2>Buen dia, {usuario?.nombre?.split(' ')[0]}</h2>
          <p>Municipio de Benito Juarez — Quintana Roo · {usuario?.dependencia}</p>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card total">
            <div className="stat-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div className="stat-label">Total Manuales</div>
            <div className="stat-number">{totalManuales}</div>
            <div className="stat-sub">En este periodo</div>
          </div>

          <div className="stat-card borrador">
            <div className="stat-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
            <div className="stat-label">En Borrador</div>
            <div className="stat-number">{enBorrador}</div>
            <div className="stat-sub">Sin enviar</div>
          </div>

          <div className="stat-card revision">
            <div className="stat-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <div className="stat-label">En Revision</div>
            <div className="stat-number">{enRevision}</div>
            <div className="stat-sub">Pendiente</div>
          </div>

          <div className="stat-card validado">
            <div className="stat-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div className="stat-label">Validados</div>
            <div className="stat-number">{validados}</div>
            <div className="stat-sub">Aprobados</div>
          </div>
        </div>

        {/* Tabla */}
        <div className="section-header">
          <h2 className="section-title">
            {usuario?.rol === 'administrador' ? 'Todos los Manuales' : 'Mis Manuales'}
          </h2>
          <button className="btn-new" onClick={() => setModalOpen(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
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
                <th>Creado por</th>
                <th>Fecha</th>
                <th style={{ width: '220px', textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {manuales.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#a78a8f' }}>
                    No hay manuales aun. Crea el primero.
                  </td>
                </tr>
              ) : (
                manuales.map(m => {
                  const badge = estadoBadge(m.estado)
                  return (
                    <tr key={m.id_manual}>

                      {/* Nombre + dependencia */}
                      <td>
                        <div className="manual-name">{m.codigo}</div>
                        <div className="manual-dep">{m.dependencia}</div>
                      </td>

                      {/* Tipo */}
                      <td>
                        <span className={`type-badge ${m.tipo_manual === 'organizacion' ? 'org' : 'proc'}`}>
                          {m.tipo_manual === 'organizacion' ? 'Organizacion' : 'Procedimientos'}
                        </span>
                      </td>

                      {/* Estado */}
                      <td>
                        <span className={`status-badge ${badge.clase}`}>
                          <span className="status-dot"></span>
                          {badge.label}
                        </span>
                      </td>

                      {/* Creado por */}
                      <td>{m.creado_por_nombre}</td>

                      {/* Fecha */}
                      <td>
                        {new Date(m.fecha_creacion).toLocaleDateString('es-MX', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </td>

                      {/* Acciones */}
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>

                          {/* Ver */}
                          <button
                            onClick={() => setManualVisor(m)}
                            title="Ver manual"
                            style={{
                              width: '32px', height: '32px', borderRadius: '7px',
                              border: '1.5px solid #fecdd3', background: 'white',
                              color: '#b06070', cursor: 'pointer',
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'all .2s'
                            }}
                            onMouseOver={e => { e.currentTarget.style.background = '#fff1f2'; e.currentTarget.style.borderColor = '#e11d48'; e.currentTarget.style.color = '#e11d48' }}
                            onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#fecdd3'; e.currentTarget.style.color = '#b06070' }}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                          </button>

                          {/* Validar (en_revision → validado) */}
                          {m.estado === 'en_revision' && (
                            <button
                              onClick={() => cambiarEstado(m.id_manual, 'validado')}
                              title="Validar manual"
                              style={{
                                height: '32px', padding: '0 10px', borderRadius: '7px',
                                border: '1.5px solid #bbf7d0', background: 'white',
                                color: '#059669', cursor: 'pointer', fontSize: '.72rem',
                                fontFamily: 'Poppins, sans-serif', fontWeight: '600',
                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                transition: 'all .2s'
                              }}
                              onMouseOver={e => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.borderColor = '#059669' }}
                              onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#bbf7d0' }}
                            >
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                              Validar
                            </button>
                          )}

                          {/* Observaciones (en_revision → observaciones) */}
                          {m.estado === 'en_revision' && (
                            <button
                              onClick={() => abrirModalObs(m)}
                              title="Enviar con observaciones"
                              style={{
                                height: '32px', padding: '0 10px', borderRadius: '7px',
                                border: '1.5px solid #fed7aa', background: 'white',
                                color: '#d97706', cursor: 'pointer', fontSize: '.72rem',
                                fontFamily: 'Poppins, sans-serif', fontWeight: '600',
                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                transition: 'all .2s'
                              }}
                              onMouseOver={e => { e.currentTarget.style.background = '#fffbeb'; e.currentTarget.style.borderColor = '#d97706' }}
                              onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#fed7aa' }}
                            >
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                              Observaciones
                            </button>
                          )}

                          {/* Autorizar (validado → autorizado) */}
                          {m.estado === 'validado' && (
                            <button
                              onClick={() => cambiarEstado(m.id_manual, 'autorizado')}
                              title="Autorizar manual"
                              style={{
                                height: '32px', padding: '0 10px', borderRadius: '7px',
                                border: '1.5px solid #bfdbfe', background: 'white',
                                color: '#2563eb', cursor: 'pointer', fontSize: '.72rem',
                                fontFamily: 'Poppins, sans-serif', fontWeight: '600',
                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                transition: 'all .2s'
                              }}
                              onMouseOver={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#2563eb' }}
                              onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#bfdbfe' }}
                            >
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                              Autorizar
                            </button>
                          )}

                        </div>
                      </td>

                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* ── Modal selección de tipo ─────────────────────────────────────────── */}
      {modalOpen && (
        <div className="modal-overlay open" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Nuevo Manual</h2>
            <p>Selecciona el tipo de manual que deseas crear</p>
            <div className="modal-options">

              <div className="modal-option" onClick={() => { setModalOpen(false); setWizardOrgOpen(true) }}>
                <div className="modal-option-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <h3>Organizacion</h3>
                <span>Estructura y puestos</span>
              </div>

              <div className="modal-option" onClick={() => { setModalOpen(false); setWizardOpen(true) }}>
                <div className="modal-option-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                    <polyline points="9 11 12 14 22 4"/>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                </div>
                <h3>Procedimientos</h3>
                <span>Procesos y actividades</span>
              </div>

            </div>
            <button className="modal-cancel" onClick={() => setModalOpen(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* ── Wizard Procedimientos ───────────────────────────────────────────── */}
      {wizardOpen && (
        <WizardManual
          onCancelar={() => setWizardOpen(false)}
          onGuardado={() => { setWizardOpen(false); fetchManuales() }}
        />
      )}

      {/* ── Wizard Organización ─────────────────────────────────────────────── */}
      {wizardOrgOpen && (
        <WizardOrganizacion
          onCancelar={() => setWizardOrgOpen(false)}
          onGuardado={() => { setWizardOrgOpen(false); fetchManuales() }}
        />
      )}

      {/* ── Visor de manual (solo lectura) ──────────────────────────────────── */}
      {manualVisor && (
        <VisorManual
          manual={manualVisor}
          onCerrar={() => { setManualVisor(null); fetchManuales() }}
          onActualizado={fetchManuales}
        />
      )}

      {/* ── Modal Código y Versión ───────────────────────────────────────────── */}
      {modalCodigoOpen && (
        <div className="modal-overlay open" onClick={() => setModalCodigoOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>

            <h2 style={{ marginBottom: '4px' }}>Asignar Código y Versión</h2>
            <p style={{ fontSize: '.8rem', color: '#b06070', marginBottom: '24px' }}>
              {manualCodigo?.dependencia} — {manualCodigo?.tipo_manual === 'organizacion' ? 'Organización' : 'Procedimientos'}
            </p>

            <div className="campo-grupo">
              <label>Código del Manual <span style={{ color: '#e11d48' }}>*</span></label>
              <input
                type="text"
                placeholder="Ej. MO-ADM-2026-001"
                value={inputCodigo}
                onChange={e => setInputCodigo(e.target.value)}
                autoFocus
              />
            </div>

            <div className="campo-grupo">
              <label>Versión</label>
              <input
                type="text"
                placeholder="Ej. 01"
                value={inputVersion}
                onChange={e => setInputVersion(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button className="modal-cancel" onClick={() => setModalCodigoOpen(false)} style={{ margin: 0 }}>
                Cancelar
              </button>
              <button
                onClick={guardarCodigo}
                disabled={!inputCodigo.trim() || guardandoCodigo}
                style={{
                  padding: '10px 22px', borderRadius: '8px', border: 'none',
                  background: inputCodigo.trim() ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : '#e5e7eb',
                  color: inputCodigo.trim() ? 'white' : '#9ca3af',
                  fontFamily: 'Poppins, sans-serif', fontSize: '.83rem', fontWeight: '600',
                  cursor: inputCodigo.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                {guardandoCodigo ? 'Guardando...' : 'Guardar'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── Modal Observaciones ──────────────────────────────────────────────── */}
      {modalObsOpen && (
        <div className="modal-overlay open" onClick={() => setModalObsOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>

            <h2 style={{ marginBottom: '4px' }}>Enviar Observaciones</h2>
            <p style={{ fontSize: '.8rem', color: '#b06070', marginBottom: '20px' }}>
              {manualObs?.codigo} — {manualObs?.dependencia}
            </p>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '.72rem', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#7a3a4a', marginBottom: '6px' }}>
                Sección
              </label>
              <select
                value={seccionObs}
                onChange={e => setSeccionObs(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', border: '1.5px solid #ffe4e6',
                  borderRadius: '8px', fontFamily: 'Poppins, sans-serif', fontSize: '.83rem',
                  color: '#1a0a0f', background: 'white', outline: 'none'
                }}
              >
                {manualObs?.tipo_manual === 'organizacion' ? (
                  <>
                    <option>General</option>
                    <option>Datos Generales</option>
                    <option>3.1 Introducción</option>
                    <option>3.2 Antecedentes</option>
                    <option>3.3 Marco Normativo</option>
                    <option>3.4 Atribuciones Institucionales</option>
                    <option>3.5 Objetivo General</option>
                    <option>3.6 Misión</option>
                    <option>3.7 Visión</option>
                    <option>Principios y Valores</option>
                    <option>Políticas de Operación</option>
                    <option>Marco Conceptual</option>
                    <option>Organigrama</option>
                    <option>Inventario de Puestos</option>
                    <option>Descripción de Puestos</option>
                  </>
                ) : (
                  <>
                    <option>General</option>
                    <option>Datos Generales</option>
                    <option>3.1 Introducción</option>
                    <option>3.2 Antecedentes</option>
                    <option>3.3 Marco Normativo</option>
                    <option>3.4 Atribuciones Institucionales</option>
                    <option>3.5 Objetivo General</option>
                    <option>3.6 Misión</option>
                    <option>3.7 Visión</option>
                    <option>Marco Conceptual</option>
                    <option>Inventario de Procedimientos</option>
                    <option>1. Objetivo del Procedimiento</option>
                    <option>2. Alcance</option>
                    <option>3. Responsabilidades</option>
                    <option>4. Definiciones</option>
                    <option>5. Descripción de Actividades</option>
                    <option>6. Referencia del Documento</option>
                    <option>7. Registros</option>
                    <option>Carátula de Autorizaciones</option>
                  </>
                )}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '.72rem', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#7a3a4a', marginBottom: '6px' }}>
                Observación <span style={{ color: '#e11d48' }}>*</span>
              </label>
              <textarea
                value={textoObs}
                onChange={e => setTextoObs(e.target.value)}
                placeholder="Describe detalladamente la observación o corrección que debe atender el sujeto obligado..."
                rows={5}
                style={{
                  width: '100%', padding: '10px 12px', border: '1.5px solid #ffe4e6',
                  borderRadius: '8px', fontFamily: 'Poppins, sans-serif', fontSize: '.83rem',
                  color: '#1a0a0f', resize: 'vertical', outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="modal-cancel" onClick={() => setModalObsOpen(false)} style={{ margin: 0 }}>
                Cancelar
              </button>
              <button
                onClick={enviarObservaciones}
                disabled={!textoObs.trim() || enviandoObs}
                style={{
                  padding: '10px 22px', borderRadius: '8px', border: 'none',
                  background: textoObs.trim() ? 'linear-gradient(135deg, #d97706, #b45309)' : '#e5e7eb',
                  color: textoObs.trim() ? 'white' : '#9ca3af',
                  fontFamily: 'Poppins, sans-serif', fontSize: '.83rem', fontWeight: '600',
                  cursor: textoObs.trim() ? 'pointer' : 'not-allowed', transition: 'all .2s'
                }}
              >
                {enviandoObs ? 'Enviando...' : 'Enviar Observaciones'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}