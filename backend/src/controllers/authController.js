const prisma = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registrar = async (req, res) => {
  try {
    const nombre = typeof req.body.nombre === 'string' ? req.body.nombre.trim() : '';
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const { password } = req.body;

    if (nombre.length < 2 || !email.includes('@') || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Nombre, correo valido y contrasena (minimo 6 caracteres) son obligatorios' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const usuario = await prisma.usuario.create({
      data: { nombre, email, password: hashedPassword, rol: 'cliente' },
    });
    res.status(201).json({
      message: 'Usuario registrado con exito',
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
    });
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ error: 'Ese correo ya esta registrado' });
    console.error('ERROR EN REGISTRO:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

const login = async (req, res) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const { password } = req.body;
    if (!email || typeof password !== 'string') {
      return res.status(400).json({ error: 'Correo y contrasena son obligatorios' });
    }

    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) return res.status(400).json({ error: 'Credenciales incorrectas' });

    const valido = await bcrypt.compare(password, usuario.password);
    if (!valido) return res.status(400).json({ error: 'Credenciales incorrectas' });

    const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol } });
  } catch (error) {
    console.error('ERROR EN LOGIN:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

module.exports = { registrar, login };