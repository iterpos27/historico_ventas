import { pool } from './pool.js';

const source = process.argv[2];

if (!source) {
  console.error('Uso: node src/db/deleteSalesBySource.js <fuente>');
  process.exit(1);
}

try {
  const result = await pool.query('DELETE FROM ventas WHERE fuente = $1', [source]);
  console.log(`Ventas eliminadas para fuente ${source}: ${result.rowCount}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
