-- ── Migración: Sistema de Suplencias ─────────────────────────────────────────
-- Ejecutar sobre la base de datos imdai_manuales

-- 1. Columna en historial para rastrear si el cambio fue hecho por un suplente
ALTER TABLE historial_versiones
ADD COLUMN IF NOT EXISTS en_suplencia_de INT REFERENCES usuarios(id_usuario);

-- 2. Tabla de suplencias
CREATE TABLE IF NOT EXISTS suplencias (
    id_suplencia    SERIAL PRIMARY KEY,
    sujeto_obligado INT NOT NULL REFERENCES usuarios(id_usuario),
    suplente        INT NOT NULL REFERENCES usuarios(id_usuario),
    motivo          VARCHAR(200),
    activo          BOOLEAN DEFAULT TRUE,
    creado_por      INT REFERENCES usuarios(id_usuario),
    fecha_creacion  TIMESTAMP DEFAULT NOW(),
    CONSTRAINT no_autosuplencia CHECK (sujeto_obligado <> suplente)
);

-- 3. Índice único: solo una suplencia activa por sujeto obligado a la vez
CREATE UNIQUE INDEX IF NOT EXISTS idx_suplencia_activa
ON suplencias (sujeto_obligado)
WHERE activo = TRUE;
