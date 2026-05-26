import { query } from '../db/pool.js';
import { remember } from '../utils/memoryCache.js';
import { currentPeriod, periodToDateRange } from '../utils/period.js';

const salesCacheKey = (name, user, periodo = '') => [
  'sales',
  name,
  user.rol,
  user.almacen_id || 'all',
  periodo || currentPeriod()
].join(':');

const scopeFilter = (user, params) => {
  if (user.rol !== 'almacen') return '';
  params.push(user.almacen_id);
  return ` AND v.almacen_id = $${params.length}`;
};

export const getTotalSales = async (user, periodo) => {
  const cacheKey = salesCacheKey('total', user, periodo);
  return remember(cacheKey, async () => {
  const { start, end } = periodToDateRange(periodo || currentPeriod());
  const params = [start, end];
  const scope = scopeFilter(user, params);
  const { rows } = await query(
    `SELECT COALESCE(SUM(v.total), 0)::numeric AS total
     FROM ventas v
     WHERE v.fecha >= $1 AND v.fecha < $2 ${scope}`,
    params
  );
  return rows[0];
  });
};

export const getSalesSummary = async (user, periodo) => {
  const cacheKey = salesCacheKey('summary', user, periodo);
  return remember(cacheKey, async () => {
  const { start, end } = periodToDateRange(periodo || currentPeriod());
  const today = new Date().toISOString().slice(0, 10);
  const params = [start, end, today];
  const scope = scopeFilter(user, params);
  const { rows } = await query(
    `SELECT
       COALESCE(SUM(v.total), 0)::numeric AS ventas_mes,
       COALESCE(SUM(v.total) FILTER (WHERE v.fecha = $3), 0)::numeric AS ventas_hoy,
       COUNT(*)::int AS transacciones
     FROM ventas v
     WHERE v.fecha >= $1 AND v.fecha < $2 ${scope}`,
    params
  );
  return rows[0];
  });
};

export const getSalesByBranch = async (user, periodo) => {
  const cacheKey = salesCacheKey('by-branch', user, periodo);
  return remember(cacheKey, async () => {
  const { start, end } = periodToDateRange(periodo || currentPeriod());
  const params = [start, end];
  let scope = '';
  if (user.rol === 'almacen') {
    params.push(user.almacen_id);
    scope = ` AND a.id = $${params.length}`;
  }
  const { rows } = await query(
    `SELECT a.id AS almacen_id, a.nombre, a.nomenclatura,
       COALESCE(SUM(v.total), 0)::numeric AS total
     FROM almacenes a
     LEFT JOIN ventas v ON v.almacen_id = a.id AND v.fecha >= $1 AND v.fecha < $2
     WHERE a.estado = true ${scope}
     GROUP BY a.id, a.nombre, a.nomenclatura
     ORDER BY total DESC`,
    params
  );
  return rows;
  });
};

export const getGoalCompliance = async (user, periodo) => {
  const cacheKey = salesCacheKey('goal-compliance', user, periodo);
  return remember(cacheKey, async () => {
  const range = periodToDateRange(periodo || currentPeriod());
  const params = [range.period, range.start, range.end];
  const filters = ['m.estado = true'];

  if (user.rol === 'almacen') {
    params.push(user.almacen_id);
    filters.push(`m.almacen_id = $${params.length}`);
  }

  const { rows } = await query(
    `SELECT a.id AS almacen_id, a.nombre, a.nomenclatura, m.periodo,
       m.monto_meta,
       COALESCE(SUM(v.total), 0)::numeric AS ventas_periodo,
       GREATEST(m.monto_meta - COALESCE(SUM(v.total), 0), 0)::numeric AS falta,
       GREATEST(COALESCE(SUM(v.total), 0) - m.monto_meta, 0)::numeric AS excedente,
       CASE
         WHEN m.monto_meta = 0 THEN 0
         ELSE ROUND((COALESCE(SUM(v.total), 0) / m.monto_meta) * 100, 2)
       END AS cumplimiento
     FROM metas m
     JOIN almacenes a ON a.id = m.almacen_id
     LEFT JOIN ventas v ON v.almacen_id = m.almacen_id AND v.fecha >= $2 AND v.fecha < $3
     WHERE m.periodo = $1 AND ${filters.join(' AND ')}
     GROUP BY a.id, a.nombre, a.nomenclatura, m.periodo, m.monto_meta
     ORDER BY cumplimiento DESC`,
    params
  );
  return rows;
  });
};

export const getMonthlyHistory = async (user) => {
  const cacheKey = salesCacheKey('monthly-history', user, 'all');
  return remember(cacheKey, async () => {
  const params = [];
  const filters = [];

  if (user.rol === 'almacen') {
    params.push(user.almacen_id);
    filters.push(`a.id = $${params.length}`);
  }

  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const { rows } = await query(
    `WITH periodos AS (
       SELECT TO_CHAR(fecha, 'YYYY-MM') AS periodo FROM ventas
       UNION
       SELECT periodo FROM metas WHERE estado = true
     ),
     ventas_periodo AS (
       SELECT TO_CHAR(v.fecha, 'YYYY-MM') AS periodo, SUM(v.total)::numeric AS ventas
       FROM ventas v
       JOIN almacenes a ON a.id = v.almacen_id
       ${where}
       GROUP BY TO_CHAR(v.fecha, 'YYYY-MM')
     ),
     metas_periodo AS (
       SELECT m.periodo, SUM(m.monto_meta)::numeric AS meta
       FROM metas m
       JOIN almacenes a ON a.id = m.almacen_id
       ${where ? `${where} AND m.estado = true` : 'WHERE m.estado = true'}
       GROUP BY m.periodo
     )
     SELECT p.periodo,
       COALESCE(v.ventas, 0)::numeric AS ventas,
       COALESCE(m.meta, 0)::numeric AS meta,
       CASE
         WHEN COALESCE(m.meta, 0) = 0 THEN 0
         ELSE ROUND((COALESCE(v.ventas, 0) / m.meta) * 100, 2)
       END AS cumplimiento
     FROM periodos p
     LEFT JOIN ventas_periodo v ON v.periodo = p.periodo
     LEFT JOIN metas_periodo m ON m.periodo = p.periodo
     ORDER BY p.periodo DESC
     LIMIT 18`,
    params
  );
  return rows;
  });
};
