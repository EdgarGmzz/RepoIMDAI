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
  try {
    const { id_usuario } = req.usuario
    const { tipo_manual, codigo, dependencia } = req.body

    const result = await pool.query(
      `INSERT INTO manuales (creado_por, tipo_manual, codigo, dependencia, estado)
       VALUES ($1, $2, $3, $4, 'borrador')
       RETURNING *`,
      [id_usuario, tipo_manual, codigo, dependencia]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = { getManuales, crearManual }