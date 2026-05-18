import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { google } from 'googleapis';
import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tokenPath = path.resolve(__dirname, '../../storage/google-token.json');

const scopes = [
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/drive.readonly'
];

export const getOAuthClient = () => {
  if (!env.googleOAuthClientId || !env.googleOAuthClientSecret) {
    throw new AppError('Credenciales OAuth de Google incompletas');
  }

  return new google.auth.OAuth2(
    env.googleOAuthClientId,
    env.googleOAuthClientSecret,
    env.googleOAuthRedirectUri
  );
};

export const getGoogleAuthUrl = () => {
  const client = getOAuthClient();
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes
  });
};

export const saveGoogleTokenFromCode = async (code) => {
  const client = getOAuthClient();
  const { tokens } = await client.getToken(code);
  await fs.mkdir(path.dirname(tokenPath), { recursive: true });
  await fs.writeFile(tokenPath, JSON.stringify(tokens, null, 2), 'utf8');
  return tokens;
};

export const getAuthorizedOAuthClient = async () => {
  const client = getOAuthClient();

  try {
    const raw = await fs.readFile(tokenPath, 'utf8');
    client.setCredentials(JSON.parse(raw));
    return client;
  } catch {
    throw new AppError('Google no está conectado. Abre /api/auth/google para autorizar el acceso.', 401);
  }
};

export const hasGoogleToken = async () => {
  try {
    await fs.access(tokenPath);
    return true;
  } catch {
    return false;
  }
};
