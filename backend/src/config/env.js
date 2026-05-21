import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'cambia_este_secreto')) {
  throw new Error('JWT_SECRET es obligatorio en producción');
}

if (isProduction && !process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL es obligatorio en producción');
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 4000,
  databaseUrl: process.env.DATABASE_URL,
  databaseSsl: process.env.DB_SSL === 'true' || process.env.DATABASE_URL?.includes('sslmode=require'),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  googleSheetId: process.env.GOOGLE_SHEET_ID,
  googleDriveFileId: process.env.GOOGLE_DRIVE_FILE_ID,
  googleDriveFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID,
  googleClientEmail: process.env.GOOGLE_CLIENT_EMAIL,
  googlePrivateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  googleOAuthClientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
  googleOAuthClientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  googleOAuthRedirectUri: process.env.GOOGLE_OAUTH_REDIRECT_URI || 'http://localhost:4000/api/auth/google/callback',
  tokenEncryptionKey: process.env.TOKEN_ENCRYPTION_KEY,
  googleDriveAutoSync: process.env.GOOGLE_DRIVE_AUTO_SYNC === 'true',
  googleDriveAutoSyncMinutes: Number(process.env.GOOGLE_DRIVE_AUTO_SYNC_MINUTES || 15),
  googleDriveAutoSyncReplacePeriod: process.env.GOOGLE_DRIVE_AUTO_SYNC_REPLACE_PERIOD === 'true',
  frontendUrl: process.env.FRONTEND_URL
};
