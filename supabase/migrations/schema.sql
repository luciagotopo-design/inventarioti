-- ====================================================
-- SCHEMA COMPLETO PARA INVENTARIO TI - SUPABASE
-- ====================================================

-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================
-- TABLA: CATEGORÍAS
-- ====================================================
CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) UNIQUE NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================
-- TABLA: ESTADOS
-- ====================================================
CREATE TABLE estados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) UNIQUE NOT NULL,
  color VARCHAR(7) NOT NULL, -- hex color #RRGGBB
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================
-- TABLA: SEDES
-- ====================================================
CREATE TABLE sedes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) UNIQUE NOT NULL,
  direccion TEXT,
  ciudad VARCHAR(255),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================
-- TABLA: PRIORIDADES
-- ====================================================
CREATE TABLE prioridades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) UNIQUE NOT NULL,
  color VARCHAR(7) NOT NULL, -- hex color
  nivel INTEGER NOT NULL, -- 1=Alta, 2=Media, 3=Baja
  descripcion TEXT,
  orden INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================
-- TABLA: ACCIONES DE MANTENIMIENTO
-- ====================================================
CREATE TABLE acciones_mantenimiento (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) UNIQUE NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================
-- TABLA PRINCIPAL: INVENTARIO GENERAL
-- ====================================================
CREATE TABLE inventario_general (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  serial VARCHAR(255) UNIQUE NOT NULL,
  cantidad INTEGER DEFAULT 1,
  marca VARCHAR(255) NOT NULL,
  modelo VARCHAR(255) NOT NULL,
  ubicacion_detallada TEXT,
  responsable VARCHAR(255),
  fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  imagenes TEXT[] DEFAULT '{}',
  es_critico BOOLEAN DEFAULT false,
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign Keys
  categoria_id UUID NOT NULL REFERENCES categorias(id),
  estado_id UUID NOT NULL REFERENCES estados(id),
  sede_id UUID NOT NULL REFERENCES sedes(id)
);

-- ====================================================
-- TABLA: EQUIPOS CRÍTICOS
-- ====================================================
CREATE TABLE equipos_criticos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  accion_requerida TEXT NOT NULL,
  imagenes TEXT[] DEFAULT '{}',
  costo_estimado DECIMAL(10,2),
  fecha_limite_accion TIMESTAMP WITH TIME ZONE,
  resuelto BOOLEAN DEFAULT false,
  notas_resolucion TEXT,
  fecha_resolucion TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign Keys
  id_equipo UUID UNIQUE NOT NULL REFERENCES inventario_general(id) ON DELETE CASCADE,
  nivel_prioridad_id UUID NOT NULL REFERENCES prioridades(id)
);

-- ====================================================
-- TABLA: PLAN DE MANTENIMIENTO
-- ====================================================
CREATE TABLE plan_mantenimiento (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  responsable_ejecucion VARCHAR(255),
  fecha_programada TIMESTAMP WITH TIME ZONE NOT NULL,
  fecha_ejecucion TIMESTAMP WITH TIME ZONE,
  estado_ejecucion VARCHAR(50) DEFAULT 'Pendiente', -- Pendiente, En Proceso, Completado, Cancelado
  presupuesto DECIMAL(10,2),
  costo_real DECIMAL(10,2),
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign Keys
  id_equipo UUID NOT NULL REFERENCES inventario_general(id) ON DELETE CASCADE,
  accion_id UUID NOT NULL REFERENCES acciones_mantenimiento(id)
);

-- ====================================================
-- ÍNDICES PARA MEJOR RENDIMIENTO
-- ====================================================
CREATE INDEX idx_inventario_categoria ON inventario_general(categoria_id);
CREATE INDEX idx_inventario_estado ON inventario_general(estado_id);
CREATE INDEX idx_inventario_sede ON inventario_general(sede_id);
CREATE INDEX idx_inventario_serial ON inventario_general(serial);
CREATE INDEX idx_inventario_critico ON inventario_general(es_critico);

CREATE INDEX idx_equipos_criticos_equipo ON equipos_criticos(id_equipo);
CREATE INDEX idx_equipos_criticos_prioridad ON equipos_criticos(nivel_prioridad_id);

CREATE INDEX idx_plan_mantenimiento_equipo ON plan_mantenimiento(id_equipo);
CREATE INDEX idx_plan_mantenimiento_accion ON plan_mantenimiento(accion_id);
CREATE INDEX idx_plan_mantenimiento_fecha ON plan_mantenimiento(fecha_programada);

-- ====================================================
-- FUNCIÓN PARA ACTUALIZAR updated_at AUTOMÁTICAMENTE
-- ====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ====================================================
-- TRIGGERS PARA updated_at
-- ====================================================
CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON categorias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_estados_updated_at BEFORE UPDATE ON estados FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sedes_updated_at BEFORE UPDATE ON sedes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prioridades_updated_at BEFORE UPDATE ON prioridades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_acciones_updated_at BEFORE UPDATE ON acciones_mantenimiento FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventario_updated_at BEFORE UPDATE ON inventario_general FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipos_criticos_updated_at BEFORE UPDATE ON equipos_criticos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plan_updated_at BEFORE UPDATE ON plan_mantenimiento FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ====================================================
-- COMENTARIOS EN TABLAS
-- ====================================================
COMMENT ON TABLE categorias IS 'Categorías de equipos (PC, Monitor, Impresora, etc.)';
COMMENT ON TABLE estados IS 'Estados de equipos (Operativo, Dañado, etc.)';
COMMENT ON TABLE sedes IS 'Sedes físicas de la organización';
COMMENT ON TABLE prioridades IS 'Niveles de prioridad para equipos críticos';
COMMENT ON TABLE acciones_mantenimiento IS 'Tipos de acciones de mantenimiento';
COMMENT ON TABLE inventario_general IS 'Tabla principal del inventario de equipos';
COMMENT ON TABLE equipos_criticos IS 'Equipos marcados como críticos con acciones requeridas';
COMMENT ON TABLE plan_mantenimiento IS 'Planes de mantenimiento programados para equipos';
