import { env } from '../config/env.js';
import { syncGoogleDriveSales } from './googleDriveService.js';
import { createSyncRun } from './syncLogService.js';

let timer = null;
let running = false;

const runDriveAutoSync = async () => {
  if (running) return;
  running = true;

  try {
    const result = await syncGoogleDriveSales({
      replacePeriod: env.googleDriveAutoSyncReplacePeriod
    });
    await createSyncRun({
      tipo: env.googleDriveAutoSyncReplacePeriod ? 'auto_drive_replace' : 'auto_drive',
      estado: 'ok',
      mensaje: 'Sincronizacion automatica desde Drive',
      driveFile: result.driveFile,
      period: result.period,
      inserted: result.inserted,
      skipped: result.skipped,
      calculatedTotal: result.calculatedTotal
    });
  } catch (error) {
    await createSyncRun({
      tipo: 'auto_drive',
      estado: 'error',
      mensaje: error.message
    }).catch(() => null);
    console.error(`Auto-sync Drive fallo: ${error.message}`);
  } finally {
    running = false;
  }
};

export const startAutoSync = () => {
  if (!env.googleDriveAutoSync) return;

  const minutes = Math.max(Number(env.googleDriveAutoSyncMinutes || 15), 1);
  const intervalMs = minutes * 60 * 1000;

  timer = setInterval(runDriveAutoSync, intervalMs);
  console.log(`Auto-sync Drive activo cada ${minutes} minuto(s)`);
};

export const stopAutoSync = () => {
  if (timer) clearInterval(timer);
  timer = null;
};
