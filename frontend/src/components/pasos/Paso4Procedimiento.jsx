import { useState } from 'react'

const TIPOS_SIMBOLO = [
  { value: 'actividad', label: '□ Actividad' },
  { value: 'decision',  label: '◇ Decisión'  },
  { value: 'documento', label: '▬ Documento'  },
]

const COLORES = [
  { bg: '#eff6ff', stroke: '#3b82f6', texto: '#1e3a5f', header: '#bfdbfe' },
  { bg: '#f0fdf4', stroke: '#22c55e', texto: '#14532d', header: '#bbf7d0' },
  { bg: '#fdf4ff', stroke: '#a855f7', texto: '#581c87', header: '#e9d5ff' },
  { bg: '#fff7ed', stroke: '#f97316', texto: '#7c2d12', header: '#fed7aa' },
  { bg: '#fefce8', stroke: '#eab308', texto: '#713f12', header: '#fef08a' },
  { bg: '#f0f9ff', stroke: '#06b6d4', texto: '#164e63', header: '#a5f3fc' },
  { bg: '#fdf2f8', stroke: '#ec4899', texto: '#831843', header: '#fbcfe8' },
  { bg: '#f8fafc', stroke: '#64748b', texto: '#1e293b', header: '#cbd5e1' },
]

function textoLineas(texto, maxChars = 22) {
  const palabras = (texto || '').split(' ')
  const lineas = []
  let linea = ''
  palabras.forEach(p => {
    if ((linea + ' ' + p).trim().length > maxChars) {
      if (linea) lineas.push(linea.trim())
      linea = p
    } else {
      linea = (linea + ' ' + p).trim()
    }
  })
  if (linea) lineas.push(linea.trim())
  return lineas.length ? lineas : ['']
}

