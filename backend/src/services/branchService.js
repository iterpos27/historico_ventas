import { query } from '../db/pool.js';
import { AppError, notFound } from '../utils/errors.js';

const validateBranchPayload = (payload) => {
  const nombre = String(payload.nombre || '').trim();
  const nomenclatura = String(payload.nomenclatura || '').trim();

  if (!nombre || nombre.length > 120) {
    throw new AppError('El nombre del almacén es requerido y no debe superar 120 caracteres');
  }
  if (!nomenclatura || nomenclatura.length > 20) {
    throw new AppError('La nomenclatura es requerida y no debe superar 20 caracteres');
  }
};

export const listBranches = async (user) => {
  const params = [];
  let where = '';
  if (user.rol === 'almacen') {
    params.push(user.almacen_id);
    where = 'WHERE id = $1';
  }

  const { rows } = await query(
    `SELECT id, nombre, nomenclatura, estado, created_at, updated_at
     FROM almacenes ${where}
     ORDER BY nombre ASC`,
    params
  );
  return rows;
};

export const createBranch = async (payload) => {
  validateBranchPayload(payload);
  const { rows } = await query(
    `INSERT INTO almacenes (nombre, nomenclatura, estado)
     VALUES ($1, UPPER($2), COALESCE($3, true))
     RETURNING *`,
    [payload.nombre, payload.nomenclatura, payload.estado]
  );
  return rows[0];
};

export const updateBranch = async (id, payload) => {
  validateBranchPayload(payload);
  const { rows } = await query(
    `UPDATE almacenes
     SET nombre = $1, nomenclatura = UPPER($2), estado = COALESCE($3, estado)
     WHERE id = $4
     RETURNING *`,
    [payload.nombre, payload.nomenclatura, payload.estado, id]
  );
  if (!rows[0]) throw notFound('Almacén no encontrado');
  return rows[0];
};

export const deactivateBranch = async (id) => {
  const { rows } = await query(
    'UPDATE almacenes SET estado = false WHERE id = $1 RETURNING *',
    [id]
  );
  if (!rows[0]) throw notFound('Almacén no encontrado');
  return rows[0];
};
