process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
  });

import express from 'express';
import cors from 'cors';
import { sequelize } from './config/database.js';
import { Usuario, Cliente, Paquete, Pago, Rutina } from './models/index.js';
import dotenv from 'dotenv';
import usuarioRoutes from './routes/usuarioRoutes.js';
import paqueteRoutes from './routes/paqueteRoutes.js';
import clienteRoutes from './routes/clienteRoutes.js';
import pagoRoutes from './routes/pagoRoutes.js';
import rutinaRoutes from './routes/rutinaRoutes.js';
import authRoutes from './routes/authRoutes.js';
dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: true,
  credentials: true,
}));

// Comprobación de conexión
sequelize.authenticate()
  .then(() => {
    console.log('Conectado a la base de datos');
    // Sync crea las tablas si aún no existen
    return sequelize.sync();
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor backend en puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('No se pudo conectar a la base de datos:', err);
  });

app.use('/api/usuarios', usuarioRoutes);
app.use('/api/paquetes', paqueteRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/rutinas', rutinaRoutes);
app.use('/api', authRoutes);
