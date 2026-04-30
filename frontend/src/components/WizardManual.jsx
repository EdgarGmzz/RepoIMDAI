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
  elaboro_nombre: '',
  elaboro_cargo: '',
  reviso_nombre: '',
  reviso_cargo: '',
  autorizo_nombre: '',
  autorizo_cargo: '',
  valido_nombre: '',
  valido_cargo: '',
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

const validarFormulario = (datos) => {
  const usuario = JSON.parse(localStorage.getItem('usuario'))
  const esAdmin = usuario?.rol === 'administrador'
  const errores = []

  // ── Paso 1: Datos Generales ──────────────────────────────────────────────
  if (!datos.dependencia?.trim())    errores.push('Dependencia / Unidad Administrativa')
  if (!datos.fecha_elaboracion)      errores.push('Fecha de Elaboración')
  if (esAdmin && !datos.codigo?.trim()) errores.push('Código del Manual')

  // ── Paso 2: Capítulo I ───────────────────────────────────────────────────
  if (!datos.introduccion?.trim())     errores.push('Introducción (Capítulo I)')
  if (!datos.antecedentes?.trim())     errores.push('Antecedentes (Capítulo I)')
  if (!datos.atribuciones?.trim())     errores.push('Atribuciones Institucionales')
  if (!datos.objetivo_general?.trim()) errores.push('Objetivo General')
  if (!datos.mision?.trim())           errores.push('Misión')
  if (!datos.vision?.trim())           errores.push('Visión')

  // ── Paso 3: Inventario ───────────────────────────────────────────────────
  if (datos.procedimientos.length === 0) {
    errores.push('Debe agregar al menos un procedimiento en el Inventario')
  } else {
    datos.procedimientos.forEach((p, i) => {
      if (!p.nombre?.trim()) errores.push(`Nombre del Procedimiento ${i + 1} (Inventario)`)
    })
  }

  // ── Paso 4: Detalle de procedimientos ────────────────────────────────────
  datos.procedimientos.forEach((p, i) => {
    const label = p.nombre?.trim() ? `"${p.nombre}"` : `#${i + 1}`
    if (!p.objetivo?.trim())           errores.push(`Objetivo del procedimiento ${label}`)
    if (!p.alcance?.trim())            errores.push(`Alcance del procedimiento ${label}`)
    if (!p.responsabilidades?.trim())  errores.push(`Responsabilidades del procedimiento ${label}`)
    if (p.actividades.length === 0) {
      errores.push(`Actividades del procedimiento ${label} (debe tener al menos una)`)
    } else {
      p.actividades.forEach((a, j) => {
        if (!a.responsable?.trim()) errores.push(`Responsable de actividad ${j + 1} en procedimiento ${label}`)
        if (!a.descripcion?.trim()) errores.push(`Descripción de actividad ${j + 1} en procedimiento ${label}`)
      })
    }
  })

  return errores
}

export default function WizardManual({ onCancelar, onGuardado, manualEditar = null }) {
  const [pasoActual, setPasoActual] = useState(1)
  const [guardando, setGuardando] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [erroresValidacion, setErroresValidacion] = useState([])
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
          elaboro_nombre:   d.elaboro_nombre    || '',
          elaboro_cargo:    d.elaboro_cargo     || '',
          reviso_nombre:    d.reviso_nombre     || '',
          reviso_cargo:     d.reviso_cargo      || '',
          autorizo_nombre:  d.autorizo_nombre   || '',
          autorizo_cargo:   d.autorizo_cargo    || '',
          valido_nombre:    d.valido_nombre     || '',
          valido_cargo:     d.valido_cargo      || '',
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
    const errores = validarFormulario(datos)
    if (errores.length > 0) {
      setErroresValidacion(errores)
      return
    }
    setErroresValidacion([])
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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', maxWidth: '480px' }}>
              {erroresValidacion.length > 0 && (
                <div style={{
                  background: '#fff1f2', border: '1px solid #fda4af', borderRadius: '8px',
                  padding: '10px 14px', fontSize: '.76rem', color: '#9f1239', textAlign: 'left', width: '100%'
                }}>
                  <p style={{ fontWeight: 700, marginBottom: '6px' }}>
                    {erroresValidacion.length === 1
                      ? 'Falta completar el siguiente campo:'
                      : `Faltan completar ${erroresValidacion.length} campos:`}
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '16px', lineHeight: '1.7' }}>
                    {erroresValidacion.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}
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
