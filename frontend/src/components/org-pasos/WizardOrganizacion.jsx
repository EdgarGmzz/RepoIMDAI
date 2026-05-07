import { useState } from 'react'
import axios from 'axios'
import { API_BASE } from '../../config.js'
import OrgPaso1DatosGenerales from './org-pasos/OrgPaso1DatosGenerales'
import OrgPaso2CapituloI from './org-pasos/OrgPaso2CapituloI'
import OrgPaso3Organizacion from './org-pasos/OrgPaso3Organizacion'
import OrgPaso4Puestos from './org-pasos/OrgPaso4Puestos'
import OrgPaso5Revision from './org-pasos/OrgPaso5Revision'

const pasos = [
  { numero: 1, titulo: 'Datos Generales' },
  { numero: 2, titulo: 'Cap. I — Generales' },
  { numero: 3, titulo: 'Cap. II — Organización' },
  { numero: 4, titulo: 'Descripción Puestos' },
  { numero: 5, titulo: 'Revisión' },
]

export default function WizardOrganizacion({ onCancelar, onGuardado }) {
  const [pasoActual, setPasoActual] = useState(1)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const token = localStorage.getItem('token')

  const [datos, setDatos] = useState({
    // Paso 1 — Datos Generales
    dependencia: '',
    codigo: '',
    fecha_elaboracion: '',
    version: '01',
    elaboro_nombre: '',
    elaboro_cargo: '',
    reviso_nombre: '',
    reviso_cargo: '',
    autorizo_nombre: '',
    autorizo_cargo: '',
    valido_nombre: '',
    valido_cargo: '',

    // Paso 2 — Capítulo I Generales
    introduccion: '',
    superior_nombre: '',
    superior_cargo: '',
    antecedentes: '',
    marco_normativo: [],          // [{ nombre, fecha, medio }]
    atribuciones: '',
    objetivo_general: '',
    mision: '',
    vision: '',
    principios: [],               // ['...']
    valores: [],                  // ['...']
    politicas_operacion: [],      // [{ area, descripcion }]
    marco_conceptual: [],         // [{ termino, definicion }]

    // Paso 3 — Capítulo II Organización
    organigrama_general: null,    // File
    organigramas_especificos: [], // [{ nombre, archivo: File }]
    inventario_puestos: [],       // [{ nombre_puesto, num_personas }]

    // Paso 4 — Descripción de Puestos
    puestos: [],                  // ver estructura en OrgPaso4Puestos

    // Paso 5 — Último cambio
    ultimo_cambio: '',
  })

  const actualizar = (nuevos) => setDatos(prev => ({ ...prev, ...nuevos }))

  const siguiente = () => setPasoActual(p => Math.min(p + 1, pasos.length))
  const anterior  = () => setPasoActual(p => Math.max(p - 1, 1))

  const guardar = async () => {
    setGuardando(true)
    setError('')
    try {
      await axios.post(`${API_BASE}/manuales`, {
        tipo_manual: 'organizacion',
        codigo: datos.codigo,
        dependencia: datos.dependencia,
        fecha_emision: datos.fecha_elaboracion,
        version: parseInt(datos.version) || 1,
      }, { headers: { Authorization: `Bearer ${token}` } })
      onGuardado()
    } catch (err) {
      setError('Ocurrió un error al guardar. Intenta de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  const renderPaso = () => {
    switch (pasoActual) {
      case 1: return <OrgPaso1DatosGenerales datos={datos} actualizar={actualizar} />
      case 2: return <OrgPaso2CapituloI      datos={datos} actualizar={actualizar} />
      case 3: return <OrgPaso3Organizacion   datos={datos} actualizar={actualizar} />
      case 4: return <OrgPaso4Puestos        datos={datos} actualizar={actualizar} />
      case 5: return <OrgPaso5Revision       datos={datos} actualizar={actualizar} />
      default: return null
    }
  }

  return (
    <div className="wizard-overlay">
      <div className="wizard-container" style={{ maxWidth: '920px' }}>

        {/* Header */}
        <div className="wizard-header">
          <div>
            <h2 className="wizard-title">Nuevo Manual de Organización</h2>
            <p className="wizard-sub">Municipio de Benito Juárez — IMDAI</p>
          </div>
          <button className="wizard-close" onClick={onCancelar}>✕</button>
        </div>

        {/* Barra de pasos */}
        <div className="wizard-steps">
          {pasos.map((p) => (
            <div
              key={p.numero}
              className={`wizard-step ${pasoActual === p.numero ? 'active' : ''} ${pasoActual > p.numero ? 'done' : ''}`}
            >
              <div className="step-circle">
                {pasoActual > p.numero ? '✓' : p.numero}
              </div>
              <span className="step-label">{p.titulo}</span>
            </div>
          ))}
        </div>

        {/* Cuerpo */}
        <div className="wizard-body">
          {renderPaso()}
        </div>

        {/* Footer */}
        <div className="wizard-footer">
          <button
            className="wizard-btn-secondary"
            onClick={anterior}
            disabled={pasoActual === 1}
          >
            Anterior
          </button>
          <span className="wizard-step-count">Paso {pasoActual} de {pasos.length}</span>
          {pasoActual < pasos.length ? (
            <button className="wizard-btn-primary" onClick={siguiente}>
              Siguiente
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
              {error && <span style={{ fontSize: '.75rem', color: '#e11d48' }}>{error}</span>}
              <button className="wizard-btn-success" onClick={guardar} disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar Manual'}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
