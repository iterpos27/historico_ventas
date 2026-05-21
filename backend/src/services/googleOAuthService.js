import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { google } from 'googleapis';
import { env } from '../config/env.js';
import { query } from '../db/pool.js';
import { AppError } from '../utils/errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tokenPath = path.resolve(__dirname, '../../storage/google-token.json');
const googleTokenKey = 'google_oauth_token';

const scopes = [
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/drive.readonly'
];

const getTokenEncryptionKey = () => {
  if (!env.tokenEncryptionKey) return null;
  return crypto.createHash('sha256').update(env.tokenEncryptionKey).digest();
};

const serializeToken = (tokens) => {
  const key = getTokenEncryptionKey();
  if (!key) return tokens;

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(tokens), 'utf8'),
    cipher.final()
  ]);

  return {
    encrypted: true,
    algorithm: 'aes-256-gcm',
    iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'),
    data: encrypted.toString('base64')
  };
};

const deserializeToken = (storedToken) => {
  if (!storedToken?.encrypted) return storedToken;

  const key = getTokenEncryptionKey();
  if (!key) {
    throw new AppError('TOKEN_ENCRYPTION_KEY es requerida para leer el token de Google guardado');
  }

  const decipher = crypto.createDecipheriv(
    storedToken.algorithm || 'aes-256-gcm',
    key,
    Buffer.from(storedToken.iv, 'base64')
  );
  decipher.setAuthTag(Buffer.from(storedToken.tag, 'base64'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(storedToken.data, 'base64')),
    decipher.final()
  ]);
  return JSON.parse(decrypted.toString('utf8'));
};

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

const saveGoogleToken = async (tokens) => {
  const storedToken = serializeToken(tokens);
  await query(
    `INSERT INTO app_settings (key, value)
     VALUES ($1, $2::jsonb)
     ON CONFLICT (key) DO UPDATE
     SET value = EXCLUDED.value`,
    [googleTokenKey, JSON.stringify(storedToken)]
  );

  await fs.mkdir(path.dirname(tokenPath), { recursive: true }).catch(() => null);
  await fs.writeFile(tokenPath, JSON.stringify(storedToken, null, 2), 'utf8').catch(() => null);
};

const readGoogleToken = async () => {
  const { rows } = await query(
    'SELECT value FROM app_settings WHERE key = $1',
    [googleTokenKey]
  );

  if (rows[0]?.value) return deserializeToken(rows[0].value);

  const raw = await fs.readFile(tokenPath, 'utf8');
  return deserializeToken(JSON.parse(raw));
};

export const saveGoogleTokenFromCode = async (code) => {
  const client = getOAuthClient();
  const { tokens } = await client.getToken(code);
  await saveGoogleToken(tokens);
  return tokens;
};

export const getAuthorizedOAuthClient = async () => {
  const client = getOAuthClient();

  try {
    const tokens = await readGoogleToken();
    client.setCredentials(tokens);
    client.on('tokens', async (newTokens) => {
      await saveGoogleToken({ ...tokens, ...newTokens }).catch(() => null);
    });
    return client;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Google no está conectado. Abre /api/auth/google para autorizar el acceso.', 401);
  }
};

export const hasGoogleToken = async () => {
  try {
    await readGoogleToken();
    return true;
  } catch {
    return false;
  }
};
