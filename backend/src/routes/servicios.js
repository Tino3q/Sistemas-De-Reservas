const express = require('express');
const { obtenerServicios, obtenerServicioPorId, crearServicio } = require('../controllers/serviciosController');
const { autenticarToken } = require('../middlewares/auth');
const { esAdmin } = require('../middlewares/esAdmin');
const router = express.Router();

router.get('/', autenticarToken, obtenerServicios);
router.get('/:id', autenticarToken, obtenerServicioPorId);
router.post('/', autenticarToken, esAdmin, crearServicio);

module.exports = router;