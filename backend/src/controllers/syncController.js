import { syncGoogleDriveSales } from '../services/googleDriveService.js';
import { syncGoogleSheetSales } from '../services/googleSheetsService.js';
import { importExcelSales } from '../services/salesImportService.js';
import { createSyncRun, listSyncRuns } from '../services/syncLogService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/errors.js';

export const syncGoogleSheets = asyncHandler(async (_req, res) => {
  res.json(await syncGoogleSheetSales());
});

export const syncGoogleDrive = asyncHandler(async (req, res) => {
  const replacePeriod = req.body?.replace_period === true;
  try {
    const result = await syncGoogleDriveSales({ replacePeriod });
    await createSyncRun({
      tipo: replacePeriod ? 'google_drive_replace' : 'google_drive',
      estado: 'ok',
      mensaje: replacePeriod
        ? `Periodo ${result.period || ''} reemplazado antes de importar`
        : 'Sincronizacion manual desde Drive',
      driveFile: result.driveFile,
      period: result.period,
      inserted: result.inserted,
      skipped: result.skipped,
      calculatedTotal: result.calculatedTotal
    });
    res.json(result);
  } catch (error) {
    await createSyncRun({
      tipo: replacePeriod ? 'google_drive_replace' : 'google_drive',
      estado: 'error',
      mensaje: error.message
    });
    throw error;
  }
});

export const importExcel = asyncHandler(async (req, res) => {
  const { file_path } = req.body;
  if (!file_path) throw new AppError('file_path es requerido');
  res.json(await importExcelSales(file_path, { replacePeriod: req.body?.replace_period === true }));
});

export const syncHistory = asyncHandler(async (_req, res) => {
  res.json(await listSyncRuns());
});
