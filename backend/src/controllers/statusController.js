import { query } from '../db/pool.js';
import { hasGoogleToken } from '../services/googleOAuthService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const status = asyncHandler(async (_req, res) => {
  const dbStarted = Date.now();
  const dbResult = await query('SELECT NOW() AS checked_at');
  const dbLatencyMs = Date.now() - dbStarted;

  const googleConnected = await hasGoogleToken();
  const latestSync = await query(
    `SELECT *
     FROM sync_runs
     ORDER BY created_at DESC
     LIMIT 1`
  );

  res.json({
    database: {
      ok: true,
      checked_at: dbResult.rows[0]?.checked_at,
      latency_ms: dbLatencyMs
    },
    google: {
      connected: googleConnected
    },
    latest_sync: latestSync.rows[0] || null
  });
});
