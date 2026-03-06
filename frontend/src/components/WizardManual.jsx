import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

export default function WizardManual({ onCancelar, onGuardado }) {
  const [pasoActual, setPasoActual] = useState(1)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const token = localStorage.getItem('token')

  const [datos, setDatos] = useState({
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
  })

  const actualizar = (nuevos) => setDatos(prev => ({ ...prev, ...nuevos }))

  const siguiente = () => setPasoActual(p => Math.min(p + 1, 5))
  const anterior = () => setPasoActual(p => Math.max(p - 1, 1))

  const guardar = async () => {
    setGuardando(true)
    setError('')
    try {
      await axios.post('http://localhost:3000/manuales', datos, {
        headers: { Authorization: `Bearer ${token}` }
      })
      onGuardado()
    } catch (err) {
      setError('Ocurrio un error al guardar el manual. Intenta de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  const renderPaso = () => {
    switch (pasoActual) {
      case 1: return <Paso1DatosGenerales datos={datos} actualizar={actualizar} />
      case 2: return <Paso2CapituloI datos={datos} actualizar={actualizar} />
      case 3: return <Paso3Inventario datos={datos} actualizar={actualizar} />
      case 4: return <Paso4Procedimiento datos={datos} actualizar={actualizar} />
      case 5: return <Paso5Revision datos={datos} />
      default: return null
    }
  }

  return (
    <div className="wizard-overlay">
      <div className="wizard-container">

        <div className="wizard-header">
          <div>
            <h2 className="wizard-title">Nuevo Manual de Procedimientos</h2>
            <p className="wizard-sub">Municipio de Benito Juarez</p>
          </div>
          <button className="wizard-close" onClick={onCancelar}>x</button>
        </div>

        <div className="wizard-steps">
          {pasos.map((p) => (
            <div key={p.numero} className={`wizard-step ${pasoActual === p.numero ? 'active' : ''} ${pasoActual > p.numero ? 'done' : ''}`}>
              <div className="step-circle">
                {pasoActual > p.numero ? 'v' : p.numero}
              </div>
              <span className="step-label">{p.titulo}</span>
            </div>
          ))}
        </div>

        <div className="wizard-body">
          {renderPaso()}
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
                {guardando ? 'Guardando...' : 'Guardar Manual'}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
