const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('Falta JWT_SECRET en el archivo .env');
  process.exit(1);
}

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', require('./routes/auth'));
app.use('/servicios', require('./routes/servicios'));
app.use('/reservas', require('./routes/reservas'));
app.use('/usuarios', require('./routes/usuarios'));

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ error: status === 400 ? 'JSON invalido en la peticion' : 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});