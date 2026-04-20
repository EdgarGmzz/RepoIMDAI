import { useState } from 'react'
import DiagramaFlujo from '../DiagramaFlujo'

const TIPOS_SIMBOLO = [
  { value: 'actividad', label: '□ Actividad' },
  { value: 'decision',  label: '◇ Decisión'  },
  { value: 'documento', label: '▬ Documento'  },
]

export default function Paso4Procedimiento({ datos, actualizar }) {
  const [procActual, setProcActual] = useState(0)
  const [modalAbierto, setModalAbierto] = useState(false)

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

  // Punto 5 — mover pasos arriba/abajo
  const moverActividad = (index, direccion) => {
    const nuevas = [...proc.actividades]
    const destino = index + direccion
    if (destino < 0 || destino >= nuevas.length) return
    ;[nuevas[index], nuevas[destino]] = [nuevas[destino], nuevas[index]]
    actualizarProc('actividades', nuevas)
  }

  // Punto 2 — responsables únicos ya ingresados
  const responsablesUnicos = [...new Set(
    (proc.actividades || []).map(a => a.responsable?.trim()).filter(Boolean)
  )]

  // Punto 3 — decisiones con retorno hacia adelante (loop inválido)
  const warningsRetorno = (proc.actividades || []).reduce((acc, act, i) => {
    const destino = parseInt(act.paso_no)
    if (act.tipo === 'decision' && destino && destino > i + 1) {
      acc.push({ paso: i + 1, destino })
    }
    return acc
  }, [])

  const tablaActividades = (
    <>
      {/* Punto 2 — datalist para autocompletado de responsables */}
      <datalist id={`responsables-${procActual}`}>
        {responsablesUnicos.map((r, i) => <option key={i} value={r} />)}
      </datalist>

      <table className="inv-table">
        <thead>
          <tr>
            <th style={{ width: '40px' }}>No.</th>
            <th style={{ width: '130px' }}>Simbología</th>
            <th style={{ width: '160px' }}>Responsable</th>
            <th>Descripción de la Actividad</th>
            <th style={{ width: '80px' }}>Si NO →</th>
            <th style={{ width: '70px' }}></th>
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
                {/* Punto 2 — input con autocompletado */}
                <input
                  list={`responsables-${procActual}`}
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
                  <>
                    <select
                      value={act.paso_no || ''}
                      onChange={e => actualizarActividad(i, 'paso_no', e.target.value ? parseInt(e.target.value) : null)}
                      style={{
                        width: '100%', fontSize: '0.75rem', padding: '4px 5px', borderRadius: '6px',
                        border: parseInt(act.paso_no) > i + 1 ? '1px solid #f59e0b' : '1px solid #fca5a5',
                        color: '#7f1d1d', background: '#fff5f5'
                      }}
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
                    {/* Punto 3 — advertencia retorno hacia adelante */}
                    {parseInt(act.paso_no) > i + 1 && (
                      <span style={{ fontSize: '0.65rem', color: '#b45309', display: 'block', marginTop: 2 }}>
                        ⚠ retorno hacia adelante
                      </span>
                    )}
                  </>
                ) : (
                  <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>—</span>
                )}
              </td>
              <td>
                {/* Punto 5 — botones reordenar + eliminar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                  <button
                    className="btn-orden"
                    onClick={() => moverActividad(i, -1)}
                    disabled={i === 0}
                    title="Subir paso"
                  >▲</button>
                  <button
                    className="btn-orden"
                    onClick={() => moverActividad(i, 1)}
                    disabled={i === proc.actividades.length - 1}
                    title="Bajar paso"
                  >▼</button>
                  <button className="btn-eliminar" onClick={() => eliminarActividad(i)}>✕</button>
                </div>
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan="6" style={{ textAlign: 'center', fontWeight: '600', color: '#059669', padding: '10px' }}>
              Fin de Procedimiento
            </td>
          </tr>
        </tbody>
      </table>

      {/* Punto 3 — resumen de warnings al pie de la tabla */}
      {warningsRetorno.length > 0 && (
        <div style={{
          marginTop: 8, padding: '8px 12px', background: '#fffbeb',
          border: '1px solid #fcd34d', borderRadius: 6,
          fontSize: '0.78rem', color: '#92400e'
        }}>
          ⚠ <strong>Retornos hacia adelante detectados:</strong>{' '}
          {warningsRetorno.map((w, i) => (
            <span key={i}>
              Paso {w.paso} → P.{w.destino}{i < warningsRetorno.length - 1 ? ', ' : ''}
            </span>
          ))}
          {' '}— Verifica que el flujo sea correcto.
        </div>
      )}
    </>
  )

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
          <div style={{ display: 'flex', gap: 8 }}>
            {/* Punto 1 — botón para abrir modal fullscreen */}
            {proc.actividades?.length > 0 && (
              <button className="btn-secundario" onClick={() => setModalAbierto(true)}>
                ⛶ Diagrama completo
              </button>
            )}
            <button className="btn-agregar" onClick={agregarActividad}>+ Agregar Paso</button>
          </div>
        </div>

        {(!proc.actividades || proc.actividades.length === 0) && (
          <p className="campo-vacio">No hay actividades. Haz clic en + Agregar Paso.</p>
        )}

        {proc.actividades && proc.actividades.length > 0 && (
          <>
            {tablaActividades}
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

      {/* Punto 1 — Modal fullscreen: tabla editable + diagrama live */}
      {modalAbierto && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.55)', display: 'flex'
        }}>
          <div style={{ background: '#fff', width: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc'
            }}>
              <span style={{ fontWeight: '700', fontSize: '0.95rem', color: '#1e293b' }}>
                Diagrama completo — {proc.nombre || 'Procedimiento'}
              </span>
              <button
                onClick={() => setModalAbierto(false)}
                style={{
                  background: '#e11d48', color: 'white', border: 'none',
                  borderRadius: 6, padding: '6px 16px', cursor: 'pointer', fontWeight: '700'
                }}
              >
                ✕ Cerrar
              </button>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              {/* Panel izquierdo — tabla editable */}
              <div style={{
                width: '50%', overflowY: 'auto', padding: '16px',
                borderRight: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                  <button className="btn-agregar" onClick={agregarActividad}>+ Agregar Paso</button>
                </div>
                {tablaActividades}
              </div>

              {/* Panel derecho — diagrama en vivo */}
              <div style={{ width: '50%', overflow: 'auto', padding: '16px', background: '#fafafa', display: 'flex', justifyContent: 'center' }}>
                <div><DiagramaFlujo actividades={proc.actividades} /></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
