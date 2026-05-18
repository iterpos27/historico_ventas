import { Router } from 'express';
import * as branchController from '../controllers/branchController.js';
import { authenticate, requireRoles } from '../middlewares/auth.js';

export const branchRoutes = Router();

branchRoutes.use(authenticate);
branchRoutes.get('/', branchController.list);
branchRoutes.post('/', requireRoles('admin'), branchController.create);
branchRoutes.put('/:id', requireRoles('admin'), branchController.update);
branchRoutes.patch('/:id/desactivar', requireRoles('admin'), branchController.deactivate);
