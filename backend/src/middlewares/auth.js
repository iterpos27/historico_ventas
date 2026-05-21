import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { query } from '../db/pool.js';
import { forbidden, unauthorized } from '../utils/errors.js';

export const authenticate = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) throw unauthorized('Token requerido');

    const token = header.replace('Bearer ', '');
    const payload = jwt.verify(token, env.jwtSecret);
    const { rows } = await query(
      'SELECT id, nombre, email, rol, almacen_id, estado FROM usuarios WHERE id = $1',
      [payload.user_id]
    );

    const user = rows[0];
    if (!user || !user.estado) throw unauthorized('Usuario inactivo o inexistente');

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(unauthorized('Sesion expirada. Inicia sesion nuevamente.'));
    }
    return next(error.statusCode ? error : unauthorized('Token invalido'));
  }
};

export const requireRoles = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user?.rol)) return next(forbidden());
  next();
};
