const pool = require('../config/db')

// ── GET /manuales ─────────────────────────────────────────────────────────────
const getManuales = async (req, res) => {
  try {
    const { id_usuario, rol } = req.usuario
    let result
    if (rol === 'administrador') {
      result = await pool.query(
        `SELECT m.*, u.nombre as creado_por_nombre 
         FROM manuales m JOIN usuarios u ON m.creado_por = u.id_usuario 
         ORDER BY m.fecha_creacion DESC`
      )
    } else {
      result = await pool.query(
        `SELECT m.*, u.nombre as creado_por_nombre 
         FROM manuales m JOIN usuarios u ON m.creado_por = u.id_usuario 
         WHERE m.creado_por = $1 ORDER BY m.fecha_creacion DESC`,
        [id_usuario]
      )
    }
    res.json(result.rows)
  } catch (error) {
    console.error('Error en getManuales:', error.message)
    res.status(500).json({ error: error.message })
  }
}

// ── GET /manuales/:id ─────────────────────────────────────────────────────────
const getManualById = async (req, res) => {
  try {
    const { id } = req.params
    const { id_usuario, rol } = req.usuario

    const manualRes = await pool.query(
      `SELECT m.*, u.nombre AS creado_por_nombre
       FROM manuales m JOIN usuarios u ON m.creado_por = u.id_usuario
       WHERE m.id_manual = $1`,
      [id]
    )
    if (manualRes.rows.length === 0)
      return res.status(404).json({ error: 'Manual no encontrado' })

    const manual = manualRes.rows[0]
    if (rol !== 'administrador' && manual.creado_por !== id_usuario)
      return res.status(403).json({ error: 'Acceso denegado' })

    // Secciones de texto
    const seccionesRes = await pool.query(
      `SELECT tipo_seccion, contenido FROM secciones_manual
       WHERE id_manual = $1 ORDER BY orden`, [id]
    )
    const secciones = {}
    seccionesRes.rows.forEach(s => { secciones[s.tipo_seccion] = s.contenido })

    // Principios y valores guardados como JSON string
    let principios = []
    let valores = []
    try { principios = secciones.principios ? JSON.parse(secciones.principios) : [] } catch { principios = [] }
    try { valores    = secciones.valores    ? JSON.parse(secciones.valores)    : [] } catch { valores = [] }

    // Marco normativo
    const normativoRes = await pool.query(
      `SELECT nombre_norma AS nombre,
              TO_CHAR(fecha_publicacion, 'YYYY-MM-DD') AS fecha,
              medio_publicacion AS medio
       FROM marco_normativo WHERE id_manual = $1 ORDER BY id_norma`, [id]
    )

    // Marco conceptual
    const conceptualRes = await pool.query(
      `SELECT termino, definicion FROM marco_conceptual
       WHERE id_manual = $1 ORDER BY id_termino`, [id]
    )

    // Políticas de operación
    const politicasRes = await pool.query(
      `SELECT area, descripcion FROM politicas_operacion
       WHERE id_manual = $1 ORDER BY id_politica`, [id]
    )

    // Organigramas
    const organigamasRes = await pool.query(
      `SELECT tipo, ruta_archivo FROM organigramas
       WHERE id_manual = $1 ORDER BY id_organigrama`, [id]
    )
    const orgGeneral      = organigamasRes.rows.find(o => o.tipo === 'general') || null
    const orgsEspecificos = organigamasRes.rows.filter(o => o.tipo !== 'general')

    // Inventario de puestos
    const inventarioRes = await pool.query(
      `SELECT nombre_puesto, numero_personas AS num_personas
       FROM puestos WHERE id_manual = $1 ORDER BY id_puesto`, [id]
    )

    // Descripción de puestos — horario viene de descripcion_puesto (dp)
    const puestosRes = await pool.query(
      `SELECT p.id_puesto, p.nombre_puesto, p.titular, p.numero_personas,
              p2.nombre_puesto AS jefe_inmediato,
              dp.objetivo, dp.autoridad, dp.indicador_desempeno, dp.horario,
              pp.escolaridad, pp.especialidad, pp.experiencia
       FROM puestos p
       LEFT JOIN puestos p2            ON p.jefe_inmediato_id = p2.id_puesto
       LEFT JOIN descripcion_puesto dp ON dp.id_puesto = p.id_puesto
       LEFT JOIN perfil_puesto pp      ON pp.id_puesto = p.id_puesto
       WHERE p.id_manual = $1 ORDER BY p.id_puesto`, [id]
    )

    const puestos = await Promise.all(
      puestosRes.rows.map(async (p) => {
        const funcionesRes = await pool.query(
          `SELECT tipo_funcion, descripcion FROM funciones_puesto
           WHERE id_puesto = $1 ORDER BY id_funcion`, [p.id_puesto]
        )
        const competenciasRes = await pool.query(
          `SELECT tipo, descripcion FROM competencias_puesto
           WHERE id_puesto = $1 ORDER BY id_competencia`, [p.id_puesto]
        )
        return {
          nombre_puesto:             p.nombre_puesto,
          jefe_inmediato:            p.jefe_inmediato            || '',
          objetivo_puesto:           p.objetivo                  || '',
          autoridad:                 p.autoridad ? [p.autoridad] : [],
          indicador_desempeno:       p.indicador_desempeno ? [p.indicador_desempeno] : [],
          horario_laboral:           p.horario                   || '',
          escolaridad:               p.escolaridad               || '',
          especialidad:              p.especialidad              || '',
          experiencia:               p.experiencia               || '',
          ocupante_nombre:           p.titular                   || '',
          funciones_institucionales: funcionesRes.rows.filter(f => f.tipo_funcion === 'institucional').map(f => f.descripcion),
          funciones_propias:         funcionesRes.rows.filter(f => f.tipo_funcion === 'propia').map(f => f.descripcion),
          habilidades_directivas:    competenciasRes.rows.filter(c => c.tipo === 'directiva').map(c => c.descripcion),
          habilidades_tecnicas:      competenciasRes.rows.filter(c => c.tipo === 'tecnica').map(c => c.descripcion),
          habilidades_generales:     competenciasRes.rows.filter(c => c.tipo === 'general').map(c => c.descripcion),
          actitudes:                 competenciasRes.rows.filter(c => c.tipo === 'actitud').map(c => c.descripcion),
        }
      })
    )

    // Procedimientos
    let procedimientos = []
    if (manual.tipo_manual === 'procedimientos') {
      const procsRes = await pool.query(
        `SELECT p.id_procedimiento, p.codigo, p.nombre, p.version,
                TO_CHAR(p.fecha_emision, 'YYYY-MM-DD') AS fecha_emision,
                pd.objetivo, pd.alcance, pd.responsabilidades,
                pd.definiciones, pd.referencias, pd.registros
         FROM procedimientos p
         LEFT JOIN procedimiento_detalle pd ON pd.id_procedimiento = p.id_procedimiento
         WHERE p.id_manual = $1 ORDER BY p.orden, p.id_procedimiento`, [id]
      )
      procedimientos = await Promise.all(
        procsRes.rows.map(async (proc) => {
          const pasosRes = await pool.query(
            `SELECT numero_paso, responsable, descripcion FROM pasos_procedimiento
             WHERE id_procedimiento = $1 ORDER BY numero_paso`,
            [proc.id_procedimiento]
          )
          return {
            codigo:            proc.codigo            || '',
            nombre:            proc.nombre            || '',
            version:           proc.version != null ? String(proc.version).padStart(2, '0') : '00',
            fecha_emision:     proc.fecha_emision     || '',
            objetivo:          proc.objetivo          || '',
            alcance:           proc.alcance           || '',
            responsabilidades: proc.responsabilidades || '',
            definiciones:      proc.definiciones      || '',
            referencias:       proc.referencias       || '',
            registros:         proc.registros         || '',
            actividades:       pasosRes.rows.map(p => ({
              responsable: p.responsable || '',
              descripcion: p.descripcion || '',
            })),
          }
        })
      )
    }

    // Historial
    const historialRes = await pool.query(
      `SELECT version::text AS revision_actual,
              razon_cambio  AS razon,
              TO_CHAR(fecha, 'YYYY-MM-DD') AS fecha
       FROM historial_versiones WHERE id_manual = $1 ORDER BY fecha DESC`, [id]
    )

    res.json({
      id_manual:                manual.id_manual,
      tipo_manual:              manual.tipo_manual,
      codigo:                   manual.codigo        || '',
      dependencia:              manual.dependencia   || '',
      version:                  manual.version,
      fecha_elaboracion:        manual.fecha_emision
                                  ? String(manual.fecha_emision).split('T')[0]
                                  : '',
      estado:                   manual.estado,
      creado_por_nombre:        manual.creado_por_nombre,
      fecha_creacion:           manual.fecha_creacion,
      introduccion:             secciones.introduccion     || '',
      antecedentes:             secciones.antecedentes     || '',
      atribuciones:             secciones.atribuciones     || '',
      objetivo_general:         secciones.objetivo_general || '',
      mision:                   secciones.mision           || '',
      vision:                   secciones.vision           || '',
      superior_nombre:          secciones.superior_nombre  || '',
      superior_cargo:           secciones.superior_cargo   || '',
      // ── Procedimientos ──────────────────────────────
      titular:                  secciones.titular          || '',
      cargo_titular:            secciones.cargo_titular    || '',
      // ── Carátula de autorizaciones ──────────────────
      elaboro_nombre:           secciones.elaboro_nombre   || '',
      elaboro_cargo:            secciones.elaboro_cargo    || '',
      reviso_nombre:            secciones.reviso_nombre    || '',
      reviso_cargo:             secciones.reviso_cargo     || '',
      autorizo_nombre:          secciones.autorizo_nombre  || '',
      autorizo_cargo:           secciones.autorizo_cargo   || '',
      valido_nombre:            secciones.valido_nombre    || '',
      valido_cargo:             secciones.valido_cargo     || '',
      principios,
      valores,
      marco_normativo:          normativoRes.rows,
      marco_conceptual:         conceptualRes.rows,
      politicas_operacion:      politicasRes.rows,
      inventario_puestos:       inventarioRes.rows,
      puestos,
      procedimientos,
      cambios:                  historialRes.rows,
      organigrama_general:      orgGeneral,
      organigramas_especificos: orgsEspecificos,
    })
  } catch (error) {
    console.error('❌ Error en getManualById:', error.message)
    console.error('📍 Stack:', error.stack)
    res.status(500).json({ error: error.message })
  }
}

