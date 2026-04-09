import { useState, useEffect } from 'react'
import axios from 'axios'
import Paso1DatosGenerales from './pasos/Paso1DatosGenerales'
import Paso2CapituloI from './pasos/Paso2CapituloI'
import Paso3Inventario from './pasos/Paso3Inventario'
import Paso4Procedimiento from './pasos/Paso4Procedimiento'
import Paso5Revision from './pasos/Paso5Revision'

const pasos = [
  { numero: 1, titulo: 'Datos Generales' },
  { numero: 2, titulo: 'Capitulo I' },
  { numero: 3, titulo: 'Inventario' },
  { numero: 4, titulo: 'Procedimientos' },
  { numero: 5, titulo: 'Revision' }
]

const datosVacios = {
  dependencia: '',
  codigo: '',
  tipo_manual: 'procedimientos',
  fecha_elaboracion: '',
  version: '01',
  titular: '',
  cargo_titular: '',
  introduccion: '',
  antecedentes: '',
  marco_normativo: [],
  atribuciones: '',
  objetivo_general: '',
  mision: '',
  vision: '',
  marco_conceptual: [],
  procedimientos: [],
}

// Convierte cualquier valor de fecha a string YYYY-MM-DD para inputs type="date"
const toDateStr = (val) => {
  if (!val) return ''
  if (typeof val === 'string') {
    // Si ya tiene formato ISO con T, cortar
    return val.split('T')[0]
  }
  if (val instanceof Date) {
    return val.toISOString().split('T')[0]
  }
  return ''
}

