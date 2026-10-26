const prisma = require('../db');

const obtenerServicios = async (req, res) => {
  try {
    const servicios = await prisma.servicio.findMany();
    res.json(servicios);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener servicios' });
  }
};

const obtenerServicioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const servicio = await prisma.servicio.findUnique({ where: { id: Number(id) } });
    if (!servicio) return res.status(404).json({ message: 'Servicio no encontrado' });
    res.json(servicio);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el servicio' });
  }
};

const crearServicio = async (req, res) => {
  try {
    const { nombre, descripcion, duracion, precio } = req.body;
    const servicio = await prisma.servicio.create({
      data: { nombre, descripcion, duracion: Number(duracion), precio: parseFloat(precio) },
    });
    res.status(201).json(servicio);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear servicio' });
  }
};

module.exports = { obtenerServicios, obtenerServicioPorId, crearServicio };