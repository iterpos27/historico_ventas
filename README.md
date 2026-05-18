# Sistema de ventas por almacén

Sistema web para consultar ventas por almacén/sucursal, controlar metas comerciales y medir cumplimiento por rol.

## Arquitectura

- `frontend`: React + Vite + Tailwind CSS + Recharts.
- `backend`: Node.js + Express + PostgreSQL.
- Autenticacion: JWT + bcrypt.
- Integracion: Google OAuth + Google Drive API para importar automaticamente el ultimo archivo `.xls`, `.xlsx` o Google Sheet de una carpeta.
- Seguridad: el backend valida roles y obtiene el `almacen_id` desde el token. El frontend no decide qué almacén puede ver un usuario.

## Instalacion

1. Crear una base PostgreSQL.
2. Copiar variables de entorno:

```bash
cp backend/.env.example backend/.env
```

3. Instalar dependencias:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

4. Ejecutar migracion:

```bash
cd backend
npm run migrate
```

5. Cargar datos iniciales:

```bash
npm run seed
```

6. Ejecutar en desarrollo:

```bash
npm run dev
```

Tambien puedes iniciar cada lado por separado:

```bash
cd backend && npm run dev
cd frontend && npm run dev -- --port 5173
```

## Variables principales

```env
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgres://postgres:postgres@localhost:5432/ventas_almacenes
JWT_SECRET=cambia_este_secreto

GOOGLE_DRIVE_FOLDER_ID=
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:4000/api/auth/google/callback

GOOGLE_DRIVE_AUTO_SYNC=false
GOOGLE_DRIVE_AUTO_SYNC_MINUTES=15
GOOGLE_DRIVE_AUTO_SYNC_REPLACE_PERIOD=false
```

En el frontend:

```env
VITE_API_URL=http://localhost:4000/api
```

`GOOGLE_DRIVE_FOLDER_ID` es la carpeta donde se suben los archivos de ventas. El sistema toma el archivo más reciente automáticamente, así no necesitas cambiar IDs cada mes.

## Usuarios iniciales

- Admin: `admin` o `admin@empresa.com` / `Admin123*`
- Jefe comercial: `jefe` o `jefe@empresa.com` / `Jefe123*`
- Matriz: `matriz` o `matriz@empresa.com` / `Matriz123*`
- Guayaquil: `guayaquil` o `guayaquil@empresa.com` / `Guayaquil123*`
- Quito: `quito` o `quito@empresa.com` / `Quito123*`

## Flujo de Google Drive

1. Configura OAuth en Google Cloud.
2. Agrega `http://localhost:4000/api/auth/google/callback` como redirect URI.
3. Activa Google Drive API.
4. Coloca el `Client ID`, `Client Secret` y `GOOGLE_DRIVE_FOLDER_ID` en `backend/.env`.
5. En el sistema entra como admin y pulsa `Conectar Google`.
6. Sube el archivo de ventas a esa carpeta de Drive.
7. Pulsa `Sincronizar Drive`.

Si subes un archivo corregido del mismo periodo, marca `Reemplazar ventas del periodo importado`. El sistema respalda las ventas anteriores en `ventas_respaldo` antes de borrar e importar de nuevo.

## Importación manual de Excel

El botón `Importar Excel` usa carga de archivo desde el navegador. En producción no se debe escribir una ruta local del servidor; el administrador selecciona el `.xls` o `.xlsx` desde su equipo y el backend procesa el archivo recibido.

## Producción

Antes de publicar:

- Configura `NODE_ENV=production`.
- Usa un `JWT_SECRET` fuerte y único.
- Configura `DATABASE_URL` con la base real.
- Configura `FRONTEND_URL` con el dominio del frontend publicado.
- Configura `VITE_API_URL` con la URL pública del backend, terminando en `/api`.
- En Google Cloud agrega el callback productivo en `GOOGLE_OAUTH_REDIRECT_URI`.
- Ejecuta `npm run build` en `frontend` y sirve `frontend/dist`.
- Ejecuta el backend con `npm run start` bajo PM2, systemd o el servicio del hosting.
- Programa respaldo diario de PostgreSQL antes de activar sincronización automática.

## Automatizacion Drive

Para que el backend sincronice solo cada X minutos:

```env
GOOGLE_DRIVE_AUTO_SYNC=true
GOOGLE_DRIVE_AUTO_SYNC_MINUTES=15
GOOGLE_DRIVE_AUTO_SYNC_REPLACE_PERIOD=false
```

Después reinicia el backend. Cada ejecución queda registrada en `sync_runs` y se muestra en el apartado de ventas del admin.

## Endpoints clave

- `POST /api/auth/login`
- `GET /api/me`
- `GET /api/ventas/total?periodo=2026-05`
- `GET /api/ventas/resumen?periodo=2026-05`
- `GET /api/ventas/por-almacen?periodo=2026-05`
- `GET /api/ventas/cumplimiento-metas?periodo=2026-05`
- `GET /api/ventas/historial-mensual`
- `POST /api/sync/google-drive`
- `GET /api/sync/historial`

## Archivo esperado

El formato actual se alimenta de la matriz de ventas con:

- `Mes`
- `Año`
- `Establecimiento`
- `Total`

La fila final de total general no se suma como almacén. Solo se usa como referencia contra el total calculado.
