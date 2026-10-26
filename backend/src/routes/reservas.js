const express = require('express');
const { crearReserva, verMisReservas, verTodasReservas, cambiarEstadoReserva, cancelarReserva } = require('../controllers/reservasController');
const { autenticarToken } = require('../middlewares/auth');
const { esAdmin } = require('../middlewares/esAdmin');
const router = express.Router();

router.post('/', autenticarToken, crearReserva);
router.get('/mis-reservas', autenticarToken, verMisReservas);
router.get('/', autenticarToken, esAdmin, verTodasReservas);
router.put('/:id/estado', autenticarToken, esAdmin, cambiarEstadoReserva);
router.delete('/:id', autenticarToken, cancelarReserva);

module.exports = router;