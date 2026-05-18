import bcrypt from 'bcryptjs';
import { pool } from './pool.js';

const periodo = '2026-05';

const branches = [
  { nombre: 'Matriz', nomenclatura: 'MAT', meta: 35000 },
  { nombre: 'Guayaquil', nomenclatura: 'GYE', meta: 25000 },
  { nombre: 'Quito', nomenclatura: 'UIO', meta: 20000 }
];

const users = [
  { nombre: 'Administrador', email: 'admin@empresa.com', password: 'Admin123*', rol: 'admin' },
  { nombre: 'Jefe Comercial', email: 'jefe@empresa.com', password: 'Jefe123*', rol: 'jefe_comercial' },
  { nombre: 'Usuario Matriz', email: 'matriz@empresa.com', password: 'Matriz123*', rol: 'almacen', nomenclatura: 'MAT' },
  { nombre: 'Usuario Guayaquil', email: 'guayaquil@empresa.com', password: 'Guayaquil123*', rol: 'almacen', nomenclatura: 'GYE' },
  { nombre: 'Usuario Quito', email: 'quito@empresa.com', password: 'Quito123*', rol: 'almacen', nomenclatura: 'UIO' }
];

const run = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const branch of branches) {
      await client.query(
        `INSERT INTO almacenes (nombre, nomenclatura, estado)
         VALUES ($1, $2, true)
         ON CONFLICT (nomenclatura) DO UPDATE
         SET nombre = EXCLUDED.nombre, estado = true`,
        [branch.nombre, branch.nomenclatura]
      );
    }

    const branchRows = await client.query('SELECT id, nomenclatura FROM almacenes');
    const branchByCode = Object.fromEntries(branchRows.rows.map((row) => [row.nomenclatura, row.id]));

    for (const branch of branches) {
      await client.query(
        `INSERT INTO metas (almacen_id, periodo, monto_meta, estado)
         VALUES ($1, $2, $3, true)
         ON CONFLICT (almacen_id, periodo) DO UPDATE
         SET monto_meta = EXCLUDED.monto_meta, estado = true`,
        [branchByCode[branch.nomenclatura], periodo, branch.meta]
      );
    }

    for (const user of users) {
      const passwordHash = await bcrypt.hash(user.password, 10);
      const username = user.email.split('@')[0];
      await client.query(
        `INSERT INTO usuarios (nombre, username, email, password_hash, rol, almacen_id, estado)
         VALUES ($1, $2, $3, $4, $5, $6, true)
         ON CONFLICT (email) DO UPDATE
         SET nombre = EXCLUDED.nombre,
             username = EXCLUDED.username,
             password_hash = EXCLUDED.password_hash,
             rol = EXCLUDED.rol,
             almacen_id = EXCLUDED.almacen_id,
             estado = true`,
        [
          user.nombre,
          username,
          user.email,
          passwordHash,
          user.rol,
          user.nomenclatura ? branchByCode[user.nomenclatura] : null
        ]
      );
    }

    await client.query('COMMIT');
    console.log('Seed completado');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

run();
