import { syncGoogleDriveSales } from '../services/googleDriveService.js';
import { syncGoogleSheetSales } from '../services/googleSheetsService.js';
import { importExcelSalesBuffer, MATRIX_SOURCE } from '../services/salesImportService.js';
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
    const periodWasReplaced = result.replaced > 0;
    await createSyncRun({
      tipo: periodWasReplaced ? 'google_drive_replace' : 'google_drive',
      estado: 'ok',
      mensaje: periodWasReplaced
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
  const replacePeriod = req.body?.replace_period === true;
  const { file_base64, file_name } = req.body;

  if (file_base64) {
    const cleanBase64 = String(file_base64).includes(',')
      ? String(file_base64).split(',').pop()
      : String(file_base64);
    const buffer = Buffer.from(cleanBase64, 'base64');
    if (!buffer.length) throw new AppError('El archivo está vacío o no se pudo leer');

    const result = await importExcelSalesBuffer(buffer, MATRIX_SOURCE, { replacePeriod });
    const periodWasReplaced = result.replaced > 0;
    await createSyncRun({
      tipo: periodWasReplaced ? 'excel_upload_replace' : 'excel_upload',
      estado: 'ok',
      mensaje: `Importación manual de archivo ${file_name || 'Excel'}`,
      driveFile: file_name ? { name: file_name } : null,
      period: result.period,
      inserted: result.inserted,
      skipped: result.skipped,
      calculatedTotal: result.calculatedTotal
    });
    return res.json(result);
  }

  throw new AppError('Selecciona un archivo Excel para importar');
});

export const syncHistory = asyncHandler(async (_req, res) => {
  res.json(await listSyncRuns());
});
