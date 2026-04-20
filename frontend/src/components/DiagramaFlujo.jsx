const COLORES_LANE = [
  { bg: '#eff6ff', stroke: '#3b82f6', texto: '#1e3a5f', header: '#bfdbfe' },
  { bg: '#f0fdf4', stroke: '#22c55e', texto: '#14532d', header: '#bbf7d0' },
  { bg: '#fdf4ff', stroke: '#a855f7', texto: '#581c87', header: '#e9d5ff' },
  { bg: '#fff7ed', stroke: '#f97316', texto: '#7c2d12', header: '#fed7aa' },
  { bg: '#fefce8', stroke: '#eab308', texto: '#713f12', header: '#fef08a' },
  { bg: '#f0f9ff', stroke: '#06b6d4', texto: '#164e63', header: '#a5f3fc' },
  { bg: '#fdf2f8', stroke: '#ec4899', texto: '#831843', header: '#fbcfe8' },
  { bg: '#f8fafc', stroke: '#64748b', texto: '#1e293b', header: '#cbd5e1' },
]

// Paleta de colores para flechas "No" — distintos entre sí
const COLORES_NO = [
  '#dc2626', // rojo
  '#7c3aed', // violeta
  '#0369a1', // azul oscuro
  '#b45309', // ámbar oscuro
  '#0f766e', // teal
  '#be185d', // rosa oscuro
]

function textoLineas(texto, maxChars = 25) {
  const segmentos = (texto || '').split(/\r?\n/)
  const lineas = []
  segmentos.forEach(seg => {
    const palabras = seg.split(' ').filter(Boolean)
    if (palabras.length === 0) { lineas.push(''); return }
    let linea = ''
    palabras.forEach(p => {
      const candidato = linea ? linea + ' ' + p : p
      if (candidato.length > maxChars) {
        if (linea) lineas.push(linea)
        // palabra muy larga: partirla en trozos
        while (p.length > maxChars) {
          lineas.push(p.slice(0, maxChars))
          p = p.slice(maxChars)
        }
        linea = p
      } else {
        linea = candidato
      }
    })
    if (linea) lineas.push(linea)
  })
  return lineas.length ? lineas : ['']
}

