import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';

export const authRoutes = Router();

authRoutes.post('/login', authController.login);
authRoutes.get('/me', authenticate, authController.me);
authRoutes.get('/google', authController.googleAuth);
authRoutes.get('/google/callback', authController.googleCallback);
authRoutes.get('/google/status', authenticate, authController.googleStatus);
