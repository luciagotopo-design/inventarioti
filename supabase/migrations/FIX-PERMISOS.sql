-- SCRIPT CRÍTICO: Ejecutar PRIMERO en Supabase SQL Editor
-- Esto resolverá el problema de acceso a las tablas

-- ============================================
-- PASO 1: Verificar que las tablas existen
-- ============================================
SELECT 
    COUNT(*) as total_tablas,
    STRING_AGG(table_name, ', ') as tablas
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';

-- Si retorna 0, ejecutar schema.sql primero
-- Si retorna 8, continuar con PASO 2

-- ============================================
-- PASO 2: DESHABILITAR Row Level Security
-- ============================================
-- RLS está bloqueando el acceso desde la app
-- Solo para desarrollo/testing

ALTER TABLE IF EXISTS categorias DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS estados DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sedes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS prioridades DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS acciones_mantenimiento DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS inventario_general DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS equipos_criticos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS plan_mantenimiento DISABLE ROW LEVEL SECURITY;

-- ============================================
-- PASO 3: Verificar que hay datos
-- ============================================
SELECT 'categorias' as tabla, COUNT(*) as registros FROM categorias
UNION ALL
SELECT 'estados', COUNT(*) FROM estados
UNION ALL
SELECT 'sedes', COUNT(*) FROM sedes
UNION ALL
SELECT 'prioridades', COUNT(*) FROM prioridades
UNION ALL
SELECT 'acciones_mantenimiento', COUNT(*) FROM acciones_mantenimiento
UNION ALL
SELECT 'inventario_general', COUNT(*) FROM inventario_general
UNION ALL
SELECT 'equipos_criticos', COUNT(*) FROM equipos_criticos
UNION ALL
SELECT 'plan_mantenimiento', COUNT(*) FROM plan_mantenimiento;

-- Si retornan 0, ejecutar seed.sql e insert-equipos.sql

-- ============================================
-- PASO 4: Test de conexión básica
-- ============================================
SELECT 'Test OK: Puedo leer categorías' as mensaje, COUNT(*) as total FROM categorias;
SELECT 'Test OK: Puedo leer estados' as mensaje, COUNT(*) as total FROM estados;
SELECT 'Test OK: Puedo leer inventario' as mensaje, COUNT(*) as total FROM inventario_general;

-- ============================================
-- RESULTADO ESPERADO:
-- ============================================
-- Si todo está bien, deberías ver:
-- - 8 tablas creadas
-- - RLS deshabilitado en todas
-- - Datos en categorias, estados, sedes, etc.
-- - Test OK mostrando los conteos

-- Después de ejecutar esto, reinicia npm run dev