export default function DiagramaFlujo({ actividades }) {
  if (!actividades || actividades.length === 0) return null

  const PASO_COL_W  = 28
  const LANE_W      = 190
  const HEADER_H    = 46
  const NODE_W      = 155
  const NODE_H_MIN  = 56
  const DEC_HW      = 72
  const DEC_HH_MIN  = 40
  const OVAL_RX     = 54
  const OVAL_RY     = 19
  const PAD         = 20
  const LINE_H      = 12
  const NODE_PAD    = 28  // padding vertical dentro del nodo
  const ROW_MARGIN  = 40  // espacio mínimo entre nodos
  const GUIA_SEP    = 14

  // ── Pre-computar decisiones con retorno válido ──────────────────────────
  // decRetornos[i] = índice k entre todas las decisiones con retorno (0,1,2…) o -1
  const decRetornos = actividades.map(() => -1)
  let contadorDec = 0
  actividades.forEach((a, i) => {
    const destino = parseInt(a.paso_no)
    if (a.tipo === 'decision' && destino && destino >= 1 && destino <= actividades.length && destino !== i + 1) {
      decRetornos[i] = contadorDec++
    }
  })
  const numRetornos = contadorDec
  // Ancho de la zona de retorno: mínimo 48, crece con el número de guías
  const RETORNO_W = Math.max(48, numRetornos * GUIA_SEP + 20)

  // ── Layout general ──────────────────────────────────────────────────────
  const lanes = []
  actividades.forEach(a => {
    const r = (a.responsable || 'Sin responsable').trim() || 'Sin responsable'
    if (!lanes.includes(r)) lanes.push(r)
  })

  const lanesW     = lanes.length * LANE_W
  const svgW       = PASO_COL_W + lanesW + RETORNO_W
  const inicioY    = HEADER_H + PAD
  const stepStartY = inicioY + OVAL_RY * 2 + 26

  const laneX      = i => PASO_COL_W + i * LANE_W
  const laneCX     = i => laneX(i) + LANE_W / 2
  const guiaXparaK = k => PASO_COL_W + lanesW + RETORNO_W - 8 - k * GUIA_SEP

  const nodeCX = i => {
    const lane = (actividades[i].responsable || 'Sin responsable').trim() || 'Sin responsable'
    return laneCX(lanes.indexOf(lane))
  }

  // ── Alturas dinámicas: cada nodo crece con su contenido ───────────────────
  const allLines = actividades.map((a, i) => textoLineas(a.descripcion || `Paso ${i + 1}`))

  const nodeHFor = i => {
    const tipo   = actividades[i].tipo || 'actividad'
    const needed = allLines[i].length * LINE_H + NODE_PAD
    return tipo === 'decision' ? Math.max(DEC_HH_MIN * 2, needed) : Math.max(NODE_H_MIN, needed)
  }

  const decHHFor = i => nodeHFor(i) / 2

  // Posiciones Y acumulativas (cada fila ocupa su propia altura)
  const stepCYArr = actividades.reduce((acc, _, i) => {
    const prevBottom = i === 0 ? stepStartY : acc[i - 1] + nodeHFor(i - 1) / 2 + ROW_MARGIN
    acc.push(prevBottom + nodeHFor(i) / 2)
    return acc
  }, [])

  const finY = stepCYArr.length > 0
    ? stepCYArr[stepCYArr.length - 1] + nodeHFor(actividades.length - 1) / 2 + 18
    : stepStartY + 18
  const svgH = finY + OVAL_RY * 2 + PAD

  const nodeCY      = i => stepCYArr[i]
  const nodeBottomY = i => (actividades[i].tipo || 'actividad') === 'decision' ? nodeCY(i) + decHHFor(i) : nodeCY(i) + nodeHFor(i) / 2
  const nodeTopY    = i => (actividades[i].tipo || 'actividad') === 'decision' ? nodeCY(i) - decHHFor(i) : nodeCY(i) - nodeHFor(i) / 2
  const nodeRightX  = i => (actividades[i].tipo || 'actividad') === 'decision' ? nodeCX(i) + DEC_HW : nodeCX(i) + NODE_W / 2

  const pathLShape = (x1, y1, x2, y2) => {
    if (Math.abs(x1 - x2) < 4) return `M ${x1} ${y1} L ${x2} ${y2}`
    const midY = (y1 + y2) / 2
    return `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`
  }

  return (
    <div style={{ overflowX: 'auto', marginTop: 16, border: '1px solid #e2e8f0', borderRadius: 8 }}>
      <svg width={svgW} height={svgH} style={{ display: 'block', background: '#fafafa' }}>
        <defs>
          {/* Marcador principal (gris) */}
          <marker id="arr" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#64748b" />
          </marker>
          {/* ClipPath por nodo para garantizar que el texto no se salga */}
          {actividades.map((_, i) => {
            const tipo = actividades[i].tipo || 'actividad'
            const cx = nodeCX(i), cy = nodeCY(i)
            if (tipo === 'decision') {
              const dHH = decHHFor(i)
              return (
                <clipPath key={`clip-${i}`} id={`clip-${i}`}>
                  <rect x={cx - DEC_HW + 6} y={cy - dHH + 4} width={(DEC_HW - 6) * 2} height={dHH * 2 - 8} />
                </clipPath>
              )
            }
            const nh = nodeHFor(i)
            return (
              <clipPath key={`clip-${i}`} id={`clip-${i}`}>
                <rect x={cx - NODE_W / 2 + 4} y={cy - nh / 2 + 4} width={NODE_W - 8} height={nh - 8} />
              </clipPath>
            )
          })}

          {/* Un marcador único por cada decisión con retorno */}
          {actividades.map((act, i) => {
            const k = decRetornos[i]
            if (k === -1) return null
            const color = COLORES_NO[k % COLORES_NO.length]
            return (
              <marker key={i} id={`arr-no-${i}`} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill={color} />
              </marker>
            )
          })}
        </defs>

        {/* Columna numeración */}
        <rect x={0} y={HEADER_H} width={PASO_COL_W} height={svgH - HEADER_H} fill="#f1f5f9" />
        <rect x={0} y={0} width={PASO_COL_W} height={HEADER_H} fill="#e2e8f0" />
        <text x={PASO_COL_W / 2} y={HEADER_H / 2 + 4} textAnchor="middle" fontSize={9} fill="#64748b" fontWeight="700">No.</text>

        {/* Carriles */}
        {lanes.map((lane, i) => {
          const c = COLORES_LANE[i % COLORES_LANE.length]
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

        {/* Zona de retorno */}
        {numRetornos > 0 && (
          <rect x={PASO_COL_W + lanesW} y={0} width={RETORNO_W} height={svgH} fill="#fff5f5" stroke="#fecaca" strokeWidth={0.5} />
        )}

        {/* Numeración de pasos */}
        {actividades.map((_, i) => (
          <text key={i} x={PASO_COL_W / 2} y={nodeCY(i) + 4} textAnchor="middle" fontSize={10} fill="#64748b" fontWeight="700">
            {i + 1}
          </text>
        ))}

        {/* INICIO — alineado al carril del primer paso */}
        <ellipse cx={nodeCX(0)} cy={inicioY + OVAL_RY} rx={OVAL_RX} ry={OVAL_RY} fill="#059669" />
        <text x={nodeCX(0)} y={inicioY + OVAL_RY + 4} textAnchor="middle" fontSize={11} fill="white" fontWeight="700">INICIO</text>

        {/* INICIO → primer paso */}
        {actividades.length > 0 && (
          <path d={pathLShape(nodeCX(0), inicioY + OVAL_RY * 2, nodeCX(0), nodeTopY(0) - 2)}
            fill="none" stroke="#64748b" strokeWidth={1.5} markerEnd="url(#arr)" />
        )}

        {/* Nodos */}
        {actividades.map((act, i) => {
          const tipo    = act.tipo || 'actividad'
          const cx      = nodeCX(i)
          const cy      = nodeCY(i)
          const laneIdx = lanes.indexOf((act.responsable || 'Sin responsable').trim() || 'Sin responsable')
          const c       = COLORES_LANE[laneIdx % COLORES_LANE.length]
          const lineas  = allLines[i]

          if (tipo === 'decision') {
            const dHH = decHHFor(i)
            const pts = `${cx},${cy - dHH} ${cx + DEC_HW},${cy} ${cx},${cy + dHH} ${cx - DEC_HW},${cy}`
            return (
              <g key={i}>
                <polygon points={pts} fill={c.bg} stroke={c.stroke} strokeWidth={2} />
                <g clipPath={`url(#clip-${i})`}>
                  {lineas.map((l, li) => (
                    <text key={li} x={cx} y={cy + (li - (lineas.length - 1) / 2) * LINE_H + 4}
                      textAnchor="middle" fontSize={9} fill={c.texto}>{l}</text>
                  ))}
                </g>
              </g>
            )
          }

          const nh = nodeHFor(i)
          const nx = cx - NODE_W / 2
          const ny = cy - nh / 2
          return (
            <g key={i}>
              <rect x={nx} y={ny} width={NODE_W} height={nh} rx={tipo === 'documento' ? 0 : 5}
                fill={c.bg} stroke={c.stroke} strokeWidth={2} />
              {tipo === 'documento' && (
                <>
                  <polygon points={`${nx + NODE_W - 12},${ny} ${nx + NODE_W},${ny + 12} ${nx + NODE_W - 12},${ny + 12}`}
                    fill={c.stroke} opacity={0.35} />
                  <line x1={nx + NODE_W - 12} y1={ny} x2={nx + NODE_W - 12} y2={ny + 12} stroke={c.stroke} strokeWidth={1} opacity={0.5} />
                  <line x1={nx + NODE_W - 12} y1={ny + 12} x2={nx + NODE_W} y2={ny + 12} stroke={c.stroke} strokeWidth={1} opacity={0.5} />
                </>
              )}
              <g clipPath={`url(#clip-${i})`}>
                {lineas.map((l, li) => (
                  <text key={li} x={cx} y={cy + (li - (lineas.length - 1) / 2) * LINE_H + 4}
                    textAnchor="middle" fontSize={9} fill={c.texto}>{l}</text>
                ))}
              </g>
            </g>
          )
        })}

        {/* Flechas flujo principal (Sí) */}
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
          <path d={pathLShape(nodeCX(actividades.length - 1), nodeBottomY(actividades.length - 1), nodeCX(actividades.length - 1), finY)}
            fill="none" stroke="#64748b" strokeWidth={1.5} markerEnd="url(#arr)" />
        )}

        {/* FIN — alineado al carril del último paso */}
        <ellipse cx={nodeCX(actividades.length - 1)} cy={finY + OVAL_RY} rx={OVAL_RX} ry={OVAL_RY} fill="#e11d48" />
        <text x={nodeCX(actividades.length - 1)} y={finY + OVAL_RY + 4} textAnchor="middle" fontSize={11} fill="white" fontWeight="700">FIN</text>

        {/* Flechas de retorno "No" — cada una con su propia guía escalonada y color */}
        {actividades.map((act, i) => {
          const k = decRetornos[i]
          if (k === -1) return null

          const destino    = parseInt(act.paso_no)
          const destinoIdx = destino - 1
          const color      = COLORES_NO[k % COLORES_NO.length]
          const gx         = guiaXparaK(k)

          const salX = nodeCX(i) + DEC_HW
          const salY = nodeCY(i)
          const entX = nodeRightX(destinoIdx) + 2
          const entY = nodeCY(destinoIdx)

          // Ruta: sale del rombo → va a su guía vertical propia → baja/sube → entra al nodo destino por la derecha
          const path = `M ${salX} ${salY} L ${gx} ${salY} L ${gx} ${entY} L ${entX} ${entY}`

          return (
            <g key={`no-${i}`}>
              <path d={path} fill="none" stroke={color} strokeWidth={1.5}
                strokeDasharray="5,3" markerEnd={`url(#arr-no-${i})`} />
              {/* Etiqueta "No → P.X" junto al rombo, con fondo coloreado */}
              <rect x={salX + 3} y={salY - 16} width={44} height={14} rx={3} fill={color} opacity={0.15} />
              <text x={salX + 6} y={salY - 5} fontSize={8} fill={color} fontWeight="700">
                No → P.{destino}
              </text>
            </g>
          )
        })}

        {/* Leyenda de retornos */}
        {numRetornos > 1 && (() => {
          const leyY = 6
          const leyX = PASO_COL_W + lanesW + 4
          return (
            <g>
              {actividades.map((act, i) => {
                const k = decRetornos[i]
                if (k === -1) return null
                const color = COLORES_NO[k % COLORES_NO.length]
                const destino = parseInt(act.paso_no)
                return (
                  <g key={`ley-${i}`}>
                    <line x1={leyX} y1={leyY + k * 11 + 5} x2={leyX + 10} y2={leyY + k * 11 + 5}
                      stroke={color} strokeWidth={2} strokeDasharray="3,2" />
                    <text x={leyX + 13} y={leyY + k * 11 + 8} fontSize={7} fill={color} fontWeight="700">
                      P.{i + 1}→P.{destino}
                    </text>
                  </g>
                )
              })}
            </g>
          )
        })()}
      </svg>
    </div>
  )
}