// ── POST /manuales ────────────────────────────────────────────────────────────
const crearManual = async (req, res) => {
  const client = await pool.connect()

  // ── LOG DE DIAGNÓSTICO — quitar cuando todo funcione ──────────────────────
  console.log('\n📦 [crearManual] BODY RECIBIDO:')
  console.log('  tipo_manual:       ', req.body.tipo_manual)
  console.log('  codigo:            ', req.body.codigo)
  console.log('  dependencia:       ', req.body.dependencia)
  console.log('  fecha_elaboracion: ', req.body.fecha_elaboracion)
  console.log('  introduccion:      ', req.body.introduccion       ? 'SÍ' : 'NO')
  console.log('  antecedentes:      ', req.body.antecedentes       ? 'SÍ' : 'NO')
  console.log('  atribuciones:      ', req.body.atribuciones       ? 'SÍ' : 'NO')
  console.log('  objetivo_general:  ', req.body.objetivo_general   ? 'SÍ' : 'NO')
  console.log('  mision:            ', req.body.mision             ? 'SÍ' : 'NO')
  console.log('  vision:            ', req.body.vision             ? 'SÍ' : 'NO')
  console.log('  marco_normativo:   ', req.body.marco_normativo?.length    || 0, 'items')
  console.log('  marco_conceptual:  ', req.body.marco_conceptual?.length   || 0, 'items')
  console.log('  principios:        ', req.body.principios?.length         || 0, 'items')
  console.log('  valores:           ', req.body.valores?.length            || 0, 'items')
  console.log('  politicas:         ', req.body.politicas_operacion?.length|| 0, 'items')
  console.log('  inventario_puestos:', req.body.inventario_puestos?.length || 0, 'items')
  console.log('  puestos:           ', req.body.puestos?.length            || 0, 'items')
  console.log('  procedimientos:    ', req.body.procedimientos?.length     || 0, 'items')
  console.log('  titular:           ', req.body.titular)
  console.log('  cargo_titular:     ', req.body.cargo_titular)
  console.log('─────────────────────────────────────────────\n')
  // ── FIN LOG ───────────────────────────────────────────────────────────────

  try {
    await client.query('BEGIN')
    const { id_usuario } = req.usuario
    const {
  tipo_manual, codigo, dependencia, version, fecha_elaboracion,
  introduccion, antecedentes, atribuciones, objetivo_general, mision, vision,
  marco_normativo, marco_conceptual,
  superior_nombre, superior_cargo,
  principios, valores, politicas_operacion,
  inventario_puestos, puestos,
  procedimientos,
  // Procedimientos
  titular, cargo_titular,
  // Carátula de autorizaciones (organización)
  elaboro_nombre, elaboro_cargo,
  reviso_nombre, reviso_cargo,
  autorizo_nombre, autorizo_cargo,
  valido_nombre, valido_cargo,
} = req.body

    // 1. Manual base
    const manualResult = await client.query(
      `INSERT INTO manuales (creado_por, tipo_manual, codigo, dependencia, version, fecha_emision, estado)
       VALUES ($1, $2, $3, $4, $5, $6, 'borrador') RETURNING *`,
      [id_usuario, tipo_manual, codigo, dependencia, version || 1, fecha_elaboracion || null]
    )
    const manual    = manualResult.rows[0]
    const id_manual = manual.id_manual

    // 2. Secciones de texto
    const secciones = [
  { tipo: 'introduccion',     contenido: introduccion },
  { tipo: 'antecedentes',     contenido: antecedentes },
  { tipo: 'atribuciones',     contenido: atribuciones },
  { tipo: 'objetivo_general', contenido: objetivo_general },
  { tipo: 'mision',           contenido: mision },
  { tipo: 'vision',           contenido: vision },
  { tipo: 'superior_nombre',  contenido: superior_nombre },
  { tipo: 'superior_cargo',   contenido: superior_cargo },
  { tipo: 'principios',       contenido: principios?.length ? JSON.stringify(principios) : null },
  { tipo: 'valores',          contenido: valores?.length    ? JSON.stringify(valores)    : null },
  // ── Procedimientos ────────────────────────────────
  { tipo: 'titular',          contenido: titular },
  { tipo: 'cargo_titular',    contenido: cargo_titular },
  // ── Carátula de autorizaciones (organización) ─────
  { tipo: 'elaboro_nombre',   contenido: elaboro_nombre },
  { tipo: 'elaboro_cargo',    contenido: elaboro_cargo },
  { tipo: 'reviso_nombre',    contenido: reviso_nombre },
  { tipo: 'reviso_cargo',     contenido: reviso_cargo },
  { tipo: 'autorizo_nombre',  contenido: autorizo_nombre },
  { tipo: 'autorizo_cargo',   contenido: autorizo_cargo },
  { tipo: 'valido_nombre',    contenido: valido_nombre },
  { tipo: 'valido_cargo',     contenido: valido_cargo },
]
    for (let i = 0; i < secciones.length; i++) {
      const s = secciones[i]
      if (s.contenido) {
        await client.query(
          `INSERT INTO secciones_manual (id_manual, tipo_seccion, contenido, orden)
           VALUES ($1, $2, $3, $4)`,
          [id_manual, s.tipo, s.contenido, i + 1]
        )
      }
    }

    // 3. Marco normativo
    for (const norma of (marco_normativo || [])) {
      await client.query(
        `INSERT INTO marco_normativo (id_manual, nombre_norma, fecha_publicacion, medio_publicacion)
         VALUES ($1, $2, $3, $4)`,
        [id_manual, norma.nombre, norma.fecha || null, norma.medio]
      )
    }

    // 4. Marco conceptual
    for (const c of (marco_conceptual || [])) {
      await client.query(
        `INSERT INTO marco_conceptual (id_manual, termino, definicion) VALUES ($1, $2, $3)`,
        [id_manual, c.termino, c.definicion]
      )
    }

    // 5. Políticas de operación
    for (const pol of (politicas_operacion || [])) {
      await client.query(
        `INSERT INTO politicas_operacion (id_manual, area, descripcion) VALUES ($1, $2, $3)`,
        [id_manual, pol.area, pol.descripcion]
      )
    }

    // 6. Inventario de puestos
    for (const p of (inventario_puestos || [])) {
      await client.query(
        `INSERT INTO puestos (id_manual, nombre_puesto, numero_personas) VALUES ($1, $2, $3)`,
        [id_manual, p.nombre_puesto, p.num_personas || 1]
      )
    }

    // 7. Descripción de puestos completa
    for (const p of (puestos || [])) {
      const puestoRes = await client.query(
        `INSERT INTO puestos (id_manual, nombre_puesto, titular, numero_personas)
         VALUES ($1, $2, $3, $4) RETURNING id_puesto`,
        [id_manual, p.nombre_puesto, p.ocupante_nombre || null, 1]
      )
      const id_puesto = puestoRes.rows[0].id_puesto

      await client.query(
        `INSERT INTO descripcion_puesto (id_puesto, objetivo, autoridad, indicador_desempeno, horario)
         VALUES ($1, $2, $3, $4, $5)`,
        [id_puesto, p.objetivo_puesto || null, p.autoridad?.[0] || null, p.indicador_desempeno?.[0] || null, p.horario_laboral || null]
      )

      await client.query(
        `INSERT INTO perfil_puesto (id_puesto, escolaridad, especialidad, experiencia)
         VALUES ($1, $2, $3, $4)`,
        [id_puesto, p.escolaridad || null, p.especialidad || null, p.experiencia || null]
      )

      for (const f of (p.funciones_institucionales || [])) {
        if (f) await client.query(
          `INSERT INTO funciones_puesto (id_puesto, tipo_funcion, descripcion) VALUES ($1, 'institucional', $2)`,
          [id_puesto, f]
        )
      }
      for (const f of (p.funciones_propias || [])) {
        if (f) await client.query(
          `INSERT INTO funciones_puesto (id_puesto, tipo_funcion, descripcion) VALUES ($1, 'propia', $2)`,
          [id_puesto, f]
        )
      }

      const competencias = [
        ...(p.habilidades_directivas || []).map(d => ({ tipo: 'directiva', descripcion: d })),
        ...(p.habilidades_tecnicas   || []).map(d => ({ tipo: 'tecnica',   descripcion: d })),
        ...(p.habilidades_generales  || []).map(d => ({ tipo: 'general',   descripcion: d })),
        ...(p.actitudes              || []).map(d => ({ tipo: 'actitud',   descripcion: d })),
      ]
      for (const c of competencias) {
        if (c.descripcion) await client.query(
          `INSERT INTO competencias_puesto (id_puesto, tipo, descripcion) VALUES ($1, $2, $3)`,
          [id_puesto, c.tipo, c.descripcion]
        )
      }
    }

    // 8. Procedimientos
    for (const proc of (procedimientos || [])) {
      const procResult = await client.query(
        `INSERT INTO procedimientos (id_manual, codigo, version, nombre, fecha_emision, tipo)
         VALUES ($1, $2, $3, $4, $5, 'administrativo') RETURNING id_procedimiento`,
        [id_manual, proc.codigo, proc.version || '00', proc.nombre, proc.fecha_emision || null]
      )
      const id_procedimiento = procResult.rows[0].id_procedimiento

      await client.query(
        `INSERT INTO procedimiento_detalle (id_procedimiento, objetivo, alcance, responsabilidades, definiciones, referencias, registros)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id_procedimiento, proc.objetivo, proc.alcance, proc.responsabilidades, proc.definiciones, proc.referencias, proc.registros]
      )

      for (let i = 0; i < (proc.actividades || []).length; i++) {
        const act = proc.actividades[i]
        await client.query(
          `INSERT INTO pasos_procedimiento (id_procedimiento, numero_paso, responsable, descripcion)
           VALUES ($1, $2, $3, $4)`,
          [id_procedimiento, i + 1, act.responsable, act.descripcion]
        )
      }
    }

    await client.query('COMMIT')
    res.status(201).json({ mensaje: 'Manual guardado correctamente', manual })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ Error en crearManual:', error.message)
    console.error('📍 Stack:', error.stack)
    res.status(500).json({ error: error.message })
  } finally {
    client.release()
  }
}

// ── PUT /manuales/:id ─────────────────────────────────────────────────────────
const actualizarManual = async (req, res) => {
  const client = await pool.connect()

  // ── LOG DE DIAGNÓSTICO ────────────────────────────────────────────────────
  console.log('\n📦 [actualizarManual] BODY RECIBIDO:')
  console.log('  id_manual:         ', req.params.id)
  console.log('  tipo_manual:       ', req.body.tipo_manual)
  console.log('  codigo:            ', req.body.codigo)
  console.log('  fecha_elaboracion: ', req.body.fecha_elaboracion)
  console.log('  introduccion:      ', req.body.introduccion       ? 'SÍ' : 'NO')
  console.log('  mision:            ', req.body.mision             ? 'SÍ' : 'NO')
  console.log('  marco_normativo:   ', req.body.marco_normativo?.length    || 0, 'items')
  console.log('  procedimientos:    ', req.body.procedimientos?.length     || 0, 'items')
  console.log('  principios:        ', req.body.principios?.length         || 0, 'items')
  console.log('  politicas:         ', req.body.politicas_operacion?.length|| 0, 'items')
  console.log('─────────────────────────────────────────────\n')
  // ── FIN LOG ───────────────────────────────────────────────────────────────

  try {
    await client.query('BEGIN')
    const { id } = req.params
    const { id_usuario, rol } = req.usuario

    const manualRes = await client.query(
      'SELECT creado_por, estado, tipo_manual FROM manuales WHERE id_manual = $1', [id]
    )
    if (manualRes.rows.length === 0)
      return res.status(404).json({ error: 'Manual no encontrado' })

    const manual = manualRes.rows[0]
    if (rol !== 'administrador' && manual.creado_por !== id_usuario)
      return res.status(403).json({ error: 'Acceso denegado' })
    if (!['borrador', 'observaciones'].includes(manual.estado))
      return res.status(400).json({ error: `No se puede editar un manual en estado "${manual.estado}"` })

    const {
      codigo, dependencia, version, fecha_elaboracion,
      introduccion, antecedentes, atribuciones, objetivo_general, mision, vision,
      superior_nombre, superior_cargo, principios, valores,
      marco_normativo, marco_conceptual,
      politicas_operacion, inventario_puestos, puestos,
      procedimientos,
    } = req.body

    // 1. Datos base
    await client.query(
      `UPDATE manuales SET codigo=$1, dependencia=$2, version=$3, fecha_emision=$4 WHERE id_manual=$5`,
      [codigo, dependencia, version || 1, fecha_elaboracion || null, id]
    )

    // 2. Secciones
    await client.query('DELETE FROM secciones_manual WHERE id_manual = $1', [id])
    const secciones = [
  { tipo: 'introduccion',     contenido: introduccion },
  { tipo: 'antecedentes',     contenido: antecedentes },
  { tipo: 'atribuciones',     contenido: atribuciones },
  { tipo: 'objetivo_general', contenido: objetivo_general },
  { tipo: 'mision',           contenido: mision },
  { tipo: 'vision',           contenido: vision },
  { tipo: 'superior_nombre',  contenido: superior_nombre },
  { tipo: 'superior_cargo',   contenido: superior_cargo },
  { tipo: 'principios',       contenido: principios?.length ? JSON.stringify(principios) : null },
  { tipo: 'valores',          contenido: valores?.length    ? JSON.stringify(valores)    : null },
  // ── Procedimientos ────────────────────────────────
  { tipo: 'titular',          contenido: titular },
  { tipo: 'cargo_titular',    contenido: cargo_titular },
  // ── Carátula de autorizaciones (organización) ─────
  { tipo: 'elaboro_nombre',   contenido: elaboro_nombre },
  { tipo: 'elaboro_cargo',    contenido: elaboro_cargo },
  { tipo: 'reviso_nombre',    contenido: reviso_nombre },
  { tipo: 'reviso_cargo',     contenido: reviso_cargo },
  { tipo: 'autorizo_nombre',  contenido: autorizo_nombre },
  { tipo: 'autorizo_cargo',   contenido: autorizo_cargo },
  { tipo: 'valido_nombre',    contenido: valido_nombre },
  { tipo: 'valido_cargo',     contenido: valido_cargo },
]
    for (let i = 0; i < secciones.length; i++) {
      const s = secciones[i]
      if (s.contenido) {
        await client.query(
          `INSERT INTO secciones_manual (id_manual, tipo_seccion, contenido, orden) VALUES ($1,$2,$3,$4)`,
          [id, s.tipo, s.contenido, i + 1]
        )
      }
    }

    // 3. Marco normativo
    await client.query('DELETE FROM marco_normativo WHERE id_manual = $1', [id])
    for (const norma of (marco_normativo || [])) {
      await client.query(
        `INSERT INTO marco_normativo (id_manual, nombre_norma, fecha_publicacion, medio_publicacion)
         VALUES ($1,$2,$3,$4)`,
        [id, norma.nombre, norma.fecha || null, norma.medio]
      )
    }

    // 4. Marco conceptual
    await client.query('DELETE FROM marco_conceptual WHERE id_manual = $1', [id])
    for (const c of (marco_conceptual || [])) {
      await client.query(
        `INSERT INTO marco_conceptual (id_manual, termino, definicion) VALUES ($1,$2,$3)`,
        [id, c.termino, c.definicion]
      )
    }

    // 5. Políticas de operación
    await client.query('DELETE FROM politicas_operacion WHERE id_manual = $1', [id])
    for (const pol of (politicas_operacion || [])) {
      await client.query(
        `INSERT INTO politicas_operacion (id_manual, area, descripcion) VALUES ($1,$2,$3)`,
        [id, pol.area, pol.descripcion]
      )
    }

    // 6. Puestos (CASCADE elimina descripciones, perfiles, funciones, competencias)
    await client.query('DELETE FROM puestos WHERE id_manual = $1', [id])

    for (const p of (inventario_puestos || [])) {
      await client.query(
        `INSERT INTO puestos (id_manual, nombre_puesto, numero_personas) VALUES ($1,$2,$3)`,
        [id, p.nombre_puesto, p.num_personas || 1]
      )
    }

    for (const p of (puestos || [])) {
      const puestoRes = await client.query(
        `INSERT INTO puestos (id_manual, nombre_puesto, titular, numero_personas)
         VALUES ($1,$2,$3,$4) RETURNING id_puesto`,
        [id, p.nombre_puesto, p.ocupante_nombre || null, 1]
      )
      const id_puesto = puestoRes.rows[0].id_puesto

      await client.query(
        `INSERT INTO descripcion_puesto (id_puesto, objetivo, autoridad, indicador_desempeno, horario)
         VALUES ($1,$2,$3,$4,$5)`,
        [id_puesto, p.objetivo_puesto || null, p.autoridad?.[0] || null, p.indicador_desempeno?.[0] || null, p.horario_laboral || null]
      )

      await client.query(
        `INSERT INTO perfil_puesto (id_puesto, escolaridad, especialidad, experiencia)
         VALUES ($1,$2,$3,$4)`,
        [id_puesto, p.escolaridad || null, p.especialidad || null, p.experiencia || null]
      )

      for (const f of (p.funciones_institucionales || [])) {
        if (f) await client.query(
          `INSERT INTO funciones_puesto (id_puesto, tipo_funcion, descripcion) VALUES ($1,'institucional',$2)`,
          [id_puesto, f]
        )
      }
      for (const f of (p.funciones_propias || [])) {
        if (f) await client.query(
          `INSERT INTO funciones_puesto (id_puesto, tipo_funcion, descripcion) VALUES ($1,'propia',$2)`,
          [id_puesto, f]
        )
      }

      const competencias = [
        ...(p.habilidades_directivas || []).map(d => ({ tipo: 'directiva', descripcion: d })),
        ...(p.habilidades_tecnicas   || []).map(d => ({ tipo: 'tecnica',   descripcion: d })),
        ...(p.habilidades_generales  || []).map(d => ({ tipo: 'general',   descripcion: d })),
        ...(p.actitudes              || []).map(d => ({ tipo: 'actitud',   descripcion: d })),
      ]
      for (const c of competencias) {
        if (c.descripcion) await client.query(
          `INSERT INTO competencias_puesto (id_puesto, tipo, descripcion) VALUES ($1,$2,$3)`,
          [id_puesto, c.tipo, c.descripcion]
        )
      }
    }

    // 7. Procedimientos
    await client.query('DELETE FROM procedimientos WHERE id_manual = $1', [id])
    for (const proc of (procedimientos || [])) {
      const procResult = await client.query(
        `INSERT INTO procedimientos (id_manual, codigo, version, nombre, fecha_emision, tipo)
         VALUES ($1,$2,$3,$4,$5,'administrativo') RETURNING id_procedimiento`,
        [id, proc.codigo, proc.version || '00', proc.nombre, proc.fecha_emision || null]
      )
      const id_procedimiento = procResult.rows[0].id_procedimiento

      await client.query(
        `INSERT INTO procedimiento_detalle (id_procedimiento, objetivo, alcance, responsabilidades, definiciones, referencias, registros)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [id_procedimiento, proc.objetivo, proc.alcance, proc.responsabilidades, proc.definiciones, proc.referencias, proc.registros]
      )

      for (let i = 0; i < (proc.actividades || []).length; i++) {
        const act = proc.actividades[i]
        await client.query(
          `INSERT INTO pasos_procedimiento (id_procedimiento, numero_paso, responsable, descripcion)
           VALUES ($1,$2,$3,$4)`,
          [id_procedimiento, i + 1, act.responsable, act.descripcion]
        )
      }
    }

    await client.query('COMMIT')
    res.json({ mensaje: 'Manual actualizado correctamente' })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ Error en actualizarManual:', error.message)
    console.error('📍 Stack:', error.stack)
    res.status(500).json({ error: error.message })
  } finally {
    client.release()
  }
}

