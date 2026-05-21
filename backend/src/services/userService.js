import bcrypt from 'bcryptjs';
import { query } from '../db/pool.js';
import { AppError, notFound } from '../utils/errors.js';

const userSelect = `
  u.id, u.nombre, u.username, u.email, u.rol, u.almacen_id, u.estado, u.created_at, u.updated_at,
  a.nombre AS almacen_nombre, a.nomenclatura AS almacen_nomenclatura
`;

const validateUserPayload = ({ nombre, username, email, password, rol, almacen_id }, { requirePassword = false } = {}) => {
  if (!String(nombre || '').trim() || String(nombre).length > 120) {
    throw new AppError('El nombre es requerido y no debe superar 120 caracteres');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '')) || String(email).length > 180) {
    throw new AppError('Email inválido');
  }
  if (username && String(username).length > 80) {
    throw new AppError('El nombre de usuario no debe superar 80 caracteres');
  }
  if ((requirePassword || password) && String(password || '').length < 8) {
    throw new AppError('La contraseña debe tener al menos 8 caracteres');
  }
  if (!['admin', 'jefe_comercial', 'almacen'].includes(rol)) {
    throw new AppError('Rol inválido');
  }
  if (rol === 'almacen' && !almacen_id) {
    throw new AppError('El rol almacén requiere almacen_id');
  }
};

export const listUsers = async () => {
  const { rows } = await query(
    `SELECT ${userSelect}
     FROM usuarios u
     LEFT JOIN almacenes a ON a.id = u.almacen_id
     ORDER BY u.created_at DESC`
  );
  return rows;
};

export const createUser = async (payload) => {
  validateUserPayload(payload, { requirePassword: true });
  const passwordHash = await bcrypt.hash(payload.password, 10);
  const { rows } = await query(
    `INSERT INTO usuarios (nombre, username, email, password_hash, rol, almacen_id, estado)
     VALUES ($1, NULLIF($2, ''), $3, $4, $5, $6, COALESCE($7, true))
     RETURNING id, nombre, username, email, rol, almacen_id, estado, created_at, updated_at`,
    [
      payload.nombre,
      payload.username,
      payload.email,
      passwordHash,
      payload.rol,
      payload.rol === 'almacen' ? payload.almacen_id : null,
      payload.estado
    ]
  );
  return rows[0];
};

export const updateUser = async (id, payload) => {
  validateUserPayload(payload);
  const fields = [
    payload.nombre,
    payload.username,
    payload.email,
    payload.rol,
    payload.rol === 'almacen' ? payload.almacen_id : null,
    payload.estado
  ];

  let passwordSql = '';
  if (payload.password) {
    fields.push(await bcrypt.hash(payload.password, 10));
    passwordSql = `, password_hash = $${fields.length}`;
  }

  fields.push(id);
  const { rows } = await query(
    `UPDATE usuarios
     SET nombre = $1, username = NULLIF($2, ''), email = $3, rol = $4, almacen_id = $5, estado = COALESCE($6, estado)${passwordSql}
     WHERE id = $${fields.length}
     RETURNING id, nombre, username, email, rol, almacen_id, estado, created_at, updated_at`,
    fields
  );
  if (!rows[0]) throw notFound('Usuario no encontrado');
  return rows[0];
};

export const deactivateUser = async (id) => {
  const { rows } = await query(
    `UPDATE usuarios SET estado = false WHERE id = $1
     RETURNING id, nombre, username, email, rol, almacen_id, estado`,
    [id]
  );
  if (!rows[0]) throw notFound('Usuario no encontrado');
  return rows[0];
};

export const deleteUser = async (id, currentUserId) => {
  if (id === currentUserId) {
    throw new AppError('No puedes eliminar tu propio usuario');
  }

  const { rows } = await query(
    `DELETE FROM usuarios
     WHERE id = $1
     RETURNING id, nombre, username, email, rol, almacen_id, estado`,
    [id]
  );
  if (!rows[0]) throw notFound('Usuario no encontrado');
  return rows[0];
};
