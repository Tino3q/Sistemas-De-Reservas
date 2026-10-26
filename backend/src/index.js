const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { autenticarToken, soloAdmin } = require('./routes/auth');

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.post('/auth/registro', async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        email,
        password: hashedPassword,
        rol: rol || 'cliente',
      },
    });
    res.status(201).json({ message: 'Usuario registrado con exito', usuario: { id: usuario.id, email: usuario.email, rol: usuario.rol } });
  } catch (error) {
    res.status(400).json({ message: 'Error al registrar usuario' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      return res.status(400).json({ message: 'Credenciales incorrectas' });
    }
    const valido = await bcrypt.compare(password, usuario.password);
    if (!valido) {
      return res.status(400).json({ message: 'Credenciales incorrectas' });
    }
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '24h' }
    );
    res.json({ token, usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol } });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

app.get('/servicios', autenticarToken, async (req, res) => {
  try {
    const servicios = await prisma.servicio.findMany();
    res.json(servicios);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener servicios' });
  }
});

app.post('/servicios', autenticarToken, soloAdmin, async (req, res) => {
  try {
    const { nombre, descripcion, duracion, precio } = req.body;
    const servicio = await prisma.servicio.create({
      data: {
        nombre,
        descripcion,
        duracion: Number(duracion),
        precio: parseFloat(precio),
      },
    });
    res.status(201).json(servicio);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear servicio' });
  }
});

app.put('/servicios/:id', autenticarToken, soloAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, duracion, precio } = req.body;
    const servicio = await prisma.servicio.update({
      where: { id: Number(id) },
      data: {
        nombre,
        descripcion,
        duracion: Number(duracion),
        precio: parseFloat(precio),
      },
    });
    res.json(servicio);
  } catch (error) {
    res.status(400).json({ message: 'Error al editar servicio' });
  }
});

app.delete('/servicios/:id', autenticarToken, soloAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.servicio.delete({ where: { id: Number(id) } });
    res.json({ message: 'Servicio eliminado correctamente' });
  } catch (error) {
    res.status(400).json({ message: 'Error al eliminar servicio' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});