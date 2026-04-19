const express = require('express')
const router = express.Router()
const { getSuplencias, getUsuariosSujetosObligados, crearSuplencia, desactivarSuplencia } = require('../controllers/suplencias.controller')
const { verificarToken } = require('../middlewares/auth.middleware')

const soloAdmin = (req, res, next) => {
  if (req.usuario?.rol !== 'administrador')
    return res.status(403).json({ error: 'Solo el administrador puede realizar esta acción' })
  next()
}

router.get('/',                    verificarToken, soloAdmin, getSuplencias)
router.get('/usuarios',            verificarToken, soloAdmin, getUsuariosSujetosObligados)
router.post('/',                   verificarToken, soloAdmin, crearSuplencia)
router.patch('/:id/desactivar',    verificarToken, soloAdmin, desactivarSuplencia)

module.exports = router
