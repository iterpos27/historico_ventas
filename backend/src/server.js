import { app } from './app.js';
import { env } from './config/env.js';
import { startAutoSync } from './services/autoSyncService.js';

app.listen(env.port, () => {
  console.log(`API escuchando en http://localhost:${env.port}`);
  startAutoSync();
});
