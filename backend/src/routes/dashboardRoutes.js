import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController.js';
import { authenticate, requireRoles } from '../middlewares/auth.js';

export const dashboardRoutes = Router();

dashboardRoutes.use(authenticate);
dashboardRoutes.get('/admin', requireRoles('admin'), dashboardController.admin);
