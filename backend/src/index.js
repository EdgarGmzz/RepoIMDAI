const express = require('express')
const cors = require('cors')
const pool = require('./config/db')
require('dotenv').config()

const authRoutes = require('./routes/auth.routes')

const manualesRoutes  = require('./routes/manuales.routes')
const suplenciasRoutes = require('./routes/suplencias.routes')

const path = require('path')

const app = express()
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.use('/auth', authRoutes)

// Endpoint público para el visor de diagramas (sin token, usado por el QR del PDF)
const { getDiagramaPublico } = require('./controllers/manuales.controller')
app.get('/public/diagrama/:manualId/:procIdx', getDiagramaPublico)

app.use('/manuales',   manualesRoutes)
app.use('/suplencias', suplenciasRoutes)

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

const distPath = path.join(__dirname, '../../frontend/dist')
app.use(express.static(distPath))
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

app.listen(process.env.PORT, () => {
  console.log(`Servidor corriendo en puerto ${process.env.PORT}`)
})
