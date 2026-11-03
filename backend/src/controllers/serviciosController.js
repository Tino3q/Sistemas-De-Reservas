const prisma = require('../db');

const obtenerServicios = async (req, res) => {
  try {
    const where = req.user?.rol === 'admin' ? {} : { activo: true };
    const servicios = await prisma.servicio.findMany({ where, orderBy: { nombre: 'asc' } });
    res.json(servicios);
  } catch (error) {
    console.error('ERROR AL OBTENER SERVICIOS:', error);
    res.status(500).json({ error: 'Error al obtener servicios' });
  }
};

const obtenerServicioPorId = async (req, res) => {
  try {
    const servicio = await prisma.servicio.findUnique({ where: { id: Number(req.params.id) } });
    if (!servicio || (!servicio.activo && req.user?.rol !== 'admin')) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }
    res.json(servicio);
  } catch (error) {
    console.error('ERROR AL OBTENER SERVICIO:', error);
    res.status(500).json({ error: 'Error al obtener el servicio' });
  }
};

const crearServicio = async (req, res) => {
  try {
    const { nombre, descripcion, duracion, precio, activo } = req.body;
    
    const servicio = await prisma.servicio.create({
      data: {
        nombre,
        descripcion: descripcion || '',
        duracion: Number(duracion) || 30,
        precio: parseFloat(precio),
        activo: activo === undefined ? true : Boolean(activo),
      },
    });
    res.status(201).json(servicio);
  } catch (error) {
    console.error('ERROR AL CREAR SERVICIO:', error);
    res.status(400).json({ error: 'Error al crear servicio' });
  }
};

module.exports = { obtenerServicios, obtenerServicioPorId, crearServicio };