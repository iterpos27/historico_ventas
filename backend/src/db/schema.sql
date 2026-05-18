CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'jefe_comercial', 'almacen');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS almacenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(120) NOT NULL,
  nomenclatura VARCHAR(20) NOT NULL UNIQUE,
  estado BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(120) NOT NULL,
  username VARCHAR(80) UNIQUE,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  rol user_role NOT NULL,
  almacen_id UUID REFERENCES almacenes(id),
  estado BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT usuarios_almacen_required CHECK (
    (rol = 'almacen' AND almacen_id IS NOT NULL) OR (rol <> 'almacen')
  )
);

CREATE TABLE IF NOT EXISTS ventas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha DATE NOT NULL,
  almacen_id UUID NOT NULL REFERENCES almacenes(id),
  producto VARCHAR(180) NOT NULL,
  cantidad NUMERIC(12, 2) NOT NULL CHECK (cantidad >= 0),
  precio_unitario NUMERIC(12, 2) NOT NULL,
  total NUMERIC(14, 2) NOT NULL,
  fuente VARCHAR(40) NOT NULL DEFAULT 'manual',
  external_hash TEXT UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS metas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  almacen_id UUID NOT NULL REFERENCES almacenes(id),
  periodo CHAR(7) NOT NULL,
  monto_meta NUMERIC(14, 2) NOT NULL CHECK (monto_meta >= 0),
  estado BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (almacen_id, periodo)
);

CREATE TABLE IF NOT EXISTS ventas_respaldo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  periodo CHAR(7) NOT NULL,
  fuente VARCHAR(40),
  registros JSONB NOT NULL,
  total_registros INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sync_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo VARCHAR(40) NOT NULL,
  estado VARCHAR(20) NOT NULL,
  mensaje TEXT,
  archivo_id TEXT,
  archivo_nombre TEXT,
  periodo CHAR(7),
  insertadas INTEGER NOT NULL DEFAULT 0,
  duplicadas INTEGER NOT NULL DEFAULT 0,
  total_calculado NUMERIC(14, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha);
CREATE INDEX IF NOT EXISTS idx_ventas_almacen_fecha ON ventas(almacen_id, fecha);
CREATE INDEX IF NOT EXISTS idx_metas_periodo ON metas(periodo);
CREATE INDEX IF NOT EXISTS idx_ventas_respaldo_periodo ON ventas_respaldo(periodo);
CREATE INDEX IF NOT EXISTS idx_sync_runs_created_at ON sync_runs(created_at DESC);

ALTER TABLE ventas DROP CONSTRAINT IF EXISTS ventas_precio_unitario_check;
ALTER TABLE ventas DROP CONSTRAINT IF EXISTS ventas_total_check;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS username VARCHAR(80) UNIQUE;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_almacenes_updated_at ON almacenes;
CREATE TRIGGER trg_almacenes_updated_at BEFORE UPDATE ON almacenes
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_usuarios_updated_at ON usuarios;
CREATE TRIGGER trg_usuarios_updated_at BEFORE UPDATE ON usuarios
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_ventas_updated_at ON ventas;
CREATE TRIGGER trg_ventas_updated_at BEFORE UPDATE ON ventas
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_metas_updated_at ON metas;
CREATE TRIGGER trg_metas_updated_at BEFORE UPDATE ON metas
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
