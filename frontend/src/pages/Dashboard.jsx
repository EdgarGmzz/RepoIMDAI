import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import WizardManual from '../components/WizardManual'
import VisorManual from '../components/VisorManual'
import WizardOrganizacion from '../components/WizardOrganizacion'

export default function Dashboard() {
  const [manuales, setManuales]                     = useState([])
  const [modalOpen, setModalOpen]                   = useState(false)
  const [wizardOpen, setWizardOpen]                 = useState(false)
  const [manualVisor, setManualVisor]               = useState(null)
  const [wizardOrgOpen, setWizardOrgOpen]           = useState(false)
  const [modalObsOpen, setModalObsOpen]             = useState(false)
  const [manualObs, setManualObs]                   = useState(null)
  const [textoObs, setTextoObs]                     = useState('')
  const [seccionObs, setSeccionObs]                 = useState('General')
  const [enviandoObs, setEnviandoObs]               = useState(false)
  const [modalCodigoOpen, setModalCodigoOpen]       = useState(false)
  const [manualCodigo, setManualCodigo]             = useState(null)
  const [inputCodigo, setInputCodigo]               = useState('')
  const [inputVersion, setInputVersion]             = useState('')
  const [guardandoCodigo, setGuardandoCodigo]       = useState(false)
  const [seleccionados, setSeleccionados]           = useState([])
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false)
  // Feature 1
  const [busqueda, setBusqueda]       = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroTipo, setFiltroTipo]   = useState('')
  // Feature 2
  const [actividad, setActividad]     = useState([])
  // Feature 5
  const [modalHistorialOpen, setModalHistorialOpen] = useState(false)
  const [historialManual, setHistorialManual]       = useState(null)
  const [historialData, setHistorialData]           = useState([])
  const [loadingHistorial, setLoadingHistorial]     = useState(false)

  const navigate = useNavigate()
  const usuario = JSON.parse(localStorage.getItem('usuario'))
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    fetchManuales()
    fetchActividad()
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

  const fetchActividad = async () => {
    try {
      const res = await axios.get('http://localhost:3000/manuales/actividad', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setActividad(res.data)
    } catch {
      setActividad([])
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
      en_revision:   { label: 'En Revisión',   clase: 'revision' },
      observaciones: { label: 'Observaciones', clase: 'observaciones' },
      validado:      { label: 'Validado',      clase: 'validado' },
      autorizado:    { label: 'Validado',      clase: 'validado' },
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
      fetchActividad()
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

  const toggleSeleccion = (id) => {
    setSeleccionados(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleTodos = () => {
    if (seleccionados.length === manualesFiltrados.length) {
      setSeleccionados([])
    } else {
      setSeleccionados(manualesFiltrados.map(m => m.id_manual))
    }
  }

  const eliminarSeleccionados = async () => {
    try {
      await axios.delete('http://localhost:3000/manuales', {
        headers: { Authorization: `Bearer ${token}` },
        data: { ids: seleccionados }
      })
      setSeleccionados([])
      setConfirmandoEliminar(false)
      fetchManuales()
    } catch {
      alert('Error al eliminar los manuales')
    }
  }

  const abrirHistorial = async (manual) => {
    setHistorialManual(manual)
    setHistorialData([])
    setLoadingHistorial(true)
    setModalHistorialOpen(true)
    try {
      const res = await axios.get(`http://localhost:3000/manuales/${manual.id_manual}/historial`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setHistorialData(res.data)
    } catch {
      setHistorialData([])
    } finally {
      setLoadingHistorial(false)
    }
  }

  // ── Feature 1: Filtrado ──────────────────────────────────────────────────
  const manualesFiltrados = useMemo(() => {
    return manuales.filter(m => {
      const texto = busqueda.toLowerCase()
      const coincideTexto = !texto ||
        m.dependencia?.toLowerCase().includes(texto) ||
        m.codigo?.toLowerCase().includes(texto) ||
        m.creado_por_nombre?.toLowerCase().includes(texto)
      const coincideEstado = !filtroEstado || m.estado === filtroEstado
      const coincideTipo   = !filtroTipo   || m.tipo_manual === filtroTipo
      return coincideTexto && coincideEstado && coincideTipo
    })
  }, [manuales, busqueda, filtroEstado, filtroTipo])

  // ── Feature 3 & stats ────────────────────────────────────────────────────
  const totalManuales  = manuales.length
  const enRevision     = manuales.filter(m => m.estado === 'en_revision').length
  const validados      = manuales.filter(m => m.estado === 'validado' || m.estado === 'autorizado').length

  // ── Feature 4: Estadísticas por dependencia ──────────────────────────────
  const statsPorDep = useMemo(() => {
    const mapa = {}
    manuales.forEach(m => {
      const dep = m.dependencia || 'Sin dependencia'
      if (!mapa[dep]) mapa[dep] = { total: 0, en_revision: 0, validado: 0, observaciones: 0 }
      mapa[dep].total++
      const estado = m.estado === 'autorizado' ? 'validado' : m.estado
      if (mapa[dep][estado] !== undefined) mapa[dep][estado]++
    })
    return Object.entries(mapa).sort((a, b) => b[1].total - a[1].total)
  }, [manuales])

  // ── Helpers de UI ────────────────────────────────────────────────────────
  const tiempoRelativo = (fechaStr) => {
    const ahora = new Date()
    const fecha = new Date(fechaStr.replace(' ', 'T'))
    const diff = Math.floor((ahora - fecha) / 1000)
    if (diff < 60)    return 'Hace un momento'
    if (diff < 3600)  return `Hace ${Math.floor(diff / 60)} min`
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`
    return `Hace ${Math.floor(diff / 86400)} días`
  }

  const iconoActividad = (razon) => {
    if (razon?.includes('en_revision'))   return { color: '#3b82f6', bg: '#eff6ff', icon: '→' }
    if (razon?.includes('validado'))      return { color: '#059669', bg: '#f0fdf4', icon: '✓' }
    if (razon?.includes('autorizado'))    return { color: '#7c3aed', bg: '#f5f3ff', icon: '★' }
    if (razon?.includes('observaciones')) return { color: '#d97706', bg: '#fffbeb', icon: '!' }
    return { color: '#6b7280', bg: '#f9fafb', icon: '·' }
  }

  const inputStyle = {
    height: '36px', padding: '0 12px', border: '1.5px solid #ffe4e6',
    borderRadius: '8px', fontFamily: 'Poppins, sans-serif', fontSize: '.8rem',
    color: '#1a0a0f', background: 'white', outline: 'none'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#faf4f5' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

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
          <h2>Buen día, {usuario?.nombre?.split(' ')[0]}</h2>
          <p>Municipio de Benito Juárez — Quintana Roo · Panel de administración</p>
        </div>

        {/* ── Feature 3: Alerta manuales en revisión ──────────────────────── */}
        {enRevision > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            padding: '14px 20px', borderRadius: '12px',
            background: '#eff6ff', border: '1.5px solid #bfdbfe', marginBottom: '20px'
          }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px', background: '#dbeafe',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '.84rem', fontWeight: '700', color: '#1e3a8a' }}>
                {enRevision} manual{enRevision > 1 ? 'es' : ''} esperan tu revisión
              </div>
              <div style={{ fontSize: '.75rem', color: '#3b82f6', marginTop: '2px' }}>
                Usa los botones <strong>Validar</strong> u <strong>Observaciones</strong> en la tabla para gestionarlos.
              </div>
            </div>
          </div>
        )}

        {/* ── Stats ───────────────────────────────────────────────────────── */}
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
            <div className="stat-sub">Visibles para admin</div>
          </div>
          <div className="stat-card revision">
            <div className="stat-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <div className="stat-label">En Revisión</div>
            <div className="stat-number">{enRevision}</div>
            <div className="stat-sub">Pendientes</div>
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
          <div className="stat-card" style={{ background: 'white', borderTop: '3px solid #d97706' }}>
            <div className="stat-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div className="stat-label">Observaciones</div>
            <div className="stat-number">{manuales.filter(m => m.estado === 'observaciones').length}</div>
            <div className="stat-sub">Con correcciones</div>
          </div>
        </div>

        {/* ── Features 2 & 4: Actividad reciente + Stats por dependencia ──── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '16px', marginBottom: '20px' }}>

          {/* Feature 2: Actividad reciente */}
          <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #faf0f2', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #fdf2f4' }}>
              <div style={{ fontSize: '.68rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', color: '#c9a0a8' }}>
                Actividad Reciente
              </div>
            </div>
            <div style={{ padding: '8px 0', maxHeight: '280px', overflowY: 'auto' }}>
              {actividad.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#c9a0a8', fontSize: '.8rem' }}>
                  Sin actividad registrada aún
                </div>
              ) : (
                actividad.map((a, i) => {
                  const ic = iconoActividad(a.razon_cambio)
                  return (
                    <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '10px 20px' }}>
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '8px', background: ic.bg,
                        color: ic.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '700', fontSize: '.75rem', flexShrink: 0
                      }}>
                        {ic.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '.78rem', fontWeight: '600', color: '#1a0a0f', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {a.dependencia || 'Sin dependencia'}
                        </div>
                        <div style={{ fontSize: '.7rem', color: '#a78a8f', marginTop: '2px', lineHeight: '1.4' }}>
                          {a.razon_cambio}
                        </div>
                        <div style={{ fontSize: '.65rem', color: '#c9a0a8', marginTop: '3px' }}>
                          {tiempoRelativo(a.fecha)} · {a.usuario_nombre}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Feature 4: Estadísticas por dependencia */}
          <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #faf0f2', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #fdf2f4' }}>
              <div style={{ fontSize: '.68rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', color: '#c9a0a8' }}>
                Manuales por Dependencia
              </div>
            </div>
            <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
              {statsPorDep.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#c9a0a8', fontSize: '.8rem' }}>
                  Sin datos disponibles
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.75rem' }}>
                  <thead>
                    <tr style={{ background: '#fdf9fa' }}>
                      <th style={{ padding: '9px 20px', textAlign: 'left', fontWeight: '600', color: '#7a3a4a', borderBottom: '1px solid #fdf2f4' }}>Dependencia</th>
                      <th style={{ padding: '9px 10px', textAlign: 'center', fontWeight: '600', color: '#7a3a4a', borderBottom: '1px solid #fdf2f4' }}>Total</th>
                      <th style={{ padding: '9px 10px', textAlign: 'center', fontWeight: '600', color: '#3b82f6', borderBottom: '1px solid #fdf2f4' }}>Revisión</th>
                      <th style={{ padding: '9px 10px', textAlign: 'center', fontWeight: '600', color: '#d97706', borderBottom: '1px solid #fdf2f4' }}>Obs.</th>
                      <th style={{ padding: '9px 10px', textAlign: 'center', fontWeight: '600', color: '#059669', borderBottom: '1px solid #fdf2f4' }}>Valid.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statsPorDep.map(([dep, stats], i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #fdf2f4' }}>
                        <td style={{ padding: '9px 20px', color: '#1a0a0f', fontWeight: '500', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {dep}
                        </td>
                        <td style={{ padding: '9px 10px', textAlign: 'center', fontWeight: '700', color: '#1a0a0f' }}>{stats.total}</td>
                        <td style={{ padding: '9px 10px', textAlign: 'center', color: stats.en_revision > 0 ? '#3b82f6' : '#d1d5db', fontWeight: '600' }}>{stats.en_revision || '—'}</td>
                        <td style={{ padding: '9px 10px', textAlign: 'center', color: stats.observaciones > 0 ? '#d97706' : '#d1d5db', fontWeight: '600' }}>{stats.observaciones || '—'}</td>
                        <td style={{ padding: '9px 10px', textAlign: 'center', color: stats.validado > 0 ? '#059669' : '#d1d5db', fontWeight: '600' }}>{stats.validado || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* ── Feature 1: Filtros + Header tabla ───────────────────────────── */}
        <div className="section-header" style={{ flexWrap: 'wrap', gap: '10px' }}>
          <h2 className="section-title">Todos los Manuales</h2>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Búsqueda */}
            <div style={{ position: 'relative' }}>
              <svg style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#b06070" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                style={{ ...inputStyle, paddingLeft: '32px', width: '200px' }}
                placeholder="Buscar..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
            </div>
            {/* Filtro estado */}
            <select style={inputStyle} value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
              <option value="">Todos los estados</option>
              <option value="en_revision">En Revisión</option>
              <option value="observaciones">Observaciones</option>
              <option value="validado">Validado</option>
            </select>
            {/* Filtro tipo */}
            <select style={inputStyle} value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
              <option value="">Todos los tipos</option>
              <option value="procedimientos">Procedimientos</option>
              <option value="organizacion">Organización</option>
            </select>
            {/* Eliminar */}
            {seleccionados.length > 0 && (
              <button className="btn-new" style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)' }}
                onClick={() => setConfirmandoEliminar(true)}>
                Eliminar ({seleccionados.length})
              </button>
            )}
            {/* Nuevo */}
            <button className="btn-new" onClick={() => setModalOpen(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Nuevo Manual
            </button>
          </div>
        </div>

        {/* Contador de resultados filtrados */}
        {(busqueda || filtroEstado || filtroTipo) && (
          <div style={{ fontSize: '.75rem', color: '#a78a8f', marginBottom: '8px', paddingLeft: '2px' }}>
            Mostrando {manualesFiltrados.length} de {manuales.length} manuales
            {(busqueda || filtroEstado || filtroTipo) && (
              <button onClick={() => { setBusqueda(''); setFiltroEstado(''); setFiltroTipo('') }}
                style={{ marginLeft: '10px', fontSize: '.72rem', color: '#e11d48', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}>
                Limpiar filtros
              </button>
            )}
          </div>
        )}

        {/* ── Tabla ───────────────────────────────────────────────────────── */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input type="checkbox"
                    checked={manualesFiltrados.length > 0 && seleccionados.length === manualesFiltrados.length}
                    onChange={toggleTodos}
                    style={{ cursor: 'pointer', accentColor: '#e11d48' }}
                  />
                </th>
                <th>Manual</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Creado por</th>
                <th>Fecha</th>
                <th style={{ width: '240px', textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {manualesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#a78a8f' }}>
                    {manuales.length === 0 ? 'No hay manuales aún. Crea el primero.' : 'No hay resultados para los filtros aplicados.'}
                  </td>
                </tr>
              ) : (
                manualesFiltrados.map(m => {
                  const badge = estadoBadge(m.estado)
                  return (
                    <tr key={m.id_manual}>
                      <td>
                        <input type="checkbox"
                          checked={seleccionados.includes(m.id_manual)}
                          onChange={() => toggleSeleccion(m.id_manual)}
                          style={{ cursor: 'pointer', accentColor: '#e11d48' }}
                        />
                      </td>
                      <td>
                        <div className="manual-name">{m.codigo || 'Sin código'}</div>
                        {m.version && (
                          <div style={{ fontSize: '.68rem', color: '#a78a8f', marginTop: '2px' }}>
                            Versión {String(m.version).padStart(2, '0')}
                          </div>
                        )}
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
                      </td>
                      <td>{m.creado_por_nombre}</td>
                      <td>
                        {new Date(m.fecha_creacion).toLocaleDateString('es-MX', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', flexWrap: 'wrap' }}>

                          {/* Ver */}
                          <button onClick={() => setManualVisor(m)} title="Ver manual"
                            style={{ width: '32px', height: '32px', borderRadius: '7px', border: '1.5px solid #fecdd3', background: 'white', color: '#b06070', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}
                            onMouseOver={e => { e.currentTarget.style.background = '#fff1f2'; e.currentTarget.style.borderColor = '#e11d48'; e.currentTarget.style.color = '#e11d48' }}
                            onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#fecdd3'; e.currentTarget.style.color = '#b06070' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                            </svg>
                          </button>

                          {/* Feature 5: Historial */}
                          <button onClick={() => abrirHistorial(m)} title="Ver historial de versiones"
                            style={{ width: '32px', height: '32px', borderRadius: '7px', border: '1.5px solid #e9d5ff', background: 'white', color: '#7c3aed', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}
                            onMouseOver={e => { e.currentTarget.style.background = '#f5f3ff'; e.currentTarget.style.borderColor = '#7c3aed' }}
                            onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#e9d5ff' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="12 8 12 12 14 14"/>
                              <path d="M3.05 11a9 9 0 1 1 .5 4M3 16v-5h5"/>
                            </svg>
                          </button>

                          {/* Validar */}
                          {m.estado === 'en_revision' && (
                            <button onClick={() => cambiarEstado(m.id_manual, 'validado')} title="Validar manual"
                              style={{ height: '32px', padding: '0 10px', borderRadius: '7px', border: '1.5px solid #bbf7d0', background: 'white', color: '#059669', cursor: 'pointer', fontSize: '.72rem', fontFamily: 'Poppins, sans-serif', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px', transition: 'all .2s' }}
                              onMouseOver={e => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.borderColor = '#059669' }}
                              onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#bbf7d0' }}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                              Validar
                            </button>
                          )}

                          {/* Observaciones */}
                          {m.estado === 'en_revision' && (
                            <button onClick={() => abrirModalObs(m)} title="Enviar con observaciones"
                              style={{ height: '32px', padding: '0 10px', borderRadius: '7px', border: '1.5px solid #fed7aa', background: 'white', color: '#d97706', cursor: 'pointer', fontSize: '.72rem', fontFamily: 'Poppins, sans-serif', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px', transition: 'all .2s' }}
                              onMouseOver={e => { e.currentTarget.style.background = '#fffbeb'; e.currentTarget.style.borderColor = '#d97706' }}
                              onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#fed7aa' }}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                              Obs.
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
                <h3>Organización</h3>
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

      {/* ── Modal confirmar eliminación ─────────────────────────────────────── */}
      {confirmandoEliminar && (
        <div className="modal-overlay open" onClick={() => setConfirmandoEliminar(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Eliminar manuales</h2>
            <p>Estás a punto de eliminar {seleccionados.length} manual(es). Esta acción no se puede deshacer.</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button className="wizard-btn-secondary" style={{ flex: 1 }} onClick={() => setConfirmandoEliminar(false)}>
                Cancelar
              </button>
              <button className="wizard-btn-primary"
                style={{ flex: 1, background: 'linear-gradient(135deg, #dc2626, #991b1b)', boxShadow: 'none' }}
                onClick={eliminarSeleccionados}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Feature 5: Modal Historial ──────────────────────────────────────── */}
      {modalHistorialOpen && (
        <div className="modal-overlay open" onClick={() => setModalHistorialOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <h2 style={{ marginBottom: '4px' }}>Historial de Versiones</h2>
            <p style={{ fontSize: '.8rem', color: '#b06070', marginBottom: '20px' }}>
              {historialManual?.codigo || 'Sin código'} — {historialManual?.dependencia}
            </p>
            {loadingHistorial ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#a78a8f', fontSize: '.83rem' }}>
                Cargando historial...
              </div>
            ) : historialData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: '#a78a8f', fontSize: '.83rem' }}>
                Este manual no tiene cambios de estado registrados.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0', maxHeight: '400px', overflowY: 'auto' }}>
                {historialData.map((h, i) => {
                  const ic = iconoActividad(h.razon_cambio)
                  return (
                    <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '12px 0', borderBottom: i < historialData.length - 1 ? '1px solid #fdf2f4' : 'none' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: ic.bg, color: ic.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '.8rem', flexShrink: 0 }}>
                          {ic.icon}
                        </div>
                        {i < historialData.length - 1 && (
                          <div style={{ width: '2px', flex: 1, background: '#fdf2f4', marginTop: '4px', minHeight: '12px' }} />
                        )}
                      </div>
                      <div style={{ flex: 1, paddingBottom: '4px' }}>
                        <div style={{ fontSize: '.82rem', fontWeight: '600', color: '#1a0a0f' }}>
                          {h.razon_cambio}
                        </div>
                        <div style={{ fontSize: '.7rem', color: '#a78a8f', marginTop: '4px' }}>
                          {h.fecha} · {h.usuario_nombre || 'Sistema'}
                          {h.version && <span style={{ marginLeft: '8px', background: '#f5f3ff', color: '#7c3aed', padding: '1px 7px', borderRadius: '4px', fontWeight: '600' }}>v{String(h.version).padStart(2, '0')}</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button className="modal-cancel" onClick={() => setModalHistorialOpen(false)} style={{ margin: 0 }}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
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
              <input type="text" placeholder="Ej. MO-ADM-2026-001" value={inputCodigo}
                onChange={e => setInputCodigo(e.target.value)} autoFocus />
            </div>
            <div className="campo-grupo">
              <label>Versión</label>
              <input type="text" placeholder="Ej. 01" value={inputVersion}
                onChange={e => setInputVersion(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button className="modal-cancel" onClick={() => setModalCodigoOpen(false)} style={{ margin: 0 }}>
                Cancelar
              </button>
              <button onClick={guardarCodigo} disabled={!inputCodigo.trim() || guardandoCodigo}
                style={{ padding: '10px 22px', borderRadius: '8px', border: 'none', background: inputCodigo.trim() ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : '#e5e7eb', color: inputCodigo.trim() ? 'white' : '#9ca3af', fontFamily: 'Poppins, sans-serif', fontSize: '.83rem', fontWeight: '600', cursor: inputCodigo.trim() ? 'pointer' : 'not-allowed' }}>
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
              <select value={seccionObs} onChange={e => setSeccionObs(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #ffe4e6', borderRadius: '8px', fontFamily: 'Poppins, sans-serif', fontSize: '.83rem', color: '#1a0a0f', background: 'white', outline: 'none' }}>
                {manualObs?.tipo_manual === 'organizacion' ? (
                  <>
                    <option>General</option>
                    <option>Datos Generales</option>
                    <option>Introducción</option>
                    <option>Antecedentes</option>
                    <option>Marco Normativo</option>
                    <option>Atribuciones</option>
                    <option>Objetivo General</option>
                    <option>Misión y Visión</option>
                    <option>Organigrama</option>
                    <option>Descripción de Puestos</option>
                  </>
                ) : (
                  <>
                    <option>General</option>
                    <option>Datos Generales</option>
                    <option>Introducción</option>
                    <option>Antecedentes</option>
                    <option>Marco Normativo</option>
                    <option>Atribuciones</option>
                    <option>Objetivo General</option>
                    <option>Misión y Visión</option>
                    <option>Inventario de Procedimientos</option>
                    <option>Descripción de Procedimientos</option>
                    <option>Diagrama de Flujo</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '.72rem', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#7a3a4a', marginBottom: '6px' }}>
                Observación
              </label>
              <textarea value={textoObs} onChange={e => setTextoObs(e.target.value)} rows={5}
                placeholder="Describe la observación o corrección requerida..."
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #ffe4e6', borderRadius: '8px', fontFamily: 'Poppins, sans-serif', fontSize: '.83rem', color: '#1a0a0f', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button className="modal-cancel" onClick={() => setModalObsOpen(false)} style={{ margin: 0 }}>
                Cancelar
              </button>
              <button onClick={enviarObservaciones} disabled={!textoObs.trim() || enviandoObs}
                style={{ padding: '10px 22px', borderRadius: '8px', border: 'none', background: textoObs.trim() ? 'linear-gradient(135deg, #d97706, #b45309)' : '#e5e7eb', color: textoObs.trim() ? 'white' : '#9ca3af', fontFamily: 'Poppins, sans-serif', fontSize: '.83rem', fontWeight: '600', cursor: textoObs.trim() ? 'pointer' : 'not-allowed' }}>
                {enviandoObs ? 'Enviando...' : 'Enviar observaciones'}
              </button>
            </div>
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

      {/* ── Visor de manual ─────────────────────────────────────────────────── */}
      {manualVisor && (
        <VisorManual
          manual={manualVisor}
          onCerrar={() => { setManualVisor(null); fetchManuales() }}
          onActualizado={fetchManuales}
        />
      )}

    </div>
  )
}
