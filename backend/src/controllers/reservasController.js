const prisma = require('../db');

const crearReserva = async (req, res) => {
  try {
    const { fecha, hora, servicioId } = req.body;
    const usuarioId = req.user.id;

    const fechaReserva = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaReserva < hoy) {
      return res.status(400).json({ message: 'No se puede reservar una fecha pasada' });
    }

    const reserva = await prisma.reserva.create({
      data: { fecha, hora, estado: 'pendiente', usuarioId, servicioId: Number(servicioId) },
      include: { servicio: true }
    });

    res.status(201).json(reserva);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear la reserva' });
  }
};

const verMisReservas = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const reservas = await prisma.reserva.findMany({
      where: { usuarioId },
      include: { servicio: true },
    });
    res.json(reservas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las reservas' });
  }
};

const verTodasReservas = async (req, res) => {
  try {
    const reservas = await prisma.reserva.findMany({
      include: { usuario: true, servicio: true },
    });
    res.json(reservas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener todas las reservas' });
  }
};

const cambiarEstadoReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const reservaActualizada = await prisma.reserva.update({
      where: { id: Number(id) },
      data: { estado },
    });
    res.json(reservaActualizada);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar el estado' });
  }
};

const cancelarReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.user.id;
    const reserva = await prisma.reserva.findUnique({ where: { id: Number(id) } });

    if (!reserva || reserva.usuarioId !== usuarioId) {
      return res.status(403).json({ message: 'No autorizado para cancelar esta reserva' });
    }

    const reservaCancelada = await prisma.reserva.update({
      where: { id: Number(id) },
      data: { estado: 'cancelada' },
    });
    res.json({ message: 'Reserva cancelada correctamente', reservaCancelada });
  } catch (error) {
    res.status(400).json({ message: 'Error al cancelar la reserva' });
  }
};

module.exports = { crearReserva, verMisReservas, verTodasReservas, cambiarEstadoReserva, cancelarReserva };