function DiagramaFlujo({ actividades }) {
  if (!actividades || actividades.length === 0) return null

  // ── Constantes de layout ───────────────────────────────────────────────
  const PASO_COL_W = 28
  const RETORNO_W  = 48   // columna derecha para flechas de retorno "No"
  const LANE_W     = 190
  const HEADER_H   = 46
  const ROW_H      = 100
  const NODE_W     = 155
  const NODE_H     = 56
  const DEC_HW     = 72
  const DEC_HH     = 40
  const OVAL_RX    = 54
  const OVAL_RY    = 19
  const PAD        = 20
  const LINE_H     = 12

  // Carriles únicos en orden de aparición
  const lanes = []
  actividades.forEach(a => {
    const r = (a.responsable || 'Sin responsable').trim() || 'Sin responsable'
    if (!lanes.includes(r)) lanes.push(r)
  })

  const lanesW   = lanes.length * LANE_W
  const svgW     = PASO_COL_W + lanesW + RETORNO_W
  const inicioY  = HEADER_H + PAD
  const stepStartY = inicioY + OVAL_RY * 2 + 26
  const finY     = stepStartY + actividades.length * ROW_H + 18
  const svgH     = finY + OVAL_RY * 2 + PAD

  const laneX   = i => PASO_COL_W + i * LANE_W
  const laneCX  = i => laneX(i) + LANE_W / 2
  const stepCY  = i => stepStartY + i * ROW_H + ROW_H / 2
  const centerX = PASO_COL_W + lanesW / 2
  // Guía vertical derecha para flechas "No"
  const guiaX   = PASO_COL_W + lanesW + RETORNO_W - 10

  const nodeCX = i => {
    const lane = (actividades[i].responsable || 'Sin responsable').trim() || 'Sin responsable'
    return laneCX(lanes.indexOf(lane))
  }
  const nodeCY      = i => stepCY(i)
  const nodeBottomY = i => (actividades[i].tipo || 'actividad') === 'decision' ? nodeCY(i) + DEC_HH : nodeCY(i) + NODE_H / 2
  const nodeTopY    = i => (actividades[i].tipo || 'actividad') === 'decision' ? nodeCY(i) - DEC_HH : nodeCY(i) - NODE_H / 2
  const nodeRightX  = i => (actividades[i].tipo || 'actividad') === 'decision' ? nodeCX(i) + DEC_HW : nodeCX(i) + NODE_W / 2

  const pathLShape = (x1, y1, x2, y2) => {
    if (Math.abs(x1 - x2) < 4) return `M ${x1} ${y1} L ${x2} ${y2}`
    const midY = (y1 + y2) / 2
    return `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`
  }

  // ¿hay alguna decisión con paso_no definido?
  const hayRetornos = actividades.some(a => a.tipo === 'decision' && a.paso_no)

  return (
    <div style={{ overflowX: 'auto', marginTop: 16, border: '1px solid #e2e8f0', borderRadius: 8 }}>
      <svg width={svgW} height={svgH} style={{ display: 'block', background: '#fafafa' }}>
        <defs>
          <marker id="arr" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#64748b" />
          </marker>
          <marker id="arr-no" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#dc2626" />
          </marker>
        </defs>

        {/* Columna numeración */}
        <rect x={0} y={HEADER_H} width={PASO_COL_W} height={svgH - HEADER_H} fill="#f1f5f9" />
        <rect x={0} y={0} width={PASO_COL_W} height={HEADER_H} fill="#e2e8f0" />
        <text x={PASO_COL_W / 2} y={HEADER_H / 2 + 4} textAnchor="middle" fontSize={9} fill="#64748b" fontWeight="700">No.</text>

        {/* Carriles */}
        {lanes.map((lane, i) => {
          const c = COLORES[i % COLORES.length]
          return (
            <g key={i}>
              <rect x={laneX(i)} y={0} width={LANE_W} height={svgH} fill={c.bg} stroke="#e2e8f0" strokeWidth={0.5} />
              <rect x={laneX(i)} y={0} width={LANE_W} height={HEADER_H} fill={c.header} stroke="#e2e8f0" strokeWidth={0.5} />
              <text x={laneCX(i)} y={HEADER_H / 2 + 4} textAnchor="middle" fontSize={10} fontWeight="700" fill={c.texto}>
                {lane.length > 24 ? lane.slice(0, 24) + '…' : lane}
              </text>
            </g>
          )
        })}

        {/* Columna de retorno (derecha) */}
        {hayRetornos && (
          <rect x={PASO_COL_W + lanesW} y={0} width={RETORNO_W} height={svgH} fill="#fff5f5" stroke="#fecaca" strokeWidth={0.5} />
        )}

        {/* Numeración */}
        {actividades.map((_, i) => (
          <text key={i} x={PASO_COL_W / 2} y={stepCY(i) + 4} textAnchor="middle" fontSize={10} fill="#64748b" fontWeight="700">
            {i + 1}
          </text>
        ))}

        {/* INICIO */}
        <ellipse cx={centerX} cy={inicioY + OVAL_RY} rx={OVAL_RX} ry={OVAL_RY} fill="#059669" />
        <text x={centerX} y={inicioY + OVAL_RY + 4} textAnchor="middle" fontSize={11} fill="white" fontWeight="700">INICIO</text>

        {/* INICIO → paso 0 */}
        {actividades.length > 0 && (
          <path d={pathLShape(centerX, inicioY + OVAL_RY * 2, nodeCX(0), nodeTopY(0) - 2)}
            fill="none" stroke="#64748b" strokeWidth={1.5} markerEnd="url(#arr)" />
        )}

        {/* Nodos */}
        {actividades.map((act, i) => {
          const tipo    = act.tipo || 'actividad'
          const cx      = nodeCX(i)
          const cy      = nodeCY(i)
          const laneIdx = lanes.indexOf((act.responsable || 'Sin responsable').trim() || 'Sin responsable')
          const c       = COLORES[laneIdx % COLORES.length]
          const lineas  = textoLineas(act.descripcion || `Paso ${i + 1}`)

          if (tipo === 'decision') {
            const pts = `${cx},${cy - DEC_HH} ${cx + DEC_HW},${cy} ${cx},${cy + DEC_HH} ${cx - DEC_HW},${cy}`
            return (
              <g key={i}>
                <polygon points={pts} fill={c.bg} stroke={c.stroke} strokeWidth={2} />
                {lineas.map((l, li) => (
                  <text key={li} x={cx} y={cy + (li - (lineas.length - 1) / 2) * LINE_H + 4}
                    textAnchor="middle" fontSize={9} fill={c.texto}>{l}</text>
                ))}
              </g>
            )
          }

          const nx = cx - NODE_W / 2
          const ny = cy - NODE_H / 2
          return (
            <g key={i}>
              <rect x={nx} y={ny} width={NODE_W} height={NODE_H} rx={tipo === 'documento' ? 0 : 5}
                fill={c.bg} stroke={c.stroke} strokeWidth={2} />
              {tipo === 'documento' && (
                <>
                  <polygon points={`${nx + NODE_W - 12},${ny} ${nx + NODE_W},${ny + 12} ${nx + NODE_W - 12},${ny + 12}`}
                    fill={c.stroke} opacity={0.35} />
                  <line x1={nx + NODE_W - 12} y1={ny} x2={nx + NODE_W - 12} y2={ny + 12} stroke={c.stroke} strokeWidth={1} opacity={0.5} />
                  <line x1={nx + NODE_W - 12} y1={ny + 12} x2={nx + NODE_W} y2={ny + 12} stroke={c.stroke} strokeWidth={1} opacity={0.5} />
                </>
              )}
              {lineas.map((l, li) => (
                <text key={li} x={cx} y={cy + (li - (lineas.length - 1) / 2) * LINE_H + 4}
                  textAnchor="middle" fontSize={9} fill={c.texto}>{l}</text>
              ))}
            </g>
          )
        })}

        {/* ── Flechas de flujo principal (Sí) ───────────────────────────── */}
        {actividades.map((act, i) => {
          if (i === actividades.length - 1) return null
          const esDec = (act.tipo || 'actividad') === 'decision'
          return (
            <g key={i}>
              <path d={pathLShape(nodeCX(i), nodeBottomY(i), nodeCX(i + 1), nodeTopY(i + 1) - 2)}
                fill="none" stroke="#64748b" strokeWidth={1.5} markerEnd="url(#arr)" />
              {esDec && (
                <text x={nodeCX(i) + 4} y={nodeBottomY(i) + 12} fontSize={9} fill="#16a34a" fontWeight="700">Sí</text>
              )}
            </g>
          )
        })}

        {/* Último paso → FIN */}
        {actividades.length > 0 && (
          <path d={pathLShape(nodeCX(actividades.length - 1), nodeBottomY(actividades.length - 1), centerX, finY)}
            fill="none" stroke="#64748b" strokeWidth={1.5} markerEnd="url(#arr)" />
        )}

        {/* FIN */}
        <ellipse cx={centerX} cy={finY + OVAL_RY} rx={OVAL_RX} ry={OVAL_RY} fill="#e11d48" />
        <text x={centerX} y={finY + OVAL_RY + 4} textAnchor="middle" fontSize={11} fill="white" fontWeight="700">FIN</text>

        {/* ── Flechas de retorno "No" ────────────────────────────────────── */}
        {actividades.map((act, i) => {
          if ((act.tipo || 'actividad') !== 'decision') return null
          const destino = parseInt(act.paso_no) // 1-based
          if (!destino || destino < 1 || destino > actividades.length || destino === i + 1) return null

          const destinoIdx = destino - 1
          const cx = nodeCX(i)
          const cy = nodeCY(i)
          const destCX  = nodeCX(destinoIdx)
          const destCY  = nodeCY(destinoIdx)
          const destRX  = nodeRightX(destinoIdx)

          // Sale por la derecha del rombo → guía vertical → baja/sube → entra por derecha del nodo destino
          const salX = cx + DEC_HW
          const salY = cy
          const entX = destRX + 2
          const entY = destCY

          const path = `M ${salX} ${salY} L ${guiaX} ${salY} L ${guiaX} ${entY} L ${entX} ${entY}`

          return (
            <g key={`no-${i}`}>
              <path d={path} fill="none" stroke="#dc2626" strokeWidth={1.5}
                strokeDasharray="5,3" markerEnd="url(#arr-no)" />
              {/* etiqueta "No" junto al rombo */}
              <text x={salX + 4} y={salY - 4} fontSize={9} fill="#dc2626" fontWeight="700">No</text>
            </g>
          )
        })}
      </svg>
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
                        <input
                          type="number"
                          min={1}
                          max={proc.actividades.length}
                          placeholder="paso #"
                          value={act.paso_no || ''}
                          onChange={e => actualizarActividad(i, 'paso_no', e.target.value ? parseInt(e.target.value) : null)}
                          style={{ width: '60px', textAlign: 'center', fontSize: '0.78rem', padding: '4px 4px' }}
                          title="Número de paso al que regresa si la respuesta es NO"
                        />
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
