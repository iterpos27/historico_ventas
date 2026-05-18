import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { authenticate, requireRoles } from '../middlewares/auth.js';

export const userRoutes = Router();

userRoutes.use(authenticate, requireRoles('admin'));
userRoutes.get('/', userController.list);
userRoutes.post('/', userController.create);
userRoutes.put('/:id', userController.update);
userRoutes.patch('/:id/desactivar', userController.deactivate);