export default function WizardManual({ onCancelar, onGuardado, manualEditar = null }) {
  const [pasoActual, setPasoActual] = useState(1)
  const [guardando, setGuardando] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const token = localStorage.getItem('token')

  const modoEdicion = !!manualEditar
  const [datos, setDatos] = useState(datosVacios)

  useEffect(() => {
    if (!manualEditar) return
    const fetchDetalle = async () => {
      setCargando(true)
      try {
        const res = await axios.get(`http://localhost:3000/manuales/${manualEditar.id_manual}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const d = res.data

        setDatos({
          dependencia:      d.dependencia      || '',
          codigo:           d.codigo           || '',
          tipo_manual:      'procedimientos',
          // ── Fechas: convertir a YYYY-MM-DD ──────────────────────────────
          fecha_elaboracion: toDateStr(d.fecha_elaboracion),
          // ── Versión: convertir número a string con padding ───────────────
          version:          d.version != null
                              ? String(d.version).padStart(2, '0')
                              : '01',
          titular:          d.titular           || '',
          cargo_titular:    d.cargo_titular     || '',
          introduccion:     d.introduccion      || '',
          antecedentes:     d.antecedentes      || '',
          atribuciones:     d.atribuciones      || '',
          objetivo_general: d.objetivo_general  || '',
          mision:           d.mision            || '',
          vision:           d.vision            || '',
          // ── Marco normativo: normalizar fechas de cada norma ────────────
          marco_normativo: (d.marco_normativo || []).map(n => ({
            nombre: n.nombre || '',
            fecha:  toDateStr(n.fecha),
            medio:  n.medio  || '',
          })),
          marco_conceptual: (d.marco_conceptual || []).map(c => ({
            termino:   c.termino   || '',
            definicion: c.definicion || '',
          })),
          // ── Procedimientos: normalizar fechas de cada procedimiento ─────
          procedimientos: (d.procedimientos || []).map(p => ({
            codigo:            p.codigo            || '',
            version:           p.version != null ? String(p.version).padStart(2, '0') : '00',
            nombre:            p.nombre            || '',
            fecha_emision:     toDateStr(p.fecha_emision),
            objetivo:          p.objetivo          || '',
            alcance:           p.alcance           || '',
            responsabilidades: p.responsabilidades || '',
            definiciones:      p.definiciones      || '',
            referencias:       p.referencias       || '',
            registros:         p.registros         || '',
            elaboro_nombre:    p.elaboro_nombre    || '',
            reviso_nombre:     p.reviso_nombre     || '',
            autorizo_nombre:   p.autorizo_nombre   || '',
            valido_nombre:     p.valido_nombre     || '',
            actividades:       (p.actividades || []).map(a => ({
              tipo:        a.tipo        || 'actividad',
              paso_no:     a.paso_no     ?? null,
              responsable: a.responsable || '',
              descripcion: a.descripcion || '',
            })),
            diagrama: null,
          })),
        })
      } catch {
        setError('No se pudo cargar el manual. Intenta de nuevo.')
      } finally {
        setCargando(false)
      }
    }
    fetchDetalle()
  }, [manualEditar])

  const actualizar = (nuevos) => {
  console.log('actualizando:', nuevos)
  setDatos(prev => ({ ...prev, ...nuevos }))
}
  const siguiente  = () => setPasoActual(p => Math.min(p + 1, 5))
  const anterior   = () => setPasoActual(p => Math.max(p - 1, 1))

 const guardar = async () => {
    setGuardando(true)
    setError('')
    try {
      if (modoEdicion) {
        await axios.put(
          `http://localhost:3000/manuales/${manualEditar.id_manual}`,
          datos,
          { headers: { Authorization: `Bearer ${token}` } }
        )
      } else {
        console.log('mandando al backend:', datos.titular, datos.cargo_titular) // ← aquí
        await axios.post('http://localhost:3000/manuales', datos, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      onGuardado()
    } catch {
      setError('Ocurrió un error al guardar. Intenta de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  const renderPaso = () => {
    switch (pasoActual) {
      case 1: return <Paso1DatosGenerales datos={datos} actualizar={actualizar} />
      case 2: return <Paso2CapituloI      datos={datos} actualizar={actualizar} />
      case 3: return <Paso3Inventario     datos={datos} actualizar={actualizar} />
      case 4: return <Paso4Procedimiento  datos={datos} actualizar={actualizar} />
      case 5: return <Paso5Revision       datos={datos} />
      default: return null
    }
  }

  return (
    <div className="wizard-overlay">
      <div className="wizard-container">

        <div className="wizard-header">
          <div>
            <h2 className="wizard-title">
              {modoEdicion ? 'Editar Manual de Procedimientos' : 'Nuevo Manual de Procedimientos'}
            </h2>
            <p className="wizard-sub">
              {modoEdicion
                ? `Editando: ${manualEditar.codigo || 'Sin código'} — ${manualEditar.dependencia}`
                : 'Municipio de Benito Juárez'}
            </p>
          </div>
          <button className="wizard-close" onClick={onCancelar}>✕</button>
        </div>

        <div className="wizard-steps">
          {pasos.map((p) => (
            <div key={p.numero} className={`wizard-step ${pasoActual === p.numero ? 'active' : ''} ${pasoActual > p.numero ? 'done' : ''}`}>
              <div className="step-circle">
                {pasoActual > p.numero ? '✓' : p.numero}
              </div>
              <span className="step-label">{p.titulo}</span>
            </div>
          ))}
        </div>

        <div className="wizard-body">
          {cargando ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '60px', gap: '14px'
            }}>
              <div style={{
                width: '36px', height: '36px', border: '3px solid #fecdd3',
                borderTopColor: '#e11d48', borderRadius: '50%',
                animation: 'spin .8s linear infinite'
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
              <p style={{ color: '#b06070', fontSize: '.82rem' }}>Cargando datos del manual...</p>
            </div>
          ) : renderPaso()}
        </div>

        <div className="wizard-footer">
          <button className="wizard-btn-secondary" onClick={anterior} disabled={pasoActual === 1}>
            Anterior
          </button>
          <span className="wizard-step-count">Paso {pasoActual} de 5</span>
          {pasoActual < 5 ? (
            <button className="wizard-btn-primary" onClick={siguiente}>
              Siguiente
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
              {error && <span style={{ fontSize: '.75rem', color: '#e11d48' }}>{error}</span>}
              <button className="wizard-btn-success" onClick={guardar} disabled={guardando}>
                {guardando ? 'Guardando...' : modoEdicion ? 'Guardar Cambios' : 'Guardar Manual'}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
