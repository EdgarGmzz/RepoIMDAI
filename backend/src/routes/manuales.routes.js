const express = require('express')
const router = express.Router()
const { getManuales, getManualById, crearManual, actualizarManual, cambiarEstado, eliminarManuales, subirOrganigrama, getObservaciones, asignarCodigo, getActividad, getHistorial } = require('../controllers/manuales.controller')
const { verificarToken } = require('../middlewares/auth.middleware')
const upload = require('../middlewares/upload.middleware')

router.get('/',                    verificarToken, getManuales)
router.get('/actividad',           verificarToken, getActividad)
router.get('/:id',                 verificarToken, getManualById)
router.get('/:id/observaciones',   verificarToken, getObservaciones)
router.get('/:id/historial',       verificarToken, getHistorial)
router.post('/',                   verificarToken, crearManual)
router.put('/:id',                 verificarToken, actualizarManual)
router.patch('/:id/estado',        verificarToken, cambiarEstado)
router.patch('/:id/codigo',        verificarToken, asignarCodigo)
router.delete('/',                 verificarToken, eliminarManuales)
router.post('/:id/organigrama',    verificarToken, upload.single('archivo'), subirOrganigrama)

module.exports = router
