const express = require('express')
const router = express.Router()
const { getManuales, getManualById, crearManual, actualizarManual, cambiarEstado } = require('../controllers/manuales.controller')
const { verificarToken } = require('../middlewares/auth.middleware')

router.get('/',             verificarToken, getManuales)
router.get('/:id',          verificarToken, getManualById)
router.post('/',            verificarToken, crearManual)
router.put('/:id',          verificarToken, actualizarManual)
router.patch('/:id/estado', verificarToken, cambiarEstado)

module.exports = router