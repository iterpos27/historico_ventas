import { query } from '../db/pool.js';

export const createSyncRun = async ({
  tipo,
  estado,
  mensaje = '',
  driveFile = null,
  period = null,
  inserted = 0,
  skipped = 0,
  calculatedTotal = 0
}) => {
  const { rows } = await query(
    `INSERT INTO sync_runs (
       tipo, estado, mensaje, archivo_id, archivo_nombre, archivo_modificado_at, periodo,
       insertadas, duplicadas, total_calculado
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      tipo,
      estado,
      mensaje,
      driveFile?.id || null,
      driveFile?.name || null,
      driveFile?.modifiedTime || null,
      period,
      inserted,
      skipped,
      calculatedTotal
    ]
  );
  return rows[0];
};

export const listSyncRuns = async () => {
  const { rows } = await query(
    `SELECT *
     FROM sync_runs
     ORDER BY created_at DESC
     LIMIT 20`
  );
  return rows;
};

export const getLatestCutoff = async () => {
  const { rows } = await query(
    `SELECT id, archivo_nombre, archivo_modificado_at, created_at,
       COALESCE(archivo_modificado_at, created_at) AS cutoff_at
     FROM sync_runs
     WHERE estado = 'ok'
     ORDER BY COALESCE(archivo_modificado_at, created_at) DESC, created_at DESC
     LIMIT 1`
  );
  return rows[0] || null;
};
