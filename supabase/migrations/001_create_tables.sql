-- ==============================================================================
-- SCRIPT DE CREACIÓN DE TABLAS - SISTEMA DE INVENTARIO TI
-- ==============================================================================

-- Habilitar extensión pgcrypto para funciones de encriptación
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==============================================================================
-- TABLA: equipos
-- ==============================================================================
CREATE TABLE IF NOT EXISTS equipos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  categoria VARCHAR(100),
  marca VARCHAR(100),
  modelo VARCHAR(100),
  serial VARCHAR(100) UNIQUE,
  estado VARCHAR(50),
  ubicacion VARCHAR(255),
  sede VARCHAR(100),
  fecha_adquisicion DATE,
  valor_adquisicion DECIMAL(12,2),
  criticidad VARCHAR(50),
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para equipos
CREATE INDEX idx_equipos_serial ON equipos(serial);
CREATE INDEX idx_equipos_categoria ON equipos(categoria);
CREATE INDEX idx_equipos_estado ON equipos(estado);
CREATE INDEX idx_equipos_sede ON equipos(sede);

-- ==============================================================================
-- TABLA: mantenimientos
-- ==============================================================================
CREATE TABLE IF NOT EXISTS mantenimientos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipo_id UUID REFERENCES equipos(id) ON DELETE CASCADE,
  tipo_mantenimiento VARCHAR(100),
  estado VARCHAR(50),
  fecha_programada DATE,
  fecha_ejecucion DATE,
  presupuesto DECIMAL(12,2),
  costo_real DECIMAL(12,2),
  responsable VARCHAR(255),
  descripcion TEXT,
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mantenimientos
CREATE INDEX idx_mantenimientos_equipo ON mantenimientos(equipo_id);
CREATE INDEX idx_mantenimientos_estado ON mantenimientos(estado);
CREATE INDEX idx_mantenimientos_fecha ON mantenimientos(fecha_programada);

-- ==============================================================================
-- POLÍTICAS RLS (Row Level Security)
-- ==============================================================================

-- Habilitar RLS en equipos
ALTER TABLE equipos ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden leer equipos si están autenticados
CREATE POLICY "Usuarios autenticados pueden leer equipos" ON equipos
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Política: Usuarios autenticados pueden insertar
CREATE POLICY "Usuarios autenticados pueden crear equipos" ON equipos
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Política: Usuarios autenticados pueden actualizar
CREATE POLICY "Usuarios autenticados pueden actualizar equipos" ON equipos
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Habilitar RLS en mantenimientos
ALTER TABLE mantenimientos ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden leer mantenimientos si están autenticados
CREATE POLICY "Usuarios autenticados pueden leer mantenimientos" ON mantenimientos
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Política: Usuarios autenticados pueden insertar
CREATE POLICY "Usuarios autenticados pueden crear mantenimientos" ON mantenimientos
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Política: Usuarios autenticados pueden actualizar
CREATE POLICY "Usuarios autenticados pueden actualizar mantenimientos" ON mantenimientos
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- ==============================================================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- ==============================================================================

-- Insertar algunos equipos de ejemplo
INSERT INTO equipos (nombre, categoria, marca, modelo, serial, estado, ubicacion, sede, criticidad) VALUES
  ('Laptop HP ProBook', 'Computadora', 'HP', 'ProBook 450 G8', 'HP001', 'Operativo', 'Piso 2, Oficina 201', 'Sede Principal', 'Media'),
  ('Monitor Dell', 'Monitor', 'Dell', 'P2422H', 'DELL001', 'Operativo', 'Piso 2, Oficina 201', 'Sede Principal', 'Baja'),
  ('Switch Cisco', 'Red', 'Cisco', 'Catalyst 2960', 'CISCO001', 'Crítico', 'Sala de Servidores', 'Sede Principal', 'Alta')
ON CONFLICT DO NOTHING;

-- Mensaje de confirmación
SELECT 'Tablas creadas exitosamente' AS mensaje;
