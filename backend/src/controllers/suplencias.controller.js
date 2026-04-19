const pool = require('../config/db')

// ── GET /suplencias ───────────────────────────────────────────────────────────
// Lista todas las suplencias (solo admin)
const getSuplencias = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.id_suplencia, s.activo, s.motivo,
              TO_CHAR(s.fecha_creacion, 'DD/MM/YYYY HH24:MI') AS fecha_creacion,
              so.id_usuario  AS sujeto_id,
              so.nombre      AS sujeto_nombre,
              so.dependencia AS sujeto_dependencia,
              sp.id_usuario  AS suplente_id,
              sp.nombre      AS suplente_nombre,
              sp.dependencia AS suplente_dependencia
       FROM suplencias s
       JOIN usuarios so ON so.id_usuario = s.sujeto_obligado
       JOIN usuarios sp ON sp.id_usuario = s.suplente
       ORDER BY s.activo DESC, s.fecha_creacion DESC`
    )
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ── GET /suplencias/usuarios ──────────────────────────────────────────────────
// Lista todos los sujetos obligados (para el selector del admin)
const getUsuariosSujetosObligados = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id_usuario, u.nombre, u.dependencia, u.correo
       FROM usuarios u
       JOIN roles r ON r.id_rol = u.id_rol
       WHERE r.nombre_rol = 'sujeto_obligado' AND u.activo = TRUE
       ORDER BY u.nombre`
    )
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ── POST /suplencias ──────────────────────────────────────────────────────────
// Crea una suplencia (solo admin)
const crearSuplencia = async (req, res) => {
  try {
    const { id_usuario } = req.usuario
    const { sujeto_obligado, suplente, motivo } = req.body

    if (!sujeto_obligado || !suplente)
      return res.status(400).json({ error: 'Se requiere sujeto_obligado y suplente' })

    if (sujeto_obligado === suplente)
      return res.status(400).json({ error: 'El suplente no puede ser el mismo usuario' })

    // Verificar que ambos existen y son sujetos_obligados
    const sujetoRes = await pool.query(
      `SELECT u.id_usuario FROM usuarios u
       JOIN roles r ON r.id_rol = u.id_rol
       WHERE u.id_usuario = $1 AND r.nombre_rol = 'sujeto_obligado'`,
      [sujeto_obligado]
    )
    if (sujetoRes.rows.length === 0)
      return res.status(400).json({ error: 'El sujeto obligado no existe o no tiene ese rol' })

    const suplenteRes = await pool.query(
      `SELECT u.id_usuario FROM usuarios u
       JOIN roles r ON r.id_rol = u.id_rol
       WHERE u.id_usuario = $1 AND r.nombre_rol = 'sujeto_obligado'`,
      [suplente]
    )
    if (suplenteRes.rows.length === 0)
      return res.status(400).json({ error: 'El suplente no existe o no tiene el rol de sujeto obligado' })

    // Desactivar cualquier suplencia activa previa para ese sujeto
    await pool.query(
      `UPDATE suplencias SET activo = FALSE WHERE sujeto_obligado = $1 AND activo = TRUE`,
      [sujeto_obligado]
    )

    const result = await pool.query(
      `INSERT INTO suplencias (sujeto_obligado, suplente, motivo, activo, creado_por)
       VALUES ($1, $2, $3, TRUE, $4) RETURNING id_suplencia`,
      [sujeto_obligado, suplente, motivo || null, id_usuario]
    )

    res.status(201).json({ mensaje: 'Suplencia creada correctamente', id_suplencia: result.rows[0].id_suplencia })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ── PATCH /suplencias/:id/desactivar ─────────────────────────────────────────
// Desactiva una suplencia (solo admin)
const desactivarSuplencia = async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query(
      `UPDATE suplencias SET activo = FALSE WHERE id_suplencia = $1 RETURNING id_suplencia`,
      [id]
    )
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Suplencia no encontrada' })

    res.json({ mensaje: 'Suplencia desactivada correctamente' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = { getSuplencias, getUsuariosSujetosObligados, crearSuplencia, desactivarSuplencia }
