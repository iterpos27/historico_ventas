import { Router } from 'express';
import * as syncController from '../controllers/syncController.js';
import { authenticate, requireRoles } from '../middlewares/auth.js';

export const syncRoutes = Router();

syncRoutes.post('/google-sheets', authenticate, requireRoles('admin'), syncController.syncGoogleSheets);
syncRoutes.post('/google-drive', authenticate, requireRoles('admin'), syncController.syncGoogleDrive);
syncRoutes.post('/excel', authenticate, requireRoles('admin'), syncController.importExcel);
syncRoutes.get('/historial', authenticate, requireRoles('admin'), syncController.syncHistory);
