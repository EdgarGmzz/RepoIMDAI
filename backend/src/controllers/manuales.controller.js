const pool = require('../config/db')

const getManuales = async (req, res) => {
  try {
    const { id_usuario, rol } = req.usuario

    let result

    if (rol === 'administrador') {
      result = await pool.query(
        `SELECT m.*, u.nombre as creado_por_nombre 
         FROM manuales m 
         JOIN usuarios u ON m.creado_por = u.id_usuario 
         ORDER BY m.fecha_creacion DESC`
      )
    } else {
      result = await pool.query(
        `SELECT m.*, u.nombre as creado_por_nombre 
         FROM manuales m 
         JOIN usuarios u ON m.creado_por = u.id_usuario 
         WHERE m.creado_por = $1 
         ORDER BY m.fecha_creacion DESC`,
        [id_usuario]
      )
    }

    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const crearManual = async (req, res) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { id_usuario } = req.usuario
    const {
      tipo_manual, codigo, dependencia, version,
      fecha_elaboracion, titular, cargo_titular,
      introduccion, antecedentes, marco_normativo,
      atribuciones, objetivo_general, mision, vision,
      marco_conceptual, procedimientos
    } = req.body

    // Insertar manual principal
    const manualResult = await client.query(
      `INSERT INTO manuales (creado_por, tipo_manual, codigo, dependencia, version, estado)
       VALUES ($1, $2, $3, $4, $5, 'borrador')
       RETURNING *`,
      [id_usuario, tipo_manual, codigo, dependencia, version || 1]
    )
    const manual = manualResult.rows[0]
    const id_manual = manual.id_manual

    // Insertar secciones del Capítulo I
    const secciones = [
      { tipo: 'introduccion', contenido: introduccion },
      { tipo: 'antecedentes', contenido: antecedentes },
      { tipo: 'atribuciones', contenido: atribuciones },
      { tipo: 'objetivo_general', contenido: objetivo_general },
      { tipo: 'mision', contenido: mision },
      { tipo: 'vision', contenido: vision },
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

    // Insertar marco normativo
    if (marco_normativo && marco_normativo.length > 0) {
      for (const norma of marco_normativo) {
        await client.query(
          `INSERT INTO marco_normativo (id_manual, nombre_norma, fecha_publicacion, medio_publicacion)
           VALUES ($1, $2, $3, $4)`,
          [id_manual, norma.nombre, norma.fecha, norma.medio]
        )
      }
    }

    // Insertar marco conceptual
    if (marco_conceptual && marco_conceptual.length > 0) {
      for (const concepto of marco_conceptual) {
        await client.query(
          `INSERT INTO marco_conceptual (id_manual, termino, definicion)
           VALUES ($1, $2, $3)`,
          [id_manual, concepto.termino, concepto.definicion]
        )
      }
    }

    // Insertar procedimientos
    if (procedimientos && procedimientos.length > 0) {
      for (const proc of procedimientos) {
        const procResult = await client.query(
          `INSERT INTO procedimientos (id_manual, codigo, version, nombre, fecha_emision, tipo)
           VALUES ($1, $2, $3, $4, $5, 'administrativo')
           RETURNING id_procedimiento`,
          [id_manual, proc.codigo, proc.version || '00', proc.nombre, proc.fecha_emision || null]
        )
        const id_procedimiento = procResult.rows[0].id_procedimiento

        // Insertar detalle del procedimiento
        await client.query(
          `INSERT INTO procedimiento_detalle (id_procedimiento, objetivo, alcance, responsabilidades, definiciones, referencias, registros)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [id_procedimiento, proc.objetivo, proc.alcance, proc.responsabilidades, proc.definiciones, proc.referencias, proc.registros]
        )

        // Insertar actividades
        if (proc.actividades && proc.actividades.length > 0) {
          for (let i = 0; i < proc.actividades.length; i++) {
            const act = proc.actividades[i]
            await client.query(
              `INSERT INTO pasos_procedimiento (id_procedimiento, numero_paso, responsable, descripcion)
               VALUES ($1, $2, $3, $4)`,
              [id_procedimiento, i + 1, act.responsable, act.descripcion]
            )
          }
        }
      }
    }

    await client.query('COMMIT')
    res.status(201).json({ mensaje: 'Manual guardado correctamente', manual })

  } catch (error) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: error.message })
  } finally {
    client.release()
  }
}

module.exports = { getManuales, crearManual }