import * as authService from '../services/authService.js';
import { env } from '../config/env.js';
import { getGoogleAuthUrl, hasGoogleToken, saveGoogleTokenFromCode } from '../services/googleOAuthService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/errors.js';

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError('Email y contraseña son requeridos');
  res.json(await authService.login({ email, password }));
});

export const me = asyncHandler(async (req, res) => {
  res.json(await authService.getMe(req.user.id));
});

export const googleAuth = asyncHandler(async (_req, res) => {
  res.redirect(getGoogleAuthUrl());
});

export const googleCallback = asyncHandler(async (req, res) => {
  const { code } = req.query;
  if (!code) throw new AppError('Código OAuth requerido');
  await saveGoogleTokenFromCode(code);
  const targetOrigin = env.frontendUrl || '*';
  res.send(`
    <html>
      <body style="font-family: Arial, sans-serif; padding: 32px;">
        <h2>Google Drive conectado</h2>
        <p>Ya puedes volver al sistema. Esta ventana se cerrarÃ¡ automÃ¡ticamente.</p>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'google-connected' }, '${targetOrigin}');
          }
          setTimeout(() => window.close(), 900);
        </script>
      </body>
    </html>
  `);
});

export const googleStatus = asyncHandler(async (_req, res) => {
  res.json({ connected: await hasGoogleToken() });
});
