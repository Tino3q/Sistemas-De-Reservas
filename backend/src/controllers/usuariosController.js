const prisma = require('../db');

const CAMPOS_PUBLICOS = { id: true, nombre: true, email: true, rol: true };

const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      select: CAMPOS_PUBLICOS,
    });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (error) {
    console.error('ERROR AL OBTENER PERFIL:', error);
    res.status(500).json({ error: 'Error al obtener el perfil' });
  }
};

const actualizarPerfil = async (req, res) => {
  try {
    const nombre = typeof req.body.nombre === 'string' ? req.body.nombre.trim() : '';
    if (nombre.length < 2) {
      return res.status(400).json({ error: 'El nombre debe tener al menos 2 caracteres' });
    }
    if (nombre.length > 80) {
      return res.status(400).json({ error: 'El nombre es demasiado largo (maximo 80 caracteres)' });
    }

    const usuario = await prisma.usuario.update({
      where: { id: req.user.id },
      data: { nombre },
      select: CAMPOS_PUBLICOS,
    });
    res.json(usuario);
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Usuario no encontrado' });
    console.error('ERROR AL ACTUALIZAR PERFIL:', error);
    res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
};

module.exports = { obtenerPerfil, actualizarPerfil };