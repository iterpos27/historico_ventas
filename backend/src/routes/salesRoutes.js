import { Router } from 'express';
import * as salesController from '../controllers/salesController.js';
import { authenticate } from '../middlewares/auth.js';

export const salesRoutes = Router();

salesRoutes.use(authenticate);
salesRoutes.get('/total', salesController.total);
salesRoutes.get('/resumen', salesController.resumen);
salesRoutes.get('/por-almacen', salesController.porAlmacen);
salesRoutes.get('/cumplimiento-metas', salesController.cumplimientoMetas);
salesRoutes.get('/historial-mensual', salesController.historialMensual);
