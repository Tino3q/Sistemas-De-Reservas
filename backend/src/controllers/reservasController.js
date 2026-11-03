const prisma = require('../db');

const RE_FECHA = /^\d{4}-\d{2}-\d{2}$/;
const RE_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;
const ESTADOS = ['pendiente', 'confirmada', 'cancelada', 'completada'];

const fechaValida = (fecha) => {
  if (!RE_FECHA.test(fecha)) return false;
  const d = new Date(`${fecha}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === fecha;
};

const momentoDeReserva = (fecha, hora, fechaHora) => {
  if (fechaHora) return new Date(fechaHora);
  return new Date(`${fecha}T${hora}:00`);
};

const crearReserva = async (req, res) => {
  try {
    const { fecha, hora, servicioId, fechaHora } = req.body;
    const usuarioId = req.user.id;

    if (typeof fecha !== 'string' || !fechaValida(fecha)) {
      return res.status(400).json({ error: 'La fecha debe tener el formato YYYY-MM-DD y ser valida' });
    }
    if (typeof hora !== 'string' || !RE_HORA.test(hora)) {
      return res.status(400).json({ error: 'La hora debe tener el formato HH:MM (24 horas)' });
    }
    const idServicio = Number(servicioId);
    if (!Number.isInteger(idServicio) || idServicio <= 0) {
      return res.status(400).json({ error: 'servicioId invalido' });
    }

    const momento = momentoDeReserva(fecha, hora, fechaHora);
    if (Number.isNaN(momento.getTime())) {
      return res.status(400).json({ error: 'La fecha y hora de la reserva no son validas' });
    }
    if (momento.getTime() <= Date.now()) {
      return res.status(400).json({ error: 'La fecha y hora de la reserva deben ser posteriores al momento actual' });
    }

    const servicio = await prisma.servicio.findUnique({ where: { id: idServicio } });
    if (!servicio) {
      return res.status(404).json({ error: 'El servicio solicitado no existe' });
    }
    if (!servicio.activo) {
      return res.status(400).json({ error: 'El servicio no esta activo' });
    }

    const duplicada = await prisma.reserva.findFirst({
      where: { usuarioId, servicioId: idServicio, fecha, estado: { not: 'cancelada' } },
    });
    if (duplicada) {
      return res.status(409).json({ error: 'Ya tienes una reserva activa para este servicio en esa fecha' });
    }

    const reserva = await prisma.reserva.create({
      data: { fecha, hora, estado: 'pendiente', usuarioId, servicioId: idServicio },
      include: { servicio: true },
    });

    res.status(201).json(reserva);
  } catch (error) {
    console.error('ERROR AL CREAR RESERVA:', error);
    res.status(500).json({ error: 'Error al crear la reserva' });
  }
};

const verMisReservas = async (req, res) => {
  try {
    const reservas = await prisma.reserva.findMany({
      where: { usuarioId: req.user.id },
      include: { servicio: true },
      orderBy: [{ fecha: 'asc' }, { hora: 'asc' }],
    });
    res.json(reservas);
  } catch (error) {
    console.error('ERROR AL LISTAR RESERVAS:', error);
    res.status(500).json({ error: 'Error al obtener las reservas' });
  }
};

const verTodasReservas = async (req, res) => {
  try {
    const reservas = await prisma.reserva.findMany({
      include: {
        usuario: { select: { id: true, nombre: true, email: true } },
        servicio: true,
      },
      orderBy: [{ fecha: 'asc' }, { hora: 'asc' }],
    });
    res.json(reservas);
  } catch (error) {
    console.error('ERROR AL LISTAR TODAS LAS RESERVAS:', error);
    res.status(500).json({ error: 'Error al obtener todas las reservas' });
  }
};

const cambiarEstadoReserva = async (req, res) => {
  try {
    const { estado } = req.body;
    if (!ESTADOS.includes(estado)) {
      return res.status(400).json({ error: `Estado invalido. Valores permitidos: ${ESTADOS.join(', ')}` });
    }
    const reservaActualizada = await prisma.reserva.update({
      where: { id: Number(req.params.id) },
      data: { estado },
    });
    res.json(reservaActualizada);
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Reserva no encontrada' });
    console.error('ERROR AL CAMBIAR ESTADO:', error);
    res.status(500).json({ error: 'Error al actualizar el estado' });
  }
};

const cancelarReserva = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const reserva = await prisma.reserva.findUnique({ where: { id } });

    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }
    if (reserva.usuarioId !== req.user.id && req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'No autorizado para cancelar esta reserva' });
    }
    if (reserva.estado === 'cancelada') {
      return res.status(400).json({ error: 'La reserva ya estaba cancelada' });
    }

    const reservaCancelada = await prisma.reserva.update({
      where: { id },
      data: { estado: 'cancelada' },
    });
    res.json({ message: 'Reserva cancelada correctamente', reservaCancelada });
  } catch (error) {
    console.error('ERROR AL CANCELAR RESERVA:', error);
    res.status(500).json({ error: 'Error al cancelar la reserva' });
  }
};

module.exports = { crearReserva, verMisReservas, verTodasReservas, cambiarEstadoReserva, cancelarReserva };