import { google } from 'googleapis';
import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';
import { getAuthorizedOAuthClient } from './googleOAuthService.js';
import { importSalesRecords, matrixRowsToSalesRecords, rowsToSalesRecords } from './salesImportService.js';

const normalizeText = (value) => String(value ?? '').trim();
const normalizeKey = (value) => normalizeText(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toUpperCase();

const getSheetsClient = () => {
  if (!env.googleSheetId) {
    throw new AppError('GOOGLE_SHEET_ID no está configurado');
  }

  if (!env.googleClientEmail || !env.googlePrivateKey) return null;

  const auth = new google.auth.JWT({
    email: env.googleClientEmail,
    key: env.googlePrivateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });

  return google.sheets({ version: 'v4', auth });
};

const valuesToRows = (values) => {
  const headerIndex = values.findIndex((row) => {
    const keys = row.map(normalizeKey);
    return keys.includes('SUBTOTAL NETO') && keys.includes('ESTABLECIMIENTO');
  });

  if (headerIndex === -1) {
    throw new AppError('No se encontró una fila de encabezados con SUBTOTAL NETO y ESTABLECIMIENTO');
  }

  const headers = values[headerIndex].map(normalizeText);
  return values.slice(headerIndex + 1).map((row) => Object.fromEntries(
    headers.map((header, index) => [header, row[index] ?? null])
  ));
};

export const syncGoogleSheetSales = async () => {
  let sheets = getSheetsClient();
  if (!sheets) {
    const auth = await getAuthorizedOAuthClient();
    sheets = google.sheets({ version: 'v4', auth });
  }

  let response;
  try {
    response = await sheets.spreadsheets.values.get({
      spreadsheetId: env.googleSheetId,
      range: 'A:AI'
    });
  } catch (error) {
    const googleMessage = error.response?.data?.error?.message || error.message;
    if (googleMessage?.includes('must not be an Office file')) {
      throw new AppError('El archivo en Google Drive sigue siendo Excel/Office. Abre el archivo en Google Sheets y usa Archivo > Guardar como Hojas de cálculo de Google; luego coloca el ID de esa nueva hoja en GOOGLE_SHEET_ID.', 400);
    }
    throw new AppError(`No se pudo leer Google Sheets: ${googleMessage}`, error.status || 400);
  }

  const values = response.data.values || [];
  const matrix = matrixRowsToSalesRecords(values);
  if (matrix?.records?.length) {
    return importSalesRecords(matrix.records, 'google_sheets_matrix');
  }

  const rows = valuesToRows(values);
  const records = rowsToSalesRecords(rows, 1);
  return importSalesRecords(records, 'google_sheets');
};
