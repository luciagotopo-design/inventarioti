-- ==============================================================================
-- CONFIGURACIÓN DE POLÍTICAS RLS (Row Level Security)
-- ==============================================================================

-- Primero, eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Usuarios autenticados pueden leer equipos" ON equipos;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear equipos" ON equipos;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar equipos" ON equipos;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar equipos" ON equipos;

-- Habilitar RLS en todas las tablas
ALTER TABLE equipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE mantenimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE estados ENABLE ROW LEVEL SECURITY;
ALTER TABLE sedes ENABLE ROW LEVEL SECURITY;
ALTER TABLE prioridades ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipos_criticos ENABLE ROW LEVEL SECURITY;
ALTER TABLE acciones_mantenimiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_mantenimiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventario_general ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- POLÍTICAS PARA EQUIPOS
-- ==============================================================================

-- Permitir SELECT a usuarios autenticados
CREATE POLICY "equipos_select_policy" ON equipos
  FOR SELECT
  TO authenticated
  USING (true);

-- Permitir INSERT a usuarios autenticados
CREATE POLICY "equipos_insert_policy" ON equipos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Permitir UPDATE a usuarios autenticados
CREATE POLICY "equipos_update_policy" ON equipos
  FOR UPDATE
  TO authenticated
  USING (true);

-- Permitir DELETE a usuarios autenticados
CREATE POLICY "equipos_delete_policy" ON equipos
  FOR DELETE
  TO authenticated
  USING (true);

-- ==============================================================================
-- POLÍTICAS PARA MANTENIMIENTOS
-- ==============================================================================

CREATE POLICY "mantenimientos_select_policy" ON mantenimientos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "mantenimientos_insert_policy" ON mantenimientos
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "mantenimientos_update_policy" ON mantenimientos
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "mantenimientos_delete_policy" ON mantenimientos
  FOR DELETE TO authenticated USING (true);

-- ==============================================================================
-- POLÍTICAS PARA TABLAS DE CATÁLOGO
-- ==============================================================================

-- Categorías
CREATE POLICY "categorias_select_policy" ON categorias
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "categorias_insert_policy" ON categorias
  FOR INSERT TO authenticated WITH CHECK (true);

-- Estados
CREATE POLICY "estados_select_policy" ON estados
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "estados_insert_policy" ON estados
  FOR INSERT TO authenticated WITH CHECK (true);

-- Sedes
CREATE POLICY "sedes_select_policy" ON sedes
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "sedes_insert_policy" ON sedes
  FOR INSERT TO authenticated WITH CHECK (true);

-- Prioridades
CREATE POLICY "prioridades_select_policy" ON prioridades
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "prioridades_insert_policy" ON prioridades
  FOR INSERT TO authenticated WITH CHECK (true);

-- ==============================================================================
-- POLÍTICAS PARA EQUIPOS CRÍTICOS
-- ==============================================================================

CREATE POLICY "equipos_criticos_select_policy" ON equipos_criticos
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "equipos_criticos_insert_policy" ON equipos_criticos
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "equipos_criticos_update_policy" ON equipos_criticos
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "equipos_criticos_delete_policy" ON equipos_criticos
  FOR DELETE TO authenticated USING (true);

-- ==============================================================================
-- POLÍTICAS PARA ACCIONES DE MANTENIMIENTO
-- ==============================================================================

CREATE POLICY "acciones_mantenimiento_select_policy" ON acciones_mantenimiento
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "acciones_mantenimiento_insert_policy" ON acciones_mantenimiento
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "acciones_mantenimiento_update_policy" ON acciones_mantenimiento
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "acciones_mantenimiento_delete_policy" ON acciones_mantenimiento
  FOR DELETE TO authenticated USING (true);

-- ==============================================================================
-- POLÍTICAS PARA PLAN DE MANTENIMIENTO
-- ==============================================================================

CREATE POLICY "plan_mantenimiento_select_policy" ON plan_mantenimiento
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "plan_mantenimiento_insert_policy" ON plan_mantenimiento
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "plan_mantenimiento_update_policy" ON plan_mantenimiento
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "plan_mantenimiento_delete_policy" ON plan_mantenimiento
  FOR DELETE TO authenticated USING (true);

-- ==============================================================================
-- POLÍTICAS PARA INVENTARIO GENERAL
-- ==============================================================================

CREATE POLICY "inventario_general_select_policy" ON inventario_general
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "inventario_general_insert_policy" ON inventario_general
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "inventario_general_update_policy" ON inventario_general
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "inventario_general_delete_policy" ON inventario_general
  FOR DELETE TO authenticated USING (true);

-- Mensaje de confirmación
SELECT 'Políticas RLS configuradas correctamente' AS mensaje;
