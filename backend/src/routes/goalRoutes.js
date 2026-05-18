import { Router } from 'express';
import * as goalController from '../controllers/goalController.js';
import { authenticate, requireRoles } from '../middlewares/auth.js';

export const goalRoutes = Router();

goalRoutes.use(authenticate);
goalRoutes.get('/', goalController.list);
goalRoutes.post('/copiar', requireRoles('admin'), goalController.copy);
goalRoutes.post('/', requireRoles('admin'), goalController.create);
goalRoutes.put('/:id', requireRoles('admin'), goalController.update);
goalRoutes.patch('/:id/desactivar', requireRoles('admin'), goalController.deactivate);
