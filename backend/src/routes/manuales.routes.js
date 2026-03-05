const express = require('express')
const router = express.Router()
const { getManuales, crearManual } = require('../controllers/manuales.controller')
const { verificarToken } = require('../middlewares/auth.middleware')

router.get('/', verificarToken, getManuales)
router.post('/', verificarToken, crearManual)

module.exports = router