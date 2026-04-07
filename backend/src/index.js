const express = require('express')
const cors = require('cors')
const pool = require('./config/db')
require('dotenv').config()

const authRoutes = require('./routes/auth.routes')

const manualesRoutes = require('./routes/manuales.routes')

const path = require('path')

const app = express()
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.use('/auth', authRoutes)

app.use('/manuales', manualesRoutes)

const { verificarToken } = require('./middlewares/auth.middleware')

app.get('/protegido', verificarToken, (req, res) => {
  res.json({ mensaje: `Hola ${req.usuario.nombre}, tienes acceso`, rol: req.usuario.rol })
})

app.get('/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()')
    res.json({ mensaje: 'Conexión exitosa', fecha: result.rows[0] })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.listen(process.env.PORT, () => {
  console.log(`Servidor corriendo en puerto ${process.env.PORT}`)
})