// ── PATCH /manuales/:id/estado ────────────────────────────────────────────────
const cambiarEstado = async (req, res) => {
  try {
    const { id } = req.params
    const { estado } = req.body
    const { id_usuario, rol } = req.usuario

    const estadosValidos = ['borrador', 'en_revision', 'observaciones', 'validado', 'autorizado']
    if (!estadosValidos.includes(estado))
      return res.status(400).json({ error: 'Estado no válido' })

    const manualRes = await pool.query(
      'SELECT creado_por, estado FROM manuales WHERE id_manual = $1', [id]
    )
    if (manualRes.rows.length === 0)
      return res.status(404).json({ error: 'Manual no encontrado' })

    const manual = manualRes.rows[0]

    if (rol === 'sujeto_obligado') {
      if (manual.creado_por !== id_usuario)
        return res.status(403).json({ error: 'Acceso denegado' })
      const permitidas = { borrador: ['en_revision'], observaciones: ['en_revision'] }
      if (!permitidas[manual.estado]?.includes(estado))
        return res.status(400).json({ error: `No puedes cambiar de "${manual.estado}" a "${estado}"` })
    }

    if (rol === 'administrador') {
      const permitidas = {
        en_revision:   ['observaciones', 'validado', 'autorizado', 'borrador'],
        validado:      ['autorizado'],
        observaciones: ['validado', 'autorizado'],
      }
      if (!permitidas[manual.estado]?.includes(estado))
        return res.status(400).json({ error: `Transición no permitida de "${manual.estado}" a "${estado}"` })
    }

    await pool.query('UPDATE manuales SET estado=$1 WHERE id_manual=$2', [estado, id])
    await pool.query(
      `INSERT INTO historial_versiones (id_manual, usuario, version, razon_cambio)
       VALUES ($1,$2,(SELECT version FROM manuales WHERE id_manual=$1),$3)`,
      [id, id_usuario, `Cambio de estado: ${manual.estado} → ${estado}`]
    )

    res.json({ mensaje: 'Estado actualizado correctamente', estado })
  } catch (error) {
    console.error('❌ Error en cambiarEstado:', error.message)
    res.status(500).json({ error: error.message })
  }
}

const eliminarManuales = async (req, res) => {
  const client = await pool.connect()
  try {
    const { ids } = req.body
    const { id_usuario, rol } = req.usuario

    if (!ids || ids.length === 0)
      return res.status(400).json({ error: 'No se enviaron IDs' })

    if (rol === 'administrador') {
      await client.query(
        `DELETE FROM manuales WHERE id_manual = ANY($1)`,
        [ids]
      )
    } else {
      await client.query(
        `DELETE FROM manuales 
         WHERE id_manual = ANY($1) 
         AND creado_por = $2 
         AND estado = 'borrador'`,
        [ids, id_usuario]
      )
    }

    res.json({ mensaje: 'Manuales eliminados correctamente' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  } finally {
    client.release()
  }
}

module.exports = { getManuales, getManualById, crearManual, actualizarManual, cambiarEstado, eliminarManuales }