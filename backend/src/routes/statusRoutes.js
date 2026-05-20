import { Router } from 'express';
import * as statusController from '../controllers/statusController.js';
import { authenticate, requireRoles } from '../middlewares/auth.js';

export const statusRoutes = Router();

statusRoutes.get('/', authenticate, requireRoles('admin'), statusController.status);
