const express = require('express');
const { obtenerPerfil, actualizarPerfil } = require('../controllers/usuariosController');
const { autenticarToken } = require('../middlewares/auth');
const router = express.Router();

router.get('/perfil', autenticarToken, obtenerPerfil);
router.put('/perfil', autenticarToken, actualizarPerfil);

module.exports = router;