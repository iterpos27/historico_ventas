import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import * as authController from './controllers/authController.js';
import { authenticate } from './middlewares/auth.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { authRoutes } from './routes/authRoutes.js';
import { branchRoutes } from './routes/branchRoutes.js';
import { goalRoutes } from './routes/goalRoutes.js';
import { salesRoutes } from './routes/salesRoutes.js';
import { syncRoutes } from './routes/syncRoutes.js';
import { userRoutes } from './routes/userRoutes.js';

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.get('/api/me', authenticate, authController.me);
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/almacenes', branchRoutes);
app.use('/api/metas', goalRoutes);
app.use('/api/ventas', salesRoutes);
app.use('/api/sync', syncRoutes);

app.use((_req, res) => res.status(404).json({ message: 'Ruta no encontrada' }));
app.use(errorHandler);
