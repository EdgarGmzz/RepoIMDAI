import { useState } from 'react'
import DiagramaFlujo from '../DiagramaFlujo'

const TIPOS_SIMBOLO = [
  { value: 'actividad', label: '□ Actividad' },
  { value: 'decision',  label: '◇ Decisión'  },
  { value: 'documento', label: '▬ Documento'  },
]

export default function Paso4Procedimiento({ datos, actualizar }) {
  const [procActual, setProcActual] = useState(0)

  if (datos.procedimientos.length === 0) {
    return (
      <div className="paso-container">
        <h3 className="paso-titulo">Detalle de Procedimientos</h3>
        <p className="campo-vacio" style={{ marginTop: '40px', textAlign: 'center' }}>
          No hay procedimientos en el inventario. Regresa al paso anterior y agrega al menos uno.
        </p>
      </div>
    )
  }

  const proc = datos.procedimientos[procActual]

  const actualizarProc = (campo, valor) => {
    const nuevos = [...datos.procedimientos]
    nuevos[procActual][campo] = valor
    actualizar({ procedimientos: nuevos })
  }

  const agregarActividad = () => {
    const nuevas = [...(proc.actividades || []), { tipo: 'actividad', paso_no: null, responsable: '', descripcion: '' }]
    actualizarProc('actividades', nuevas)
  }

  const actualizarActividad = (index, campo, valor) => {
    const nuevas = [...proc.actividades]
    nuevas[index][campo] = valor
    actualizarProc('actividades', nuevas)
  }

  const eliminarActividad = (index) => {
    actualizarProc('actividades', proc.actividades.filter((_, i) => i !== index))
  }

  return (
    <div className="paso-container">
      <h3 className="paso-titulo">Detalle de Procedimientos</h3>

      {datos.procedimientos.length > 1 && (
        <div className="proc-tabs">
          {datos.procedimientos.map((p, i) => (
            <button
              key={i}
              className={`proc-tab ${procActual === i ? 'active' : ''}`}
              onClick={() => setProcActual(i)}
            >
              {p.nombre || `Procedimiento ${i + 1}`}
            </button>
          ))}
        </div>
      )}

      <div className="proc-header">
        <span className="proc-codigo">{proc.codigo || 'Sin código'}</span>
        <span className="proc-nombre">{proc.nombre || 'Sin nombre'}</span>
      </div>

      {/* Carátula de autorizaciones */}
      <div className="campo-grupo">
        <label>Carátula de Autorizaciones</label>
        <div className="campo-fila">
          <div className="campo-grupo">
            <label>Elaboró — Nombre</label>
            <input
              type="text"
              placeholder="Nombre completo"
              value={proc.elaboro_nombre || ''}
              onChange={e => actualizarProc('elaboro_nombre', e.target.value)}
            />
          </div>
          <div className="campo-grupo">
            <label>Revisó — Nombre</label>
            <input
              type="text"
              placeholder="Nombre completo"
              value={proc.reviso_nombre || ''}
              onChange={e => actualizarProc('reviso_nombre', e.target.value)}
            />
          </div>
        </div>
        <div className="campo-fila">
          <div className="campo-grupo">
            <label>Autorizó — Nombre</label>
            <input
              type="text"
              placeholder="Nombre completo"
              value={proc.autorizo_nombre || ''}
              onChange={e => actualizarProc('autorizo_nombre', e.target.value)}
            />
          </div>
          <div className="campo-grupo">
            <label>Validó — Nombre</label>
            <input
              type="text"
              placeholder="Nombre completo"
              value={proc.valido_nombre || ''}
              onChange={e => actualizarProc('valido_nombre', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="campo-grupo">
        <label>1. Objetivo</label>
        <textarea
          placeholder="¿Qué se pretende lograr con este procedimiento?"
          value={proc.objetivo || ''}
          onChange={e => actualizarProc('objetivo', e.target.value)}
          rows={3}
        />
      </div>

      <div className="campo-grupo">
        <label>2. Alcance</label>
        <textarea
          placeholder="Límites y cobertura del procedimiento..."
          value={proc.alcance || ''}
          onChange={e => actualizarProc('alcance', e.target.value)}
          rows={3}
        />
      </div>

      <div className="campo-grupo">
        <label>3. Responsabilidades</label>
        <textarea
          placeholder="Describe las responsabilidades por puesto o área..."
          value={proc.responsabilidades || ''}
          onChange={e => actualizarProc('responsabilidades', e.target.value)}
          rows={3}
        />
      </div>

      <div className="campo-grupo">
        <label>4. Definiciones</label>
        <textarea
          placeholder="Términos específicos de este procedimiento..."
          value={proc.definiciones || ''}
          onChange={e => actualizarProc('definiciones', e.target.value)}
          rows={3}
        />
      </div>

      <div className="campo-grupo">
        <div className="campo-header">
          <label>5. Descripción de Actividades</label>
          <button className="btn-agregar" onClick={agregarActividad}>+ Agregar Paso</button>
        </div>

        {(!proc.actividades || proc.actividades.length === 0) && (
          <p className="campo-vacio">No hay actividades. Haz clic en + Agregar Paso.</p>
        )}

        {proc.actividades && proc.actividades.length > 0 && (
          <>
            <table className="inv-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>No.</th>
                  <th style={{ width: '130px' }}>Simbología</th>
                  <th style={{ width: '160px' }}>Responsable</th>
                  <th>Descripción de la Actividad</th>
                  <th style={{ width: '80px' }}>Si NO →</th>
                  <th style={{ width: '36px' }}></th>
                </tr>
              </thead>
              <tbody>
                {proc.actividades.map((act, i) => (
                  <tr key={i}>
                    <td style={{ textAlign: 'center', fontWeight: '600', color: '#e11d48' }}>{i + 1}</td>
                    <td>
                      <select
                        value={act.tipo || 'actividad'}
                        onChange={e => actualizarActividad(i, 'tipo', e.target.value)}
                        style={{ width: '100%', fontSize: '0.78rem', padding: '4px 6px' }}
                      >
                        {TIPOS_SIMBOLO.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        placeholder="Cargo o puesto"
                        value={act.responsable}
                        onChange={e => actualizarActividad(i, 'responsable', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        placeholder="Describe la actividad detalladamente"
                        value={act.descripcion}
                        onChange={e => actualizarActividad(i, 'descripcion', e.target.value)}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {(act.tipo || 'actividad') === 'decision' ? (
                        <select
                          value={act.paso_no || ''}
                          onChange={e => actualizarActividad(i, 'paso_no', e.target.value ? parseInt(e.target.value) : null)}
                          style={{ width: '100%', fontSize: '0.75rem', padding: '4px 5px', borderRadius: '6px', border: '1px solid #fca5a5', color: '#7f1d1d', background: '#fff5f5' }}
                          title="Paso al que regresa si la respuesta es NO"
                        >
                          <option value="">— Sin retorno —</option>
                          {proc.actividades.map((a, j) => {
                            if (j === i) return null
                            const desc = a.descripcion?.trim()
                            const label = desc
                              ? `P.${j + 1}: ${desc.length > 28 ? desc.slice(0, 28) + '…' : desc}`
                              : `Paso ${j + 1}`
                            return <option key={j} value={j + 1}>{label}</option>
                          })}
                        </select>
                      ) : (
                        <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>—</span>
                      )}
                    </td>
                    <td>
                      <button className="btn-eliminar" onClick={() => eliminarActividad(i)}>✕</button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', fontWeight: '600', color: '#059669', padding: '10px' }}>
                    Fin de Procedimiento
                  </td>
                </tr>
              </tbody>
            </table>

            <div style={{ marginTop: '24px' }}>
              <label style={{ fontSize: '.72rem', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#7a3a4a' }}>
                Diagrama de Flujo — Vista previa
              </label>
              <DiagramaFlujo actividades={proc.actividades} />
            </div>
          </>
        )}
      </div>

      <div className="campo-grupo">
        <label>6. Referencia del Documento</label>
        <textarea
          placeholder="Normas y documentos que aplican a este procedimiento..."
          value={proc.referencias || ''}
          onChange={e => actualizarProc('referencias', e.target.value)}
          rows={2}
        />
      </div>

      <div className="campo-grupo">
        <label>7. Registros</label>
        <textarea
          placeholder="Formatos generados por este procedimiento..."
          value={proc.registros || ''}
          onChange={e => actualizarProc('registros', e.target.value)}
          rows={2}
        />
      </div>
    </div>
  )
}
