import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: process.env.PORT || 4000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  googleSheetId: process.env.GOOGLE_SHEET_ID,
  googleDriveFileId: process.env.GOOGLE_DRIVE_FILE_ID,
  googleDriveFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID,
  googleClientEmail: process.env.GOOGLE_CLIENT_EMAIL,
  googlePrivateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  googleOAuthClientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
  googleOAuthClientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  googleOAuthRedirectUri: process.env.GOOGLE_OAUTH_REDIRECT_URI || 'http://localhost:4000/api/auth/google/callback',
  googleDriveAutoSync: process.env.GOOGLE_DRIVE_AUTO_SYNC === 'true',
  googleDriveAutoSyncMinutes: Number(process.env.GOOGLE_DRIVE_AUTO_SYNC_MINUTES || 15),
  googleDriveAutoSyncReplacePeriod: process.env.GOOGLE_DRIVE_AUTO_SYNC_REPLACE_PERIOD === 'true',
  frontendUrl: process.env.FRONTEND_URL
};
