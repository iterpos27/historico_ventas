import { google } from 'googleapis';
import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';
import { getAuthorizedOAuthClient } from './googleOAuthService.js';
import { importExcelSalesBuffer } from './salesImportService.js';

const googleSheetMime = 'application/vnd.google-apps.spreadsheet';
const xlsxMime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const getDriveClient = async () => {
  const auth = await getAuthorizedOAuthClient();
  return google.drive({ version: 'v3', auth });
};

const getFileId = () => {
  if (!env.googleDriveFileId && !env.googleDriveFolderId) {
    throw new AppError('Configura GOOGLE_DRIVE_FOLDER_ID o GOOGLE_DRIVE_FILE_ID');
  }
  return env.googleDriveFileId;
};

const findLatestSpreadsheetFile = async (drive) => {
  if (!env.googleDriveFolderId) return null;

  const response = await drive.files.list({
    q: `'${env.googleDriveFolderId}' in parents and trashed = false and (` +
      `mimeType = 'application/vnd.ms-excel' or ` +
      `mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' or ` +
      `mimeType = 'application/vnd.google-apps.spreadsheet' or ` +
      `name contains '.xls')`,
    fields: 'files(id,name,mimeType,modifiedTime)',
    orderBy: 'modifiedTime desc',
    pageSize: 10,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true
  });

  const file = response.data.files?.[0];
  if (!file) {
    throw new AppError('No se encontró ningún archivo .xls/.xlsx en la carpeta configurada de Google Drive');
  }
  return file;
};

const downloadDriveFile = async (drive, file) => {
  if (file.mimeType === googleSheetMime) {
    const exported = await drive.files.export(
      { fileId: file.id, mimeType: xlsxMime },
      { responseType: 'arraybuffer' }
    );
    return Buffer.from(exported.data);
  }

  const downloaded = await drive.files.get(
    { fileId: file.id, alt: 'media' },
    { responseType: 'arraybuffer' }
  );
  return Buffer.from(downloaded.data);
};

export const syncGoogleDriveSales = async (options = {}) => {
  const drive = await getDriveClient();
  const fileId = getFileId();

  let metadata;
  try {
    const latestFile = await findLatestSpreadsheetFile(drive);
    if (latestFile) {
      metadata = latestFile;
    } else {
      const response = await drive.files.get({
        fileId,
        fields: 'id,name,mimeType,modifiedTime',
        supportsAllDrives: true
      });
      metadata = response.data;
    }
  } catch (error) {
    const message = error.response?.data?.error?.message || error.message;
    if (message?.toLowerCase().includes('insufficient') || message?.toLowerCase().includes('scope')) {
      throw new AppError('Google fue autorizado antes sin permiso de Drive. Presiona Conectar Google nuevamente y acepta el permiso de Google Drive.', 401);
    }
    throw new AppError(`No se pudo acceder al archivo de Drive: ${message}`, error.status || 400);
  }

  let buffer;
  try {
    buffer = await downloadDriveFile(drive, metadata);
  } catch (error) {
    const message = error.response?.data?.error?.message || error.message;
    throw new AppError(`No se pudo descargar el archivo de Drive: ${message}`, error.status || 400);
  }

  try {
    const result = await importExcelSalesBuffer(buffer, 'google_drive_matrix', {
      replacePeriod: options.replacePeriod
    });
    return {
      ...result,
      driveFile: {
        id: metadata.id,
        name: metadata.name,
        mimeType: metadata.mimeType,
        modifiedTime: metadata.modifiedTime
      }
    };
  } catch (error) {
    throw new AppError(`No se pudo procesar el archivo de Drive: ${error.message}`, 400);
  }
};
