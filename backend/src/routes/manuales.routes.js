const express = require('express')
const router = express.Router()
const { getManuales, getManualById, crearManual, actualizarManual, cambiarEstado, eliminarManuales, subirOrganigrama } = require('../controllers/manuales.controller')
const { verificarToken } = require('../middlewares/auth.middleware')
const upload = require('../middlewares/upload.middleware')

router.get('/',                    verificarToken, getManuales)
router.get('/:id',                 verificarToken, getManualById)
router.post('/',                   verificarToken, crearManual)
router.put('/:id',                 verificarToken, actualizarManual)
router.patch('/:id/estado',        verificarToken, cambiarEstado)
router.delete('/',                 verificarToken, eliminarManuales)
router.post('/:id/organigrama',    verificarToken, upload.single('archivo'), subirOrganigrama)

module.exports = router