import { useState, useCallback } from 'react'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

function DiagramaFlujo({ actividades }) {
  const generarNodos = () => {
    const nodos = []
    const edges = []

    // Nodo INICIO
    nodos.push({
      id: 'inicio',
      data: { label: 'INICIO' },
      position: { x: 250, y: 0 },
      style: {
        background: '#059669', color: 'white', borderRadius: '50%',
        width: 80, height: 80, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontWeight: '700', fontSize: '0.75rem',
        border: 'none'
      }
    })

    // Nodos de actividades
    actividades.forEach((act, i) => {
      const id = `paso-${i}`
      nodos.push({
        id,
        data: {
          label: (
            <div style={{ textAlign: 'center', fontSize: '0.72rem' }}>
              <div style={{ fontWeight: '700', color: '#e11d48', marginBottom: '3px' }}>
                {act.responsable || 'Responsable'}
              </div>
              <div>{act.descripcion || `Paso ${i + 1}`}</div>
            </div>
          )
        },
        position: { x: 150, y: 120 + i * 130 },
        style: {
          background: 'white', border: '2px solid #fecdd3',
          borderRadius: '8px', padding: '10px',
          width: 220, fontSize: '0.72rem'
        }
      })

      // Conectar con el anterior
      if (i === 0) {
        edges.push({ id: `e-inicio-${id}`, source: 'inicio', target: id, type: 'smoothstep' })
      } else {
        edges.push({ id: `e-${i - 1}-${i}`, source: `paso-${i - 1}`, target: id, type: 'smoothstep' })
      }
    })

    // Nodo FIN
    const finY = actividades.length === 0 ? 120 : 120 + actividades.length * 130
    nodos.push({
      id: 'fin',
      data: { label: 'FIN' },
      position: { x: 250, y: finY },
      style: {
        background: '#e11d48', color: 'white', borderRadius: '50%',
        width: 80, height: 80, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontWeight: '700', fontSize: '0.75rem',
        border: 'none'
      }
    })

    // Conectar ultimo paso con FIN
    if (actividades.length > 0) {
      edges.push({
        id: 'e-fin',
        source: `paso-${actividades.length - 1}`,
        target: 'fin',
        type: 'smoothstep'
      })
    } else {
      edges.push({ id: 'e-fin', source: 'inicio', target: 'fin', type: 'smoothstep' })
    }

    return { nodos, edges }
  }

  const { nodos, edges } = generarNodos()
  const alturaFlujo = 200 + actividades.length * 130

  return (
    <div style={{ height: `${alturaFlujo}px`, border: '1.5px solid #fecdd3', borderRadius: '10px', overflow: 'hidden', marginTop: '16px' }}>
      <ReactFlow
        nodes={nodos}
        edges={edges}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <Background color="#fdf5f6" gap={16} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  )
}

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
    const nuevas = [...(proc.actividades || []), { responsable: '', descripcion: '' }]
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
  <span className="proc-codigo">{proc.codigo || 'Sin codigo'}</span>
  <span className="proc-nombre">{proc.nombre || 'Sin nombre'}</span>
</div>

{/* Caratula de autorizaciones */}
<div className="campo-grupo">
  <label>Caratula de Autorizaciones</label>
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
          placeholder="Que se pretende lograr con este procedimiento?"
          value={proc.objetivo || ''}
          onChange={e => actualizarProc('objetivo', e.target.value)}
          rows={3}
        />
      </div>

      <div className="campo-grupo">
        <label>2. Alcance</label>
        <textarea
          placeholder="Limites y cobertura del procedimiento..."
          value={proc.alcance || ''}
          onChange={e => actualizarProc('alcance', e.target.value)}
          rows={3}
        />
      </div>

      <div className="campo-grupo">
        <label>3. Responsabilidades</label>
        <textarea
          placeholder="Describe las responsabilidades por puesto o area..."
          value={proc.responsabilidades || ''}
          onChange={e => actualizarProc('responsabilidades', e.target.value)}
          rows={3}
        />
      </div>

      <div className="campo-grupo">
        <label>4. Definiciones</label>
        <textarea
          placeholder="Terminos especificos de este procedimiento..."
          value={proc.definiciones || ''}
          onChange={e => actualizarProc('definiciones', e.target.value)}
          rows={3}
        />
      </div>

      <div className="campo-grupo">
        <div className="campo-header">
          <label>5. Descripcion de Actividades</label>
          <button className="btn-agregar" onClick={agregarActividad}>+ Agregar Paso</button>
        </div>

        {(!proc.actividades || proc.actividades.length === 0) && (
          <p className="campo-vacio">No hay actividades. Haz clic en + Agregar Paso.</p>
        )}

        {proc.actividades && proc.actividades.length > 0 && (
          <table className="inv-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>Paso</th>
                <th style={{ width: '200px' }}>Responsable</th>
                <th>Descripcion de la Actividad</th>
                <th style={{ width: '40px' }}></th>
              </tr>
            </thead>
            <tbody>
              {proc.actividades.map((act, i) => (
                <tr key={i}>
                  <td style={{ textAlign: 'center', fontWeight: '600', color: '#e11d48' }}>{i + 1}</td>
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
                  <td>
                    <button className="btn-eliminar" onClick={() => eliminarActividad(i)}>x</button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', fontWeight: '600', color: '#059669', padding: '12px' }}>
                  Fin de Procedimiento
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        )}

        {/* Diagrama de flujo */}
        <div style={{ marginTop: '24px' }}>
          <label style={{ fontSize: '.72rem', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#7a3a4a' }}>
            Diagrama de Flujo — Vista previa en tiempo real
          </label>
          <DiagramaFlujo actividades={proc.actividades || []} />
        </div>
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