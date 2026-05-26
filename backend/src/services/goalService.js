import { query } from '../db/pool.js';
import { AppError, notFound } from '../utils/errors.js';
import { clearCache } from '../utils/memoryCache.js';
import { isValidPeriod } from '../utils/period.js';

const goalSelect = `
  m.id, m.almacen_id, m.periodo, m.monto_meta, m.estado, m.created_at, m.updated_at,
  a.nombre AS almacen_nombre, a.nomenclatura AS almacen_nomenclatura
`;

export const listGoals = async (user, periodo) => {
  const params = [];
  const filters = [];

  if (periodo) {
    if (!isValidPeriod(periodo)) throw new AppError('Periodo inválido. Usa formato YYYY-MM.');
    params.push(periodo);
    filters.push(`m.periodo = $${params.length}`);
  }
  if (user.rol === 'almacen') {
    params.push(user.almacen_id);
    filters.push(`m.almacen_id = $${params.length}`);
  }

  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT ${goalSelect}
     FROM metas m
     JOIN almacenes a ON a.id = m.almacen_id
     ${where}
     ORDER BY m.periodo DESC, a.nombre ASC`,
    params
  );
  return rows;
};

export const createGoal = async (payload) => {
  validateGoalPayload(payload);
  const { rows } = await query(
    `INSERT INTO metas (almacen_id, periodo, monto_meta, estado)
     VALUES ($1, $2, $3, COALESCE($4, true))
     RETURNING *`,
    [payload.almacen_id, payload.periodo, payload.monto_meta, payload.estado]
  );
  clearCache('sales:');
  return rows[0];
};

export const updateGoal = async (id, payload) => {
  validateGoalPayload(payload);
  const { rows } = await query(
    `UPDATE metas
     SET almacen_id = $1, periodo = $2, monto_meta = $3, estado = COALESCE($4, estado)
     WHERE id = $5
     RETURNING *`,
    [payload.almacen_id, payload.periodo, payload.monto_meta, payload.estado, id]
  );
  if (!rows[0]) throw notFound('Meta no encontrada');
  clearCache('sales:');
  return rows[0];
};

export const deactivateGoal = async (id) => {
  const { rows } = await query(
    'UPDATE metas SET estado = false WHERE id = $1 RETURNING *',
    [id]
  );
  if (!rows[0]) throw notFound('Meta no encontrada');
  clearCache('sales:');
  return rows[0];
};

export const copyGoals = async ({ from_period, to_period, overwrite = false }) => {
  if (!from_period || !to_period) {
    throw new AppError('from_period y to_period son requeridos');
  }
  if (!isValidPeriod(from_period) || !isValidPeriod(to_period)) {
    throw new AppError('Periodo inválido. Usa formato YYYY-MM.');
  }
  if (from_period === to_period) {
    throw new AppError('El periodo origen y destino deben ser diferentes');
  }

  const conflictAction = overwrite
    ? `DO UPDATE SET monto_meta = EXCLUDED.monto_meta, estado = true, updated_at = NOW()`
    : `DO NOTHING`;

  const { rows } = await query(
    `INSERT INTO metas (almacen_id, periodo, monto_meta, estado)
     SELECT almacen_id, $2, monto_meta, true
     FROM metas
     WHERE periodo = $1 AND estado = true
     ON CONFLICT (almacen_id, periodo) ${conflictAction}
     RETURNING *`,
    [from_period, to_period]
  );

  clearCache('sales:');
  return {
    copied: rows.length,
    from_period,
    to_period,
    overwrite
  };
};

const validateGoalPayload = (payload) => {
  if (!payload.almacen_id) throw new AppError('almacen_id es requerido');
  if (!isValidPeriod(payload.periodo)) throw new AppError('Periodo inválido. Usa formato YYYY-MM.');
  const monto = Number(payload.monto_meta);
  if (Number.isNaN(monto) || monto < 0) {
    throw new AppError('La meta debe ser un número mayor o igual a 0');
  }
};
