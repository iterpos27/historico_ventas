import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { query } from '../db/pool.js';
import { unauthorized } from '../utils/errors.js';

const publicUserFields = `
  u.id, u.nombre, u.username, u.email, u.rol, u.almacen_id, u.estado,
  a.nombre AS almacen_nombre, a.nomenclatura AS almacen_nomenclatura
`;

export const login = async ({ email, password }) => {
  const { rows } = await query(
    `SELECT ${publicUserFields}, u.password_hash
     FROM usuarios u
     LEFT JOIN almacenes a ON a.id = u.almacen_id
     WHERE LOWER(u.email) = LOWER($1) OR LOWER(u.username) = LOWER($1)`,
    [email]
  );

  const user = rows[0];
  if (!user || !user.estado) throw unauthorized('Credenciales inválidas');

  const passwordOk = await bcrypt.compare(password, user.password_hash);
  if (!passwordOk) throw unauthorized('Credenciales inválidas');

  const token = jwt.sign(
    { user_id: user.id, rol: user.rol, almacen_id: user.almacen_id },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

  delete user.password_hash;
  return { token, user };
};

export const getMe = async (userId) => {
  const { rows } = await query(
    `SELECT ${publicUserFields}
     FROM usuarios u
     LEFT JOIN almacenes a ON a.id = u.almacen_id
     WHERE u.id = $1`,
    [userId]
  );
  return rows[0];
